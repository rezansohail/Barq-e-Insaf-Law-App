import os
import re
from dotenv import load_dotenv
from groq import Groq
import chromadb
from chromadb.utils import embedding_functions

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Retrieve API key
api_key = os.getenv("GROQ_API_KEY")
client = None
if api_key:
    client = Groq(api_key=api_key)

CHROMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "chroma_db"))
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)
collection = chroma_client.get_or_create_collection(
    name="pakistan_law",
    embedding_function=embed_fn
)

def clean_legal_text(text):
    """
    Cleans raw markdown hashes (###), stray emojis, and horizontal dividers
    to ensure output is clean, readable, professional, and user-friendly.
    """
    if not text:
        return ""
    
    # 1. Remove all emojis (Unicode ranges for emoticons, symbols, pictographs, flags, etc.)
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002702-\U000027B0"  # dingbats
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"  # Supplemental symbols
        "\U0001FA70-\U0001FAFF"  # Extended symbols
        "\U00002600-\U000026FF"  # Misc symbols (⚖, 🏛, etc.)
        "]+", flags=re.UNICODE
    )
    cleaned = emoji_pattern.sub("", text)
    
    # 2. Line-by-line processing
    lines = cleaned.split("\n")
    processed_lines = []
    for line in lines:
        stripped = line.strip()
        # Remove divider lines like --- or ___ or ***
        if re.match(r"^[-=_*]{3,}$", stripped):
            continue
        # Remove lines that are just hashes (e.g. "###")
        if re.match(r"^#+\s*$", stripped):
            continue
        # Remove markdown header hashes: "### 1. Title" -> "1. Title"
        line = re.sub(r"^\s*#{1,6}\s*", "", line)
        # Remove any inline stray hashes
        line = re.sub(r"#{2,}", "", line)
        processed_lines.append(line)
        
    cleaned = "\n".join(processed_lines)
    # Remove excessive blank lines (more than 2 consecutive newlines)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    return cleaned

def detect_user_language(text):
    """
    Detects whether text is in Urdu script, Sindhi script, Roman Urdu, or English.
    """
    if not text:
        return "English"
    
    # Check for Arabic/Persian/Urdu/Sindhi Unicode characters
    arabic_pattern = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")
    if arabic_pattern.search(text):
        # Check specifically for unique Sindhi characters
        sindhi_chars = re.compile(r"[ڳڄڱٺٿڦٽڻڙڌڏڍڪگ]")
        if sindhi_chars.search(text):
            return "Sindhi"
        return "Urdu"
    
    # Text is in Latin alphabet. Check for Roman Urdu markers
    roman_urdu_words = {
        "kya", "kia", "hai", "hain", "hy", "kaise", "kaisay", "mujhe", "mera", "meri", "mere",
        "apne", "aap", "talaq", "khula", "nikah", "shadi", "bachay", "bachon", "custody",
        "zameen", "makan", "property", "jaidad", "virasat", "hissa", "adaalat", "adalat",
        "court", "kanoon", "qanoon", "tareeqa", "tarika", "bataen", "batao", "batayein",
        "karun", "karoon", "karen", "sakta", "sakti", "nhi", "nahi", "hota", "hoti",
        "chahiye", "chaheye", "shohar", "biwi", "walid", "bhai", "behan", "dawa", "stay",
        "order", "intiqal", "fard", "registry", "kabza", "qabza", "pe", "par", "mein", "ko",
        "se", "sy", "karna", "krna", "hoga", "hogi", "bhi"
    }
    
    tokens = re.findall(r"\b[a-zA-Z]+\b", text.lower())
    if tokens:
        matches = sum(1 for t in tokens if t in roman_urdu_words)
        if matches >= 2 or (len(tokens) <= 5 and matches >= 1):
            return "Roman Urdu"
            
    return "English"

def is_basic_greeting(question):
    q = question.lower().strip()
    greetings = [
        "hi", "hello", "hey", "salam", "assalam", "assalamu alaikum", "assalam-o-alaikum",
        "good morning", "good evening", "how are you", "who are you", "what are you",
        "thanks", "thank you", "shukriya", "meherbani", "ok", "okay"
    ]
    if len(q.split()) <= 4:
        for g in greetings:
            if q == g or q.startswith(g):
                return True
    return False

def retrieve_relevant_law(question, n_results=6):
    """Queries ChromaDB and returns document chunks and their metadatas."""
    if is_basic_greeting(question):
        return [], []
        
    try:
        results = collection.query(query_texts=[question], n_results=n_results)
        if not results or not results.get("documents") or len(results["documents"][0]) == 0:
            return [], []
            
        chunks = results["documents"][0]
        metadatas = results["metadatas"][0]
        return chunks, metadatas
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return [], []

def ask_legal_question(question, model_name="qwen/qwen3.8-27b", temperature=0.3, n_results=6, language="Auto-Detect"):
    """
    Retrieves law chunks, queries the Groq API model, and returns a structured response with exact citations.
    """
    global client
    if not client:
        api_key = os.getenv("GROQ_API_KEY")
        if api_key:
            client = Groq(api_key=api_key)
        else:
            return {
                "answer": "Error: GROQ_API_KEY is not configured in .env. Please set your key.",
                "sources": []
            }

    # Determine response language
    if not language or language == "Auto-Detect":
        target_language = detect_user_language(question)
    else:
        target_language = language

    chunks, metadatas = retrieve_relevant_law(question, n_results=n_results)

    formatted_sources = []
    context_parts = []
    
    for idx, (chunk, meta) in enumerate(zip(chunks, metadatas)):
        source_name = meta.get("source", "Unknown Law Document")
        page_num = meta.get("page", 1)
        snippet = meta.get("snippet", chunk[:90].strip())
        
        # Context block for the LLM
        context_parts.append(f"[Source {idx+1}: {source_name} | Page: {page_num}]\n{chunk}")
        
        # Structured citation for the frontend / mobile app
        formatted_sources.append({
            "id": f"src_{idx}",
            "source": source_name,
            "page": page_num,
            "snippet": snippet,
            "text": chunk
        })

    context = "\n\n---\n\n".join(context_parts) if context_parts else "No specific statutory chunks found. Rely on verified Pakistan federal and Sindh provincial law."

    system_prompt = f"""You are "Barq-e-Insaf" (برقِ انصاف) - an expert AI legal information assistant for Pakistan.
You assist citizens and lawyers with accurate legal information based on Pakistan statutory laws (Family Laws, Civil Procedure Code (CPC), Guardians and Wards Act, Child Marriage Restraint Act, Contract Act, Specific Relief Act, Transfer of Property Act, Land Revenue Acts, Succession Act, and Sindh provincial laws).

LANGUAGE REQUIREMENT:
The user has asked in: **{target_language}**.
You MUST answer completely and naturally in **{target_language}**.

Instructions per language:
- If **Roman Urdu**: Answer in natural, fluent, respectful Roman Urdu (e.g. "Aap Family Courts Act 1964 ke mutabiq khula ya dower (haq mehr) ka daawa family court mein dakhil kar sakti hain..."). Explain legal terms simply in Roman Urdu.
- If **Urdu** (اردو): Answer in formal, clear Urdu using proper Nastaliq vocabulary (معاہدہ, ثالثی, سرپرستی, حق مہر, دعویٰ). NEVER use Hindi words like پتنی or پیتا.
- If **Sindhi** (سنڌي): Answer in standard Sindhi with authentic Sindhi legal terms (اقرارنامو, والد/پيءُ, حق مهر, سنڌ فيملي ڪورٽس ايڪٽ).
- If **English**: Answer in professional, structured English suitable for legal clarity.

LEGAL ACCURACY & CITATION RULES:
1. Ground your answer in the provided legal context whenever relevant.
2. Clearly mention the relevant Act, Ordinance, or Code and Section numbers (e.g. "Family Courts Act 1964 Section 5", "Code of Civil Procedure Order 39 Rules 1 & 2", "Transfer of Property Act Section 54").
3. If the context does not contain the exact detail, you may rely on established Pakistani legal principles, but state "(general legal principle in Pakistan)".
4. Structure your response with bullet points and clear steps if describing a legal procedure.
5. End with the legal awareness disclaimer:
   - In English: "Note: This is general legal information and does not constitute formal legal counsel. For court representation, consult a licensed advocate."
   - In Roman Urdu: "Note: Yeh maloomat qanooni aagahi ke liye hain. Adalati karwayi ke liye kisi verified licensed wakeel se rujoo karein."
   - In Urdu: "نوٹ: یہ معلومات قانونی آگاہی کے لیے ہیں۔ عدالتی کارروائی کے لیے کسی مستند وکیل سے رجوع کریں۔"
   - In Sindhi: "نوٽ: اها معلومات قانوني ڄاڻ لاءِ آهي. عدالتي معاملي لاءِ ڪنهن وڪيل سان رابطو ڪريو."

CRITICAL FORMATTING RULES (STRICT COMPLIANCE REQUIRED):
- DO NOT use markdown headers or hashes (NEVER output '#', '##', or '###').
- For titles or sections, use clean numbered headings like "1. Filing the Petition:" or plain capitalized text.
- DO NOT use any emojis (never output emojis like ⚖️, 📜, 🏛️, 🕌, etc.). Keep the response clean and professional.
- DO NOT use divider dashes or lines (like '---' or '___').
- Keep your answer direct, structured, and complete. Always finish all numbered steps and the final disclaimer without cutting off.
"""

    user_message = f"""Legal Context from Pakistani Law Books:
{context}

User's Question:
{question}
"""

    try:
        response = client.chat.completions.create(
            model=model_name,
            max_tokens=850,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
        )
        raw_answer = response.choices[0].message.content or ""
        answer = clean_legal_text(raw_answer)
        return {
            "answer": answer,
            "sources": formatted_sources,
            "detected_language": target_language
        }
    except Exception as e:
        print(f"Error querying Groq LLM: {e}")
        return {
            "answer": f"Error communicating with AI service: {str(e)}",
            "sources": formatted_sources,
            "detected_language": target_language
        }

if __name__ == "__main__":
    print("=== Barq-e-Insaf Multilingual Legal AI Test ===")
    test_q = "Mujhe khula lene ka tarika batayein aur haq mehr ka kya hoga?"
    res = ask_legal_question(test_q)
    print("\nDetected Language:", res.get("detected_language"))
    print("\nAnswer:\n", res["answer"])
    print("\nSources Cited:")
    for s in res["sources"]:
        print(f"- {s['source']} (Page {s['page']})")

import os
import glob
import sys
import chromadb
from chromadb.utils import embedding_functions

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding="utf-8")

try:
    from pypdf import PdfReader
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    from pypdf import PdfReader

CHROMA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "chroma_db"))
PDF_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "raw_pdfs"))
COLLECTION_NAME = "pakistan_law"

ocr_engine = None

def get_ocr_engine():
    global ocr_engine
    if ocr_engine is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            ocr_engine = RapidOCR()
            print("  [OCR] RapidOCR engine loaded for scanned PDF images.")
        except Exception as e:
            print(f"  [OCR Warning] Could not load RapidOCR: {e}")
    return ocr_engine

def clean_text(t):
    if not t:
        return ""
    # Normalize excessive newlines and spaces
    lines = [line.strip() for line in t.splitlines() if line.strip()]
    return " ".join(lines)

def chunk_text(text, chunk_size=800, chunk_overlap=150):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end < len(text):
            search_area = text[end-100:end]
            last_space = max(search_area.rfind(' '), search_area.rfind('\n'))
            if last_space != -1:
                end = end - 100 + last_space + 1
        
        c = text[start:end].strip()
        if len(c) > 30:
            chunks.append(c)
        start = end - chunk_overlap
    return chunks

def extract_page_text(page, page_num, filename):
    text = page.extract_text() or ""
    clean = clean_text(text)
    
    # If standard PDF text is missing or extremely sparse, run OCR on embedded images
    if len(clean) < 40 and len(page.images) > 0:
        engine = get_ocr_engine()
        if engine:
            ocr_fragments = []
            for img_name, img_obj in page.images.items():
                try:
                    res, _ = engine(img_obj.data)
                    if res:
                        for box in res:
                            txt = box[1].strip()
                            if txt:
                                ocr_fragments.append(txt)
                except Exception as ex:
                    pass
            if ocr_fragments:
                ocr_combined = " ".join(ocr_fragments)
                print(f"  [Page {page_num}] Scanned image detected -> OCR extracted {len(ocr_combined)} chars")
                return ocr_combined
    return clean

def ingest_pdfs(force=False):
    print(f"Initializing ChromaDB at {CHROMA_PATH}...")
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
    
    print("Loading embedding function (SentenceTransformers all-MiniLM-L6-v2)...")
    embed_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embed_fn
    )
    
    pdf_files = sorted(glob.glob(os.path.join(PDF_DIR, "*.pdf")))
    if not pdf_files:
        print(f"No PDF files found in {PDF_DIR}!")
        return 0
        
    print(f"Found {len(pdf_files)} PDF file(s) in {PDF_DIR}.")
    total_added = 0
    
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        
        # Check if already ingested unless force=True
        if not force:
            try:
                existing = collection.get(where={"source": filename}, limit=1)
                if existing and existing.get("ids") and len(existing["ids"]) > 0:
                    print(f"SKIP (Already Ingested): {filename}")
                    continue
            except Exception:
                pass
                
        print(f"\nProcessing: {filename}...")
        
        try:
            reader = PdfReader(pdf_path)
            total_pages = len(reader.pages)
            print(f"  Total pages: {total_pages}")
            
            documents = []
            metadatas = []
            ids = []
            
            for page_idx in range(total_pages):
                page_num = page_idx + 1
                page = reader.pages[page_idx]
                page_text = extract_page_text(page, page_num, filename)
                
                if not page_text or len(page_text.strip()) < 30:
                    continue
                    
                chunks = chunk_text(page_text)
                for c_idx, chunk in enumerate(chunks):
                    chunk_id = f"{filename}_p{page_num}_c{c_idx}"
                    # Snippet for frontend highlighting
                    words = chunk.split()
                    snippet = " ".join(words[:12]) if len(words) >= 12 else chunk[:80]
                    
                    documents.append(chunk)
                    metadatas.append({
                        "source": filename,
                        "page": page_num,
                        "chunk_index": c_idx,
                        "snippet": snippet
                    })
                    ids.append(chunk_id)
            
            if documents:
                print(f"  Ingesting {len(documents)} chunks into ChromaDB...")
                batch_size = 100
                for i in range(0, len(documents), batch_size):
                    collection.upsert(
                        documents=documents[i:i+batch_size],
                        metadatas=metadatas[i:i+batch_size],
                        ids=ids[i:i+batch_size]
                    )
                total_added += len(documents)
                print(f"  [SUCCESS] {filename} ingested ({len(documents)} chunks).")
            else:
                print(f"  [WARN] No readable text found in {filename}.")
                
        except Exception as e:
            print(f"  [ERROR] Failed to process {filename}: {e}")
            
    final_count = collection.count()
    print(f"\nIngestion process complete! Total chunks now in ChromaDB: {final_count}")
    return final_count

if __name__ == "__main__":
    force_run = "--force" in sys.argv
    ingest_pdfs(force=force_run)

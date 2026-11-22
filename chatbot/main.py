import os
import sys
import glob
from flask import Flask, request, jsonify, send_from_directory, abort
from chatbot import ask_legal_question, collection
from ingest import ingest_pdfs
from dotenv import load_dotenv

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

try:
    from flask_cors import CORS
    has_cors = True
except ImportError:
    has_cors = False

app = Flask(__name__, static_folder="static", static_url_path="")

if has_cors:
    CORS(app, resources={r"/*": {"origins": "*"}})
else:
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,PUT,POST,DELETE,OPTIONS"
        return response

# Serve static frontend dashboard
@app.route("/")
def index():
    return send_from_directory("static", "index.html")

# Serve Raw Legal PDFs for the Inspector and App Viewer
@app.route("/api/pdf/<path:filename>")
def serve_pdf(filename):
    pdf_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "raw_pdfs"))
    target_path = os.path.abspath(os.path.join(pdf_dir, filename))
    
    # Directory traversal prevention
    if not target_path.startswith(pdf_dir):
        return abort(403)
        
    if not os.path.isfile(target_path):
        return jsonify({"error": f"PDF file '{filename}' not found."}), 404
        
    return send_from_directory(pdf_dir, filename, mimetype="application/pdf")

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json or {}
    message = data.get("message", "")
    model = data.get("model", "qwen/qwen3.8-27b")
    temperature = float(data.get("temperature", 0.3))
    n_results = int(data.get("n_results", 6))
    language = data.get("language", "Auto-Detect")
    
    if not message.strip():
        return jsonify({"error": "Message is required"}), 400
        
    print(f"Chat request: '{message}' | Model: {model} | Temp: {temperature} | Lang: {language}")
    
    response = ask_legal_question(
        question=message,
        model_name=model,
        temperature=temperature,
        n_results=n_results,
        language=language
    )
    
    return jsonify(response)

@app.route("/api/status", methods=["GET"])
def status():
    pdf_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "raw_pdfs"))
    pdf_files = sorted(glob.glob(os.path.join(pdf_dir, "*.pdf")))
    
    files_status = []
    total_chunks = 0
    
    try:
        total_chunks = collection.count()
    except Exception as e:
        print(f"Error counting collection: {e}")
        
    for pdf_path in pdf_files:
        filename = os.path.basename(pdf_path)
        size_mb = round(os.path.getsize(pdf_path) / (1024 * 1024), 2)
        
        try:
            res = collection.get(where={"source": filename}, limit=1)
            is_ingested = len(res.get("ids", [])) > 0
        except Exception:
            is_ingested = False
            
        files_status.append({
            "name": filename,
            "size_mb": size_mb,
            "ingested": is_ingested
        })
        
    return jsonify({
        "document_count": total_chunks,
        "files": files_status,
        "api_key_set": os.getenv("GROQ_API_KEY") is not None
    })

@app.route("/api/ingest", methods=["POST"])
def run_ingest():
    print("Ingestion triggered via API...")
    try:
        force = request.json.get("force", False) if request.json else False
        total_chunks = ingest_pdfs(force=force)
        return jsonify({
            "status": "success",
            "message": "Ingestion completed successfully",
            "document_count": total_chunks
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Ingestion failed: {str(e)}"
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting Barq-e-Insaf Chatbot API server on http://127.0.0.1:{port} ...")
    app.run(host="0.0.0.0", port=port, debug=False)

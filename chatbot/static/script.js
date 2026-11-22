// Application State
let currentSources = [];
let isSubmitting = false;
let activeInspectorMode = "excerpt"; // "excerpt" or "pdf"

// DOM Elements
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const modelSelect = document.getElementById("model-select");
const langSelect = document.getElementById("lang-select");
const tempSlider = document.getElementById("temp-slider");
const tempValue = document.getElementById("temp-value");
const fileList = document.getElementById("file-list");
const chunkCount = document.getElementById("chunk-count");
const reingestBtn = document.getElementById("reingest-btn");
const inspectorPane = document.getElementById("inspector-pane");
const inspectorBody = document.getElementById("inspector-body");
const inspectorTabs = document.getElementById("inspector-tabs");
const inspectorDocTitle = document.getElementById("inspector-doc-title");
const inspectorPagePill = document.getElementById("inspector-page-pill");
const openPdfExternalBtn = document.getElementById("open-pdf-external-btn");
const closeInspectorBtn = document.getElementById("close-inspector-btn");
const toast = document.getElementById("toast");

// Check if admin mode is enabled via URL parameters (?admin=true)
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get("admin") === "true";

// Setup Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    if (isAdmin) {
        document.querySelectorAll(".admin-only").forEach(el => {
            el.style.display = "block";
        });
        fetchStatus();
    }
    
    // Slider value update
    if (tempSlider) {
        tempSlider.addEventListener("input", (e) => {
            tempValue.textContent = e.target.value;
        });
    }

    // Auto-grow textarea
    chatInput.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight - 16) + "px";
    });

    // Handle Enter to submit, Shift+Enter for newline
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event("submit"));
        }
    });

    // Chat form submit
    chatForm.addEventListener("submit", handleChatSubmit);

    // Re-ingest button click
    if (reingestBtn) {
        reingestBtn.addEventListener("click", handleReingest);
    }

    // Inspector close button
    closeInspectorBtn.addEventListener("click", closeInspector);

    // Dynamic prompt chips click handler
    document.addEventListener("click", (e) => {
        const chip = e.target.closest(".prompt-chip");
        if (chip) {
            const question = chip.getAttribute("data-question");
            chatInput.value = question;
            chatInput.dispatchEvent(new Event("input"));
            chatInput.focus();
        }
    });
    
    if (window.lucide) {
        lucide.createIcons();
    }
});

// Toast notification helper
function showToast(message, type = "success") {
    toast.className = `toast ${type} show`;
    toast.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        <span>${message}</span>
    `;
    if (window.lucide) lucide.createIcons();
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

// Check if string contains RTL (Urdu/Sindhi) script
function isRtlText(text) {
    const rtlPattern = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return rtlPattern.test(text);
}

// Markdown to HTML Formatter
function parseMarkdown(text) {
    if (!text) return "";
    
    // Strip emojis
    let clean = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');
    
    // Strip divider lines (--- or ___)
    clean = clean.replace(/^[-=_*]{3,}$/gm, '');

    // Strip leading hashes (### Header -> Header)
    clean = clean.replace(/^#{1,6}\s*(.*)$/gm, '<strong>$1</strong>');
    clean = clean.replace(/#{2,}/g, '');

    let html = clean
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
        
    // Format bold text (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Lists
    const lines = html.split('\n');
    let inList = false;
    let listType = null;
    let newLines = [];
    
    for (let line of lines) {
        let trimmed = line.trim();
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            if (!inList || listType !== 'ul') {
                if (inList) newLines.push(`</${listType}>`);
                newLines.push('<ul>');
                inList = true;
                listType = 'ul';
            }
            newLines.push(`<li>${trimmed.substring(2)}</li>`);
        } else if (/^\d+\.\s/.test(trimmed)) {
            if (!inList || listType !== 'ol') {
                if (inList) newLines.push(`</${listType}>`);
                newLines.push('<ol>');
                inList = true;
                listType = 'ol';
            }
            const content = trimmed.replace(/^\d+\.\s/, '');
            newLines.push(`<li>${content}</li>`);
        } else {
            if (inList) {
                newLines.push(`</${listType}>`);
                inList = false;
                listType = null;
            }
            newLines.push(line);
        }
    }
    if (inList) newLines.push(`</${listType}>`);
    
    html = newLines.join('\n');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<br><ul>/g, '<ul>');
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<br><ol>/g, '<ol>');
    html = html.replace(/<\/ol><br>/g, '</ol>');
    html = html.replace(/<li>(.*?)<\/li><br>/g, '<li>$1</li>');
    
    return html;
}

// Fetch DB status & PDF files
async function fetchStatus() {
    try {
        const res = await fetch("/api/status");
        const data = await res.json();
        
        if (chunkCount) chunkCount.textContent = data.document_count || 0;
        if (!fileList) return;
        
        fileList.innerHTML = "";
        if (!data.files || data.files.length === 0) {
            fileList.innerHTML = `<li class="loading-files">No PDFs found</li>`;
            return;
        }
        
        data.files.forEach(file => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="file-info">
                    <div class="file-name" title="${file.name}">${file.name}</div>
                    <div class="file-meta">${file.size_mb} MB</div>
                </div>
                <span class="status-badge ${file.ingested ? 'ingested' : 'pending'}">
                    ${file.ingested ? 'Ingested' : 'Pending'}
                </span>
            `;
            fileList.appendChild(li);
        });
        
        if (!data.api_key_set) {
            showToast("Warning: GROQ_API_KEY is not set in backend .env file!", "error");
        }
    } catch (err) {
        console.error("Error fetching status:", err);
        if (fileList) fileList.innerHTML = `<li class="loading-files" style="color: #ef4444;">API server offline</li>`;
    }
}

// Handle trigger pdf ingestion
async function handleReingest() {
    reingestBtn.classList.add("spinning");
    reingestBtn.disabled = true;
    showToast("Starting PDF Ingestion & OCR... please wait.", "success");
    
    try {
        const res = await fetch("/api/ingest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ force: true })
        });
        const data = await res.json();
        
        if (data.status === "success") {
            showToast(`Ingestion complete! ${data.document_count} chunks indexed.`, "success");
        } else {
            showToast(`Ingestion failed: ${data.message}`, "error");
        }
    } catch (err) {
        showToast("Error communicating with ingestion server.", "error");
    } finally {
        reingestBtn.classList.remove("spinning");
        reingestBtn.disabled = false;
        fetchStatus();
    }
}

// Handle Chat Form Submit
async function handleChatSubmit(e) {
    e.preventDefault();
    
    const messageText = chatInput.value.trim();
    if (!messageText || isSubmitting) return;
    
    isSubmitting = true;
    
    appendMessage(messageText, "user");
    
    chatInput.value = "";
    chatInput.style.height = "auto";
    
    const typingIndicator = appendTypingIndicator();
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    const model = modelSelect ? modelSelect.value : "qwen/qwen3.8-27b";
    const temperature = tempSlider ? tempSlider.value : 0.3;
    const language = langSelect ? langSelect.value : "Auto-Detect";
    
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: messageText,
                model: model,
                temperature: temperature,
                language: language
            })
        });
        
        const data = await res.json();
        typingIndicator.remove();
        
        if (data.error) {
            appendMessage(`Error: ${data.error}`, "bot", [], true);
        } else {
            appendMessage(data.answer, "bot", data.sources, false, data.detected_language);
        }
    } catch (err) {
        typingIndicator.remove();
        appendMessage("Error communicating with legal AI server. Please make sure run_chatbot.bat is active.", "bot", [], true);
    } finally {
        isSubmitting = false;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Append Chat Message
function appendMessage(text, sender, sources = [], isError = false, detectedLang = null) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", `${sender}-msg`);
    
    const isRtl = isRtlText(text);
    if (isRtl) {
        messageDiv.classList.add("urdu-text");
    }
    if (isError) {
        messageDiv.style.borderColor = "#ef4444";
    }

    const icon = sender === "user" ? "👤" : "⚖️";
    const parsedContent = parseMarkdown(text);
    
    let citationsHTML = "";
    if (sources && sources.length > 0) {
        citationsHTML = `
            <div class="citations-container">
                <span class="citations-label"><i data-lucide="bookmark"></i> Cited Legal References (Click to view PDF):</span>
                <div class="citations-pills">
                    ${sources.map((src, i) => `
                        <button type="button" class="citation-tag" onclick="inspectSource(${i})">
                            <i data-lucide="file-text"></i>
                            <span>Ref ${i+1}: ${src.source.replace('.pdf', '')} (p. ${src.page})</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        currentSources = sources;
    }
    
    let langPill = "";
    if (detectedLang && sender === "bot") {
        langPill = `<span class="lang-indicator-pill"><i data-lucide="globe"></i> ${detectedLang}</span>`;
    }
    
    messageDiv.innerHTML = `
        <div class="msg-icon">${icon}</div>
        <div class="msg-content">
            ${langPill}
            <div class="msg-text">${parsedContent}</div>
            ${citationsHTML}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    if (window.lucide) lucide.createIcons();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Append Typing Indicator
function appendTypingIndicator() {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", "bot-msg");
    messageDiv.innerHTML = `
        <div class="msg-icon">⚖️</div>
        <div class="msg-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    return messageDiv;
}

// Inspect Source Citation (Open right-hand inspector with PDF Viewer & Highlights)
window.inspectSource = function(index) {
    const source = currentSources[index];
    if (!source) return;
    
    inspectorPane.classList.add("active");
    if (inspectorTabs) inspectorTabs.style.display = "flex";
    
    // Set Header
    inspectorDocTitle.innerHTML = `<i data-lucide="file-text"></i> ${source.source}`;
    inspectorPagePill.textContent = `Page ${source.page}`;
    
    // Setup External PDF Link
    const pdfUrl = `/api/pdf/${encodeURIComponent(source.source)}#page=${source.page}`;
    if (openPdfExternalBtn) {
        openPdfExternalBtn.href = pdfUrl;
        openPdfExternalBtn.style.display = "inline-flex";
    }
    
    // Highlight matched passage in text
    let highlightedText = source.text;
    const snippet = source.snippet || "";
    if (snippet && snippet.length > 5) {
        const cleanSnippet = snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const reg = new RegExp(`(${cleanSnippet})`, "gi");
        highlightedText = highlightedText.replace(reg, '<mark class="pdf-highlight">$1</mark>');
    }
    
    inspectorBody.innerHTML = `
        <!-- View 1: Highlighted Text View -->
        <div id="inspector-excerpt-view" class="source-detail-card" style="display: ${activeInspectorMode === 'excerpt' ? 'block' : 'none'};">
            <div class="citation-meta-row">
                <span class="law-title">${source.source}</span>
                <span class="law-page">Page ${source.page}</span>
            </div>
            <div class="law-text-content">${highlightedText}</div>
            <div class="view-pdf-prompt">
                <button type="button" class="open-tab-btn" onclick="switchInspectorTab('pdf')">
                    <i data-lucide="eye"></i> View Live PDF Page ${source.page}
                </button>
            </div>
        </div>

        <!-- View 2: Live Embedded PDF Viewer -->
        <div id="inspector-pdf-view" style="display: ${activeInspectorMode === 'pdf' ? 'flex' : 'none'}; flex-direction: column; height: 100%; flex: 1;">
            <iframe id="pdf-viewer-frame" src="${pdfUrl}" style="width: 100%; height: 600px; border: none; background: #0f172a; border-radius: 8px;"></iframe>
        </div>
    `;
    
    if (window.lucide) lucide.createIcons();
};

// Switch Between Excerpt View & Live PDF Page View
window.switchInspectorTab = function(tabName) {
    activeInspectorMode = tabName;
    const excerptBtn = document.getElementById("tab-excerpt-btn");
    const pdfBtn = document.getElementById("tab-pdf-btn");
    const excerptView = document.getElementById("inspector-excerpt-view");
    const pdfView = document.getElementById("inspector-pdf-view");
    
    if (tabName === 'pdf') {
        if (excerptBtn) excerptBtn.classList.remove('active');
        if (pdfBtn) pdfBtn.classList.add('active');
        if (excerptView) excerptView.style.display = 'none';
        if (pdfView) pdfView.style.display = 'flex';
    } else {
        if (pdfBtn) pdfBtn.classList.remove('active');
        if (excerptBtn) excerptBtn.classList.add('active');
        if (pdfView) pdfView.style.display = 'none';
        if (excerptView) excerptView.style.display = 'block';
    }
};

// Close Inspector Pane
function closeInspector() {
    inspectorPane.classList.remove("active");
}

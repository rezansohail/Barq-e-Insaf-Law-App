// Shared controller/store for opening and controlling the AI Chatbot across screens
const chatListeners = new Set();

let isChatOpen = false;
let pendingQuery = '';

export function openAIChat(initialQuery = '') {
  isChatOpen = true;
  pendingQuery = (typeof initialQuery === 'string' ? initialQuery : '').trim();
  notifyChatListeners();
}

export function closeAIChat() {
  isChatOpen = false;
  pendingQuery = '';
  notifyChatListeners();
}

export function getChatState() {
  return { isOpen: isChatOpen, query: pendingQuery };
}

export function clearPendingQuery() {
  pendingQuery = '';
}

function notifyChatListeners() {
  const state = { isOpen: isChatOpen, query: pendingQuery };
  chatListeners.forEach((fn) => {
    try {
      fn(state);
    } catch (_) {}
  });
}

export function subscribeToChat(fn) {
  chatListeners.add(fn);
  return () => chatListeners.delete(fn);
}

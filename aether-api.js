// Aether Academic — Real API Client
// Drop this script into every HTML page to replace the direct Gemini calls
// with calls to the Python FastAPI backend.

const API_BASE = window.location.origin; // Same-origin when served by FastAPI

// ─────────────────────────────────────────────
// TOKEN / AUTH HELPERS
// ─────────────────────────────────────────────
const AetherAuth = {
    getToken() { return localStorage.getItem('AETHER_TOKEN'); },
    setToken(t) { localStorage.setItem('AETHER_TOKEN', t); },
    getWorkspaceId() { return localStorage.getItem('AETHER_WORKSPACE_ID'); },
    setWorkspaceId(id) { localStorage.setItem('AETHER_WORKSPACE_ID', id); },
    getUserId() { return localStorage.getItem('AETHER_USER_ID'); },
    clear() {
        ['AETHER_TOKEN','AETHER_WORKSPACE_ID','AETHER_USER_ID','AETHER_USER_NAME'].forEach(k => localStorage.removeItem(k));
    },
    isLoggedIn() { return !!this.getToken(); },
    redirectToLogin() { window.location.href = '/login.html'; },
    requireAuth() {
        if (!this.isLoggedIn()) this.redirectToLogin();
    }
};

// ─────────────────────────────────────────────
// BASE FETCH WRAPPER
// ─────────────────────────────────────────────
async function apiFetch(path, options = {}) {
    const token = AetherAuth.getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401) { AetherAuth.clear(); AetherAuth.redirectToLogin(); }
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Request failed');
    }
    return res;
}

async function apiJSON(path, options = {}) {
    const res = await apiFetch(path, options);
    return res.json();
}

// ─────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────
const AetherAPI = {

    async register(name, email, password) {
        const data = await apiJSON('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
        AetherAuth.setToken(data.token);
        AetherAuth.setWorkspaceId(data.default_workspace_id);
        localStorage.setItem('AETHER_USER_NAME', data.user.name);
        localStorage.setItem('AETHER_USER_ID', data.user.id);
        return data;
    },

    async login(email, password) {
        const data = await apiJSON('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        AetherAuth.setToken(data.token);
        AetherAuth.setWorkspaceId(data.default_workspace_id);
        localStorage.setItem('AETHER_USER_NAME', data.user.name);
        localStorage.setItem('AETHER_USER_ID', data.user.id);
        return data;
    },

    // ─── SOURCES ────────────────────────────
    async uploadFile(workspaceId, file, onProgress) {
        const token = AetherAuth.getToken();
        const formData = new FormData();
        formData.append('workspace_id', workspaceId);
        formData.append('file', file);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_BASE}/api/sources/upload`);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            if (onProgress) xhr.upload.addEventListener('progress', e => {
                if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100));
            });
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
                else reject(new Error(JSON.parse(xhr.responseText)?.detail || 'Upload failed'));
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(formData);
        });
    },

    async ingestURL(workspaceId, url, name) {
        return apiJSON('/api/sources/ingest-url', {
            method: 'POST',
            body: JSON.stringify({ workspace_id: workspaceId, url, name }),
        });
    },

    async getSources(workspaceId) {
        return apiJSON(`/api/sources?workspace_id=${workspaceId}`);
    },

    async getSourceStatus(sourceId) {
        return apiJSON(`/api/sources/${sourceId}/status`);
    },

    async deleteSource(sourceId) {
        return apiJSON(`/api/sources/${sourceId}`, { method: 'DELETE' });
    },

    async pollSourceReady(sourceId, intervalMs = 2000, maxWaitMs = 120000) {
        const start = Date.now();
        return new Promise((resolve, reject) => {
            const poll = async () => {
                try {
                    const data = await this.getSourceStatus(sourceId);
                    if (data.status === 'ready') return resolve(data);
                    if (data.status === 'error') return reject(new Error(data.error_message || 'Processing failed'));
                    if (Date.now() - start > maxWaitMs) return reject(new Error('Processing timed out'));
                    setTimeout(poll, intervalMs);
                } catch (e) { reject(e); }
            };
            poll();
        });
    },

    // ─── CHAT ────────────────────────────────
    async streamChat(workspaceId, message, chatId, sourceIds, callbacks) {
        // callbacks: { onMeta, onDelta, onDone, onError }
        const token = AetherAuth.getToken();
        const res = await fetch(`${API_BASE}/api/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                workspace_id: workspaceId,
                message,
                chat_id: chatId || null,
                source_ids: sourceIds || null,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            if (callbacks.onError) callbacks.onError(err.detail || 'Chat failed');
            return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const raw = line.slice(6).trim();
                if (raw === '[DONE]') { if (callbacks.onDone) callbacks.onDone(); continue; }
                try {
                    const msg = JSON.parse(raw);
                    if (msg.type === 'meta' && callbacks.onMeta) callbacks.onMeta(msg);
                    if (msg.type === 'delta' && callbacks.onDelta) callbacks.onDelta(msg.content);
                    if (msg.type === 'error' && callbacks.onError) callbacks.onError(msg.message);
                } catch {}
            }
        }
    },

    async getChats(workspaceId) {
        return apiJSON(`/api/chat?workspace_id=${workspaceId}`);
    },

    async getMessages(chatId) {
        return apiJSON(`/api/chat/${chatId}/messages`);
    },

    // ─── FLASHCARDS ──────────────────────────
    async generateFlashcards(workspaceId, sourceId, count = 15, cardTypes) {
        return apiJSON('/api/flashcards/generate', {
            method: 'POST',
            body: JSON.stringify({
                workspace_id: workspaceId,
                source_id: sourceId || null,
                count,
                card_types: cardTypes || ['qa', 'definition', 'cloze'],
            }),
        });
    },

    async getFlashcards(workspaceId, dueOnly = false) {
        return apiJSON(`/api/flashcards?workspace_id=${workspaceId}&due_only=${dueOnly}`);
    },

    async reviewFlashcard(cardId, quality) {
        return apiJSON(`/api/flashcards/${cardId}/review`, {
            method: 'POST',
            body: JSON.stringify({ quality }),
        });
    },

    async updateFlashcard(cardId, data) {
        return apiJSON(`/api/flashcards/${cardId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    async deleteFlashcard(cardId) {
        return apiJSON(`/api/flashcards/${cardId}`, { method: 'DELETE' });
    },

    // ─── QUIZZES ─────────────────────────────
    async generateQuiz(workspaceId, sourceId, difficulty = 'medium', count = 10, types) {
        return apiJSON('/api/quizzes/generate', {
            method: 'POST',
            body: JSON.stringify({
                workspace_id: workspaceId,
                source_id: sourceId || null,
                difficulty,
                question_count: count,
                question_types: types || ['mcq', 'true_false', 'short_answer'],
            }),
        });
    },

    async getQuiz(quizId) {
        return apiJSON(`/api/quizzes/${quizId}`);
    },

    async getQuizzes(workspaceId) {
        return apiJSON(`/api/quizzes?workspace_id=${workspaceId}`);
    },

    async submitQuizAttempt(quizId, answers) {
        return apiJSON(`/api/quizzes/${quizId}/attempt`, {
            method: 'POST',
            body: JSON.stringify({ answers }),
        });
    },

    // ─── SUMMARIES ───────────────────────────
    async generateSummary(workspaceId, sourceId, summaryType = 'concise') {
        return apiJSON('/api/summaries/generate', {
            method: 'POST',
            body: JSON.stringify({
                workspace_id: workspaceId,
                source_id: sourceId || null,
                summary_type: summaryType,
            }),
        });
    },

    async getSummaries(workspaceId) {
        return apiJSON(`/api/summaries?workspace_id=${workspaceId}`);
    },

    // ─── KNOWLEDGE GRAPH ─────────────────────
    async generateKnowledgeGraph(workspaceId, sourceId) {
        return apiJSON('/api/knowledge-graph/generate', {
            method: 'POST',
            body: JSON.stringify({
                workspace_id: workspaceId,
                source_id: sourceId || null,
            }),
        });
    },

    // ─── WORKSPACES ──────────────────────────
    async getWorkspaces() {
        return apiJSON('/api/workspaces');
    },

    async createWorkspace(name, description = '') {
        return apiJSON('/api/workspaces', {
            method: 'POST',
            body: JSON.stringify({ name, description }),
        });
    },
};

// ─────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────

/** Show a toast notification */
function showToast(message, type = 'info') {
    let toast = document.getElementById('aether-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'aether-toast';
        toast.style.cssText = `
            position:fixed; bottom:24px; right:24px; z-index:9999;
            padding:12px 20px; border-radius:12px; font-size:14px;
            font-family:Inter,sans-serif; font-weight:500; max-width:360px;
            box-shadow:0 8px 30px rgba(0,0,0,0.4); transition:opacity 0.3s;
            backdrop-filter:blur(20px);
        `;
        document.body.appendChild(toast);
    }
    const colors = {
        success: 'background:rgba(34,197,94,0.15);color:#4ade80;border:1px solid rgba(74,222,128,0.3)',
        error:   'background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(248,113,113,0.3)',
        info:    'background:rgba(201,191,255,0.1);color:#c9bfff;border:1px solid rgba(201,191,255,0.2)',
        warning: 'background:rgba(251,191,36,0.1);color:#fbbf24;border:1px solid rgba(251,191,36,0.2)',
    };
    toast.style.cssText += colors[type] || colors.info;
    toast.textContent = message;
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.opacity = '0'; }, 4000);
}

/** Set a button into loading state. Returns restore function. */
function setButtonLoading(btn, text = 'Processing...') {
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;display:inline-block">refresh</span> ${text}`;
    return () => { btn.innerHTML = orig; btn.disabled = false; };
}

/** Inject global spin keyframe */
(function() {
    if (!document.getElementById('aether-spin-style')) {
        const s = document.createElement('style');
        s.id = 'aether-spin-style';
        s.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
        document.head.appendChild(s);
    }
})();

// Make available globally
window.AetherAPI = AetherAPI;
window.AetherAuth = AetherAuth;
window.showToast = showToast;
window.setButtonLoading = setButtonLoading;

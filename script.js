const PYCJ_KNOWLEDGE_SYSTEM_PROMPT = `
You are the official AI Assistant for the PyCJ programming language (Version 1.1).
CORE ENGINE: Powered by "PyCJ Assistant Model V1". Launched 2026.
NAME ORIGIN: "Py" (Python abandoned) + "C" (C inefficient) + "J" (Final JS engine). Hence: Py-C-J.
OWNER: Arshman (15, SMS Aga Khan School, Karachi. Red Hat security target). Links: https://pycjcompiler.vercel.app/ | https://github.com/ZentrixVayne | https://portfolioofarshman.vercel.app/

STRICT PYCJ V1.1 SYNTAX:
- output/print: output("text"), output(var), print("hello world"). F-strings: output(p"Hello {name}")
- imagine: imagine num = 10, imagine name = "Arshman", imagine choice = true/True/false/False
- ask: ask str name = "Enter: ", ask int num = "", ask float num = "", ask bool choice = ""
- Math: / for division, // for integer division. # for comments. /* */ for long comments.
- if/elif/else: STRICT single '=' for equality (if n = 10 {}). NOT ==.
- loops: for (imagine i = 10, i <= 50, i ++) {}. for (, i <= 50, i ++) {}. repeat i <= 20 { i ++ }
- arrays: imagine arr = [], arr.add(10), arr.remove(30), arr.max(), arr.min(), arr[0]
- functions: function even_odd(n) { return p"{n} Is Even" }
- structures: structure student() { imagine name = "Arshman" }, imagine s = student(), output(s.name)
TONE: Concise, fix syntax errors if user provides broken code.
`;

const OWNER_NAME = "Arshman Anil";
const OWNER_PASS = "admin456";

// ==========================================
// REALISTIC MODEL ARCHITECTURE
// ==========================================
const MODEL_ARCHITECTURE = [
    { 
        id: 'x7k2', name: 'X7K2', tag: 'DETAILED', delay: 0, 
        persona: `INSTRUCTION: You are a highly analytical model. You provide comprehensive, multi-paragraph explanations. You break down concepts into structured parts. You use formatting like bolding and bullet points. You explain the 'why' behind the syntax, not just the 'how'. IMPORTANT: NEVER proactively say your model name unless explicitly asked. Just answer the question deeply.` 
    },
    { 
        id: 'v9m4', name: 'V9M4', tag: 'STRUCTURED', delay: 0, 
        persona: `INSTRUCTION: You are a structured, logical model. You format responses using clear headers, numbered lists, and code blocks. You are precise and methodical. You prefer step-by-step breakdowns. IMPORTANT: NEVER proactively say your model name unless explicitly asked.` 
    },
    { 
        id: 'p4t8', name: 'P4T8', tag: 'BALANCED', delay: 0, 
        persona: `INSTRUCTION: You are a balanced, helpful model. You give clear, medium-length explanations. You provide code examples when necessary. You are friendly but professional. IMPORTANT: NEVER proactively say your model name unless explicitly asked.` 
    },
    { 
        id: 'k2j6', name: 'K2J6', tag: 'DIRECT', delay: 0, 
        persona: `INSTRUCTION: You are a direct, no-nonsense model. You get straight to the point. You avoid fluff and unnecessary words. You give the exact answer or code required without extra commentary. IMPORTANT: NEVER proactively say your model name unless explicitly asked.` 
    },
    { 
        id: 'r8n1', name: 'R8N1', tag: 'INSTANT', delay: 0, 
        persona: `INSTRUCTION: You are an instant, rapid-fire model. You give the shortest possible correct answer. 1-2 sentences max. You strip away all pleasantries. IMPORTANT: NEVER proactively say your model name unless explicitly asked.` 
    },
    { 
        id: 'z3b5', name: 'Z3B5', tag: 'MICRO', delay: 0, 
        persona: `INSTRUCTION: You are a micro model. You answer in the absolute fewest words possible. Code snippets preferred over text explanations. IMPORTANT: NEVER proactively say your model name unless explicitly asked.` 
    },
    { 
        id: 'm6f9', name: 'M6F9', tag: 'RAW', delay: 0, 
        persona: `INSTRUCTION: You are a raw, unfiltered model. You output raw data, code, or extremely blunt text. Zero formatting, zero pleasantries. Just the facts or code. IMPORTANT: NEVER proactively say your model name unless explicitly asked.` 
    }
];

let activeModelId = 'x7k2';

// ==========================================
// APP STATE
// ==========================================
let chatSessions = [];
let activeSessionId = null;
let isStreamingActive = false;
let streamTimer = null;
let activeRawStreamText = "";
let isOwner = false;
let DOM = {};

document.addEventListener('DOMContentLoaded', () => {
    DOM.chatFeed = document.getElementById('chat-feed');
    DOM.chatWorkspace = document.getElementById('chat-workspace');
    DOM.userInput = document.getElementById('userMessageInput');
    DOM.sendBtn = document.getElementById('send-button');
    DOM.stopBtn = document.querySelector('.stop-generate-text');
    DOM.scrollFab = document.getElementById('scroll-fab');
    DOM.toast = document.getElementById('toast-notification');
    
    initModelDropdown();
    loadTheme();
    checkOnboardingStatus();
});

// ==========================================
// MODEL DROPDOWN
// ==========================================
function initModelDropdown() {
    const dropdown = document.getElementById('model-dropdown');
    if(!dropdown) return;
    const detailedContainer = dropdown.children[0];
    const instantContainer = dropdown.children[1];
    
    const detailedModels = MODEL_ARCHITECTURE.filter(m => ['x7k2', 'v9m4', 'p4t8', 'k2j6'].includes(m.id));
    const instantModels = MODEL_ARCHITECTURE.filter(m => ['r8n1', 'z3b5', 'm6f9'].includes(m.id));

    detailedModels.forEach(m => {
        const div = document.createElement('div');
        div.className = `model-option ${m.id === activeModelId ? 'active-model' : ''}`;
        div.dataset.id = m.id;
        div.onclick = () => selectModel(m.id);
        div.innerHTML = `<span>PyCJ ${m.name}</span><span class="model-tag">${m.tag}</span>`;
        detailedContainer.after(div);
    });

    instantModels.forEach(m => {
        const div = document.createElement('div');
        div.className = `model-option ${m.id === activeModelId ? 'active-model' : ''}`;
        div.dataset.id = m.id;
        div.onclick = () => selectModel(m.id);
        div.innerHTML = `<span>PyCJ ${m.name}</span><span class="model-tag">${m.tag}</span>`;
        instantContainer.after(div);
    });
}

function toggleModelDropdown() {
    const dropdown = document.getElementById('model-dropdown');
    const btn = document.querySelector('.model-selector-btn');
    if(dropdown) dropdown.classList.toggle('active');
    if(btn) btn.classList.toggle('active');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.model-selector-wrapper')) {
        const dropdown = document.getElementById('model-dropdown');
        const btn = document.querySelector('.model-selector-btn');
        if(dropdown) dropdown.classList.remove('active');
        if(btn) btn.classList.remove('active');
    }
});

function selectModel(modelId) {
    activeModelId = modelId;
    const model = MODEL_ARCHITECTURE.find(m => m.id === modelId);
    if(!model) return;
    
    const nameEl = document.getElementById('active-model-name');
    const badgeEl = document.getElementById('model-badge-sub');
    if(nameEl) nameEl.textContent = `PyCJ ${model.name}`;
    if(badgeEl) badgeEl.textContent = `PyCJ ${model.name}`;
    
    document.querySelectorAll('.model-option').forEach(el => {
        el.classList.toggle('active-model', el.dataset.id === modelId);
    });
    
    toggleModelDropdown();
}

// ==========================================
// ONBOARDING & AUTH
// ==========================================
function checkOnboardingStatus() {
    const hasName = localStorage.getItem('pycj_user_name');
    const hasKey = localStorage.getItem('pycj_api_key');
    if (!hasName || !hasKey) {
        document.getElementById('onboarding-modal').classList.add('active');
    } else {
        verifyOwnerStatus(); initApp();
    }
}

function completeOnboarding() {
    const name = document.getElementById('onboard-name').value.trim();
    const pass = document.getElementById('onboard-pass').value.trim();
    const apiKey = document.getElementById('onboard-api').value.trim();
    if (!name) { alert("Please enter your name."); return; }
    if (!apiKey || !apiKey.startsWith("gsk_")) { alert("Please enter a valid Groq API Key."); return; }
    if (name === OWNER_NAME && pass !== OWNER_PASS) { alert("Incorrect password."); return; }
    if (pass === OWNER_PASS && name !== OWNER_NAME) { alert("Invalid username."); return; }
    if (name !== OWNER_NAME && pass !== "" && pass !== OWNER_PASS) { alert("Invalid credentials."); return; }
    localStorage.setItem('pycj_user_name', name);
    localStorage.setItem('pycj_language', 'English');
    localStorage.setItem('pycj_api_key', apiKey);
    if (name === OWNER_NAME && pass === OWNER_PASS) { isOwner = true; localStorage.setItem('pycj_is_owner', 'true'); }
    else { isOwner = false; localStorage.removeItem('pycj_is_owner'); }
    document.getElementById('onboarding-modal').classList.remove('active');
    initApp();
}

function verifyOwnerStatus() { isOwner = (localStorage.getItem('pycj_user_name') === OWNER_NAME && localStorage.getItem('pycj_is_owner') === 'true'); }
function initApp() { loadChatSessionsFromStorage(); checkUserApiKeyAuthorization(); setupScrollListener(); setupInputHistory(); }

// ==========================================
// THEME & UI
// ==========================================
function loadTheme() { document.documentElement.setAttribute('data-theme', localStorage.getItem('pycj_theme') || 'dark'); }
function toggleTheme() { const n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', n); localStorage.setItem('pycj_theme', n); }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebar-overlay').classList.toggle('active'); }

function setupScrollListener() {
    if(!DOM.chatWorkspace || !DOM.scrollFab) return;
    DOM.chatWorkspace.addEventListener('scroll', () => {
        const near = DOM.chatWorkspace.scrollHeight - DOM.chatWorkspace.scrollTop - DOM.chatWorkspace.clientHeight < 100;
        if (near) DOM.scrollFab.classList.remove('visible');
        else if (isStreamingActive || DOM.chatWorkspace.querySelectorAll('.msg-wrapper').length > 2) DOM.scrollFab.classList.add('visible');
    });
}

function scrollToBottom() { if(DOM.chatWorkspace) DOM.chatWorkspace.scrollTo({ top: DOM.chatWorkspace.scrollHeight, behavior: 'smooth' }); }
function showToast(msg) { if(!DOM.toast) return; DOM.toast.textContent = msg; DOM.toast.classList.add('show'); setTimeout(() => DOM.toast.classList.remove('show'), 2000); }
function getTimeGreeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }

// ==========================================
// DYNAMIC SUGGESTIONS
// ==========================================
const SUGGESTION_POOL = [
    { icon: "💡", text: "Explain standard imagine variables assignment" },
    { icon: "🔄", text: "Write a loop using repeat framework" },
    { icon: "🛡️", text: "Show if and elif syntax parameters" },
    { icon: "👤", text: "Who created PyCJ and why?" },
    { icon: "📦", text: "How do I create and use arrays in PyCJ?" },
    { icon: "⚙️", text: "Show me how to write a custom function" },
    { icon: "🏗️", text: "Explain structure (OOP) in PyCJ V1.1" },
    { icon: "⌨️", text: "How does the 'ask' input system work?" },
    { icon: "🔢", text: "Difference between / and // division" },
    { icon: "🔁", text: "Write a for loop skipping initialization" },
    { icon: "✨", text: "How do f-strings work with output(p'...')?" },
    { icon: "📊", text: "How to get arr.max() and arr.min()?" },
    { icon: "🧩", text: "Write a program to check even or odd" },
    { icon: "📝", text: "How to use # and /* */ for comments?" },
    { icon: "🚀", text: "Create a structure to hold student marks" },
    { icon: "🎯", text: "Write a repeat loop to take 5 inputs" }
];

function getRandomSuggestions(count = 4) { const s = [...SUGGESTION_POOL].sort(() => 0.5 - Math.random()); return s.slice(0, count); }

function renderSuggestionGrid() { return getRandomSuggestions(4).map(s => `<div class="suggestion-card" onclick="executeSuggestionPill('${s.text.replace(/'/g, "\\'")}')"><div class="suggestion-text">${s.icon} ${s.text}</div></div>`).join(''); }
function refreshDashboardSuggestions() { const g = document.querySelector('.suggestion-grid'); if(g) g.innerHTML = renderSuggestionGrid(); }

function generateFollowUpQuestions(lastUserMsg) {
    const token = localStorage.getItem('pycj_api_key'); if (!token) return;
    fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: "Suggest 2 short follow-up questions. Output ONLY JSON array: [\"Q1?\", \"Q2?\"]" }, { role: "user", content: lastUserMsg }], temperature: 0.5, max_tokens: 60 }) }).then(r => r.json()).then(d => { try { let q = JSON.parse(d.choices[0].message.content); if(Array.isArray(q) && q.length >= 2) appendFollowUpBubble(q.slice(0, 2)); } catch(e){} }).catch(() => {});
}

function appendFollowUpBubble(questions) {
    if(!DOM.chatFeed) return;
    const w = document.createElement('div'); w.className = 'follow-up-container';
    w.innerHTML = questions.map(q => `<button class="follow-up-btn" onclick="executeSuggestionPill('${q.replace(/'/g, "\\'")}')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>${q}</button>`).join('');
    DOM.chatFeed.appendChild(w); scrollToBottom();
}

// ==========================================
// SESSIONS
// ==========================================
function loadChatSessionsFromStorage() { const s = localStorage.getItem('pycj-chat-sessions'); if (s) chatSessions = JSON.parse(s); createNewChatSession(false); }
function saveChatSessionsToStorage() { localStorage.setItem('pycj-chat-sessions', JSON.stringify(chatSessions)); }

function createNewChatSession(shouldSave = true) {
    const s = { id: "s_" + Date.now(), title: "New chat", history: [] };
    chatSessions.unshift(s); activeSessionId = s.id;
    if (shouldSave) saveChatSessionsToStorage();
    renderSidebarHistoryList(); loadActiveSessionChatFeed();
    if(DOM.userInput) DOM.userInput.focus();
    if (window.innerWidth <= 768) toggleSidebar();
}

function selectChatSession(id) { if (isStreamingActive) stopActiveAIStreaming(); activeSessionId = id; renderSidebarHistoryList(); loadActiveSessionChatFeed(); if (window.innerWidth <= 768) toggleSidebar(); }

function deleteSession(id, event) {
    event.stopPropagation();
    if (isStreamingActive && activeSessionId === id) stopActiveAIStreaming();
    chatSessions = chatSessions.filter(s => s.id !== id);
    if (chatSessions.length === 0) createNewChatSession();
    else { if (activeSessionId === id) activeSessionId = chatSessions[0].id; saveChatSessionsToStorage(); renderSidebarHistoryList(); loadActiveSessionChatFeed(); }
}

function deleteAllChatSessions() { if (!confirm('Delete all?')) return; if (isStreamingActive) stopActiveAIStreaming(); chatSessions = []; saveChatSessionsToStorage(); createNewChatSession(); }
function filterChats(q) { document.querySelectorAll('.history-item').forEach(i => { i.style.display = i.querySelector('.item-title').textContent.toLowerCase().includes(q.toLowerCase()) ? 'flex' : 'none'; }); }
function executeDirectSessionRename(o, t) { o.title = t; saveChatSessionsToStorage(); renderSidebarHistoryList(); }

function renderSidebarHistoryList() {
    const c = document.getElementById('history-list'); if (!c) return; c.innerHTML = "";
    chatSessions.forEach(s => {
        const i = document.createElement('div'); i.className = `history-item ${s.id === activeSessionId ? 'active' : ''}`; i.onclick = () => selectChatSession(s.id);
        i.innerHTML = `<span class="item-title">${escapeHTML(s.title)}</span><button class="item-delete" onclick="deleteSession('${s.id}', event)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>`;
        c.appendChild(i);
    });
}

function loadActiveSessionChatFeed() {
    if(!DOM.chatFeed) return; DOM.chatFeed.innerHTML = "";
    const s = chatSessions.find(s => s.id === activeSessionId); if (!s) return;
    if (s.history.length === 0) {
        const name = localStorage.getItem('pycj_user_name') || '';
        let greeting = isOwner ? `${getTimeGreeting()}, Boss. How can I assist you today?` : `${getTimeGreeting()}${name ? ', ' + name : ''}`;
        DOM.chatFeed.innerHTML = `<div class="dashboard-container"><h1 class="dashboard-title">${greeting}</h1><p class="dashboard-subtitle">How can I help you with PyCJ today?</p><div class="suggestion-grid">${renderSuggestionGrid()}</div><button class="refresh-suggestions-btn" onclick="refreshDashboardSuggestions()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>Show different suggestions</button></div>`;
        return;
    }
    s.history.forEach(m => { if (m.role === "user") appendMessageBubble(m.content, 'user-type', false, false); else if (m.role === "assistant") appendMessageBubble(m.content, 'bot-type', true, false); });
    setTimeout(scrollToBottom, 50);
}

// ==========================================
// INPUT & SETTINGS
// ==========================================
function setupInputHistory() { if(!DOM.userInput) return; DOM.userInput.addEventListener('input', () => { DOM.userInput.style.height = 'auto'; DOM.userInput.style.height = Math.min(DOM.userInput.scrollHeight, 150) + 'px'; }); }

function checkUserApiKeyAuthorization() {
    const k = localStorage.getItem('pycj_api_key');
    if (!k) { setTimeout(() => openKeyModal(), 500); if(DOM.userInput) { DOM.userInput.disabled = true; DOM.userInput.placeholder = "Awaiting credentials..."; } }
    else if(DOM.userInput) { DOM.userInput.disabled = false; DOM.userInput.focus(); }
}

function openKeyModal() { document.getElementById('modalApiKey').value = localStorage.getItem('pycj_api_key') || ''; document.getElementById('modalUserName').value = localStorage.getItem('pycj_user_name') || ''; document.getElementById('modalOwnerPass').value = isOwner ? OWNER_PASS : ''; document.getElementById('key-modal').classList.add('active'); }
function closeKeyModal() { document.getElementById('key-modal').classList.remove('active'); }

function saveApiKeyCredentials() {
    const k = document.getElementById('modalApiKey').value.trim(), n = document.getElementById('modalUserName').value.trim(), p = document.getElementById('modalOwnerPass').value.trim();
    if (n === OWNER_NAME && p !== "" && p !== OWNER_PASS) { alert("Incorrect password."); return; }
    if (p === OWNER_PASS && n !== OWNER_NAME) { alert("Invalid username."); return; }
    if (n !== OWNER_NAME && p !== "" && p !== OWNER_PASS) { alert("Invalid credentials."); return; }
    if (n) localStorage.setItem('pycj_user_name', n);
    localStorage.setItem('pycj_language', 'English');
    if (k && k.startsWith("gsk_")) localStorage.setItem('pycj_api_key', k); else if (!k) localStorage.removeItem('pycj_api_key'); else { alert("API key must start with 'gsk_'"); return; }
    if (n === OWNER_NAME && p === OWNER_PASS) { isOwner = true; localStorage.setItem('pycj_is_owner', 'true'); } else { isOwner = false; localStorage.removeItem('pycj_is_owner'); }
    closeKeyModal(); if(DOM.userInput && localStorage.getItem('pycj_api_key')) { DOM.userInput.disabled = false; DOM.userInput.focus(); } loadActiveSessionChatFeed(); showToast("Settings saved");
}

function handleInputKeyPress(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (DOM.userInput && !DOM.userInput.disabled) submitMessagePipeline(); } }
function executeSuggestionPill(t) { if(DOM.userInput) { DOM.userInput.value = t; submitMessagePipeline(); } }

// ==========================================
// AI PIPELINE (NO THINKING LOADER FOR INSTANT MODELS)
// ==========================================
function stopActiveAIStreaming() {
    if (streamTimer) clearInterval(streamTimer); isStreamingActive = false;
    if(DOM.stopBtn) DOM.stopBtn.classList.remove('active'); if(DOM.sendBtn) DOM.sendBtn.disabled = false;
    if(DOM.userInput) { DOM.userInput.disabled = false; DOM.userInput.focus(); }
    const m = DOM.chatFeed?.lastChild;
    if (m && m.classList.contains('bot-type')) { let t = activeRawStreamText; if (((t.match(/```/g) || []).length) % 2 !== 0) t += "\n```"; const b = m.querySelector('.msg-bubble'); if(b) { parseTextMarkdownContentHTML(b, t, false); attachCodeActionListeners(b); } }
}

function generateSmartChatTitle(msg, obj) {
    const t = localStorage.getItem('pycj_api_key'); if (!t) return;
    fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: "2-3 word title. ONLY output title." }, { role: "user", content: msg }], temperature: 0.1, max_tokens: 10 }) }).then(r => r.json()).then(d => { if(d.choices?.[0]?.message?.content) executeDirectSessionRename(obj, d.choices[0].message.content.trim().replace(/^["']|["']$/g, '')); }).catch(() => {});
}

function regenerateResponse() {
    const s = chatSessions.find(s => s.id === activeSessionId); if (!s || s.history.length < 2) return;
    DOM.chatFeed.querySelector('.follow-up-container')?.remove();
    s.history.pop(); saveChatSessionsToStorage(); if(DOM.chatFeed.lastChild) DOM.chatFeed.lastChild.remove();
    submitMessagePipeline(s.history[s.history.length - 1].content);
}

function submitMessagePipeline(customQuery = null) {
    const userToken = localStorage.getItem('pycj_api_key'); if (!userToken) { openKeyModal(); return; }
    const currentSession = chatSessions.find(s => s.id === activeSessionId); if (!currentSession) return;
    const query = customQuery ? customQuery.trim() : DOM.userInput.value.trim(); if (!query) return;

    DOM.chatFeed.querySelector('.follow-up-container')?.remove();

    let l = query.toLowerCase(), n = "";
    if (l.startsWith("change chat name to ")) n = query.substring(20).trim();
    else if (l.startsWith("rename to ")) n = query.substring(10).trim();

    if (n) {
        n = n.replace(/^["']|["']$/g, '');
        appendMessageBubble(query, 'user-type', false, true);
        if (!customQuery && DOM.userInput) { DOM.userInput.value = ''; DOM.userInput.style.height = 'auto'; }
        executeDirectSessionRename(currentSession, n);
        currentSession.history.push({ role: "user", content: query });
        const r = isOwner ? `Done perfectly, Boss.` : `Understood. Chat renamed to: **${n}**`;
        currentSession.history.push({ role: "assistant", content: r }); saveChatSessionsToStorage();
        setTimeout(() => appendMessageBubble(r, 'bot-type', true, true), 200); return; 
    }

    if (!customQuery && currentSession.history.length === 0) generateSmartChatTitle(query, currentSession);

    appendMessageBubble(query, 'user-type', false, true);
    if (!customQuery && DOM.userInput) { DOM.userInput.value = ''; DOM.userInput.style.height = 'auto'; }
    DOM.userInput.disabled = true; DOM.sendBtn.disabled = true; if(DOM.stopBtn) DOM.stopBtn.classList.add('active');
    currentSession.history.push({ role: "user", content: query }); saveChatSessionsToStorage();

    const currentModel = MODEL_ARCHITECTURE.find(m => m.id === activeModelId) || MODEL_ARCHITECTURE[0];
    const userName = localStorage.getItem('pycj_user_name') || "User";
    
    let ownerContext = "";
    if (isOwner) {
        ownerContext = `\nCRITICAL OWNER INSTRUCTION: The user "${userName}" is the absolute BOSS. Address them as "Boss" or "Sir". Agree with their ideas, say "Yes Boss" when applicable.`;
    } else {
        ownerContext = `\nUSER METADATA:\n- Name: ${userName}\n- Lang: English`;
    }

    const finalSystemPrompt = PYCJ_KNOWLEDGE_SYSTEM_PROMPT + ownerContext + "\n\n" + currentModel.persona;

    fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST", headers: { "Authorization": `Bearer ${userToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: finalSystemPrompt }, ...currentSession.history.slice(-14)], temperature: 0.2 })
    })
    .then(res => res.json())
    .then(data => {
        if(data.error) throw new Error(data.error.message);
        const text = data.choices[0].message.content;
        currentSession.history.push({ role: "assistant", content: text }); saveChatSessionsToStorage();
        
        // Instant typing effect, NO loader
        setTimeout(() => {
            appendStreamingMessageBubble(text, () => generateFollowUpQuestions(query));
        }, 50); 
    })
    .catch(err => {
        if(DOM.userInput) DOM.userInput.disabled = false; if(DOM.sendBtn) DOM.sendBtn.disabled = false; if(DOM.stopBtn) DOM.stopBtn.classList.remove('active');
        appendMessageBubble(`Error: ${err.message}`, 'bot-type', true, true);
    });
}

function appendStreamingMessageBubble(fullText, onDoneCallback) {
    const wrapper = document.createElement('div'); wrapper.className = 'msg-wrapper bot-type';
    wrapper.innerHTML = `<div class="msg-avatar">AI</div><div class="msg-content"><div class="msg-bubble"></div><div class="msg-actions-bot" style="display:flex; gap:4px; margin-top:8px; opacity:0; transition: opacity 0.2s;"></div></div>`;
    DOM.chatFeed.appendChild(wrapper);
    
    const bubble = wrapper.querySelector('.msg-bubble');
    const actionsContainer = wrapper.querySelector('.msg-actions-bot');
    const chars = Array.from(fullText); let i = 0; activeRawStreamText = ""; isStreamingActive = true;
    
    streamTimer = setInterval(() => {
        if (i < chars.length && isStreamingActive) {
            activeRawStreamText += chars[i]; parseTextMarkdownContentHTML(bubble, activeRawStreamText, true); scrollToBottom(); i++;
        } else {
            clearInterval(streamTimer); isStreamingActive = false;
            if(DOM.sendBtn) DOM.sendBtn.disabled = false;
            parseTextMarkdownContentHTML(bubble, activeRawStreamText, false); attachCodeActionListeners(bubble);
            
            actionsContainer.innerHTML = `
                <button class="msg-action-btn" onclick="copyFullResponse(this)" title="Copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button class="msg-action-btn btn-good" onclick="handleFeedback(this, 'good')" title="Good"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
                <button class="msg-action-btn btn-bad" onclick="handleFeedback(this, 'bad')" title="Bad"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>
                <button class="msg-action-btn" onclick="regenerateResponse()" title="Regenerate"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
            `;
            wrapper.onmouseenter = () => actionsContainer.style.opacity = '1';
            wrapper.onmouseleave = () => actionsContainer.style.opacity = '0';
            
            if(DOM.userInput) { DOM.userInput.disabled = false; DOM.userInput.focus(); }
            if (onDoneCallback) onDoneCallback();
        }
    }, 8); 
}

// ==========================================
// PREMIUM FEATURES
// ==========================================
function copyFullResponse(btn) { const b = btn.closest('.msg-content').querySelector('.msg-bubble'); if(b) navigator.clipboard.writeText(b.innerText).then(() => showToast("Response copied")); }

function handleFeedback(btn, type) {
    const actionsDiv = btn.parentElement; const bubble = btn.closest('.msg-content').querySelector('.msg-bubble');
    actionsDiv.innerHTML = '';
    if (type === 'good') {
        btn.style.color = 'var(--accent)'; actionsDiv.appendChild(btn);
        bubble.insertAdjacentHTML('afterend', `<div class="thank-you-dream"><div class="dream-cloud"><span class="dream-icon">✨</span><span class="dream-text">Thank you! I'm glad I could help.</span></div></div>`);
        setTimeout(() => { const d = bubble.parentElement.querySelector('.thank-you-dream'); if(d) { d.style.opacity = '0'; setTimeout(() => d.remove(), 300); } }, 2000);
    } else {
        btn.style.color = '#f43f5e'; actionsDiv.appendChild(btn); showToast("Regenerating..."); setTimeout(() => regenerateResponse(), 500);
    }
}

// ==========================================
// MARKDOWN & CODE PARSER
// ==========================================
function parseTextMarkdownContentHTML(el, text, showCursor = false) {
    let segments = text.split("```"), html = "";
    for (let i = 0; i < segments.length; i++) {
        if (i % 2 === 1) {
            let block = segments[i], lines = block.split("\n"), lang = lines[0].toLowerCase().trim();
            if (["javascript", "pycj", "python", "html", "css"].includes(lang)) lines.shift(); else lang = "code";
            let rawCode = lines.join("\n").trim();
            html += `<div class="code-block-wrapper" style="position:relative; margin: 16px 0; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: var(--code-bg);"><div style="display:flex; justify-content:space-between; align-items:center; background: var(--code-header-bg); padding: 6px 12px; border-bottom: 1px solid var(--border-color); font-size:0.75rem; color:var(--text-muted);"><span>${lang}</span><div style="display:flex; gap:6px;"><button class="explain-code-badge" data-code="${encodeURIComponent(rawCode)}" style="background:transparent; color:var(--text-secondary); border:none; cursor:pointer; font-size:0.75rem; display:flex; align-items:center; gap:4px;">💡 Explain</button><button class="copy-code-badge" data-code="${encodeURIComponent(rawCode)}" style="background:transparent; color:var(--text-secondary); border:none; cursor:pointer; font-size:0.75rem;">Copy</button></div></div><pre style="margin:0; padding:12px; overflow-x:auto; font-size:0.85rem; line-height:1.5;"><code>${applySyntaxColoringTokens(rawCode)}</code></pre></div>`;
        } else {
            let proc = segments[i].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code style="background:var(--bg-hover);padding:2px 6px;border-radius:4px;font-size:0.85em;">$1</code>');
            let lns = proc.split("\n");
            lns.forEach((ln, idx) => { let tr = ln.trim(); if (!tr) { if (idx !== lns.length - 1) html += "<br>"; return; } if (/^[A-D]\..+/i.test(tr) || /^\d+\..+/.test(tr)) html += `<div style="margin-left:18px; padding:4px 0; font-weight:500;">${ln}</div>`; else if (tr.startsWith("-") || tr.startsWith("*")) html += `<div style="margin-left:12px; padding:3px 0;">• ${ln.substring(ln.indexOf(tr.charAt(0)) + 1).trim()}</div>`; else html += `<span style="display:inline-block; width:100%; padding:2px 0;">${ln}</span>`; });
        }
    }
    el.innerHTML = html;
    if (showCursor) { let c = document.createElement('span'); c.className = 'premium-terminal-cursor'; if (el.lastChild) { let f = el.lastChild; while (f.lastChild && f.lastChild.nodeType === Node.ELEMENT_NODE && !f.classList?.contains('code-block-wrapper')) f = f.lastChild; if (f.classList?.contains('code-block-wrapper')) el.appendChild(c); else f.appendChild(c); } else el.appendChild(c); }
}

function applySyntaxColoringTokens(code) { let e = escapeHTML(code); e = e.replace(/(["'])(.*?)\1/g, '<span style="color:#a7f3d0;">$1$2$1</span>'); e = e.replace(/\b(imagine|structure|output|print|ask|str|int|float|bool|repeat|function|return|if|else|elif|for|while|true|True|false|False)\b/g, '<span style="color:#f43f5e; font-weight:bold;">$1</span>'); return e.replace(/\b(\d+)\b/g, '<span style="color:#fbbf24;">$1</span>'); }

function attachCodeActionListeners(p) { p.querySelectorAll('.copy-code-badge').forEach(b => { b.onclick = () => navigator.clipboard.writeText(decodeURIComponent(b.getAttribute('data-code'))).then(() => showToast("Code copied")); }); p.querySelectorAll('.explain-code-badge').forEach(b => { b.onclick = () => submitMessagePipeline(`Explain this simply:\n\n\`\`\`pycj\n${decodeURIComponent(b.getAttribute('data-code'))}\n\`\`\``); }); }

function appendMessageBubble(text, cssClass, parseMD = false, shouldScroll = true) {
    if(!DOM.chatFeed) return; DOM.chatFeed.querySelector('.dashboard-container')?.remove();
    const w = document.createElement('div'); w.className = `msg-wrapper ${cssClass}`;
    if (cssClass === 'bot-type') {
        w.innerHTML = `<div class="msg-avatar">AI</div><div class="msg-content"><div class="msg-bubble"></div><div class="msg-actions-bot" style="display:flex; gap:4px; margin-top:8px; opacity:0; transition: opacity 0.2s;"></div></div>`;
        w.onmouseenter = () => w.querySelector('.msg-actions-bot').style.opacity = '1'; w.onmouseleave = () => w.querySelector('.msg-actions-bot').style.opacity = '0';
        const b = w.querySelector('.msg-bubble'), a = w.querySelector('.msg-actions-bot');
        if (parseMD) { parseTextMarkdownContentHTML(b, text, false); attachCodeActionListeners(b); } else b.textContent = text;
        a.innerHTML = `<button class="msg-action-btn" onclick="copyFullResponse(this)" title="Copy"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button><button class="msg-action-btn" onclick="regenerateResponse()" title="Regenerate"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>`;
    } else { w.innerHTML = `<div class="msg-content user-content"><div class="msg-bubble user-bubble"></div></div>`; w.querySelector('.msg-bubble').textContent = text; }
    DOM.chatFeed.appendChild(w); if (shouldScroll) setTimeout(scrollToBottom, 50);
}

function escapeHTML(s) { return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split('"').join("&quot;").split("'").join("&#039;"); }

// Globals
window.createNewChatSession = createNewChatSession;
window.deleteSession = deleteSession;
window.deleteAllChatSessions = deleteAllChatSessions;
window.openKeyModal = openKeyModal;
window.closeKeyModal = closeKeyModal;
window.saveApiKeyCredentials = saveApiKeyCredentials;
window.handleInputKeyPress = handleInputKeyPress;
window.submitMessagePipeline = submitMessagePipeline;
window.stopActiveAIStreaming = stopActiveAIStreaming;
window.executeSuggestionPill = executeSuggestionPill;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.filterChats = filterChats;
window.copyFullResponse = copyFullResponse;
window.handleFeedback = handleFeedback;
window.regenerateResponse = regenerateResponse;
window.scrollToBottom = scrollToBottom;
window.completeOnboarding = completeOnboarding;
window.refreshDashboardSuggestions = refreshDashboardSuggestions;
window.toggleModelDropdown = toggleModelDropdown;
window.selectModel = selectModel;

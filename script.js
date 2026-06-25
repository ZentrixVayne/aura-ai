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

OUTPUT FORMAT RULE: 
Be straight-to-the-point and clear. Do not provide overly long explanations, preambles, or fluffy intros/outros. Aim for a medium-sized answer that is approximately half the length of a standard response. Deliver the facts and code snippets instantly without filler text.
`;

const OWNER_NAME = "Arshman Anil";
const OWNER_PASS = "admin456";

const MODEL_ARCHITECTURE = [
    { 
        id: 'x7k2', name: 'X7K2', tag: 'DETAILED', delay: 0, 
        persona: `INSTRUCTION: You are an analytical model. Answer concepts efficiently and straight to the point. Give clear formatting but maintain medium-length limits.` 
    },
    { 
        id: 'v9m4', name: 'V9M4', tag: 'STRUCTURED', delay: 0, 
        persona: `INSTRUCTION: You are a structured model. Use clean, direct step breakdowns, code blocks, and lists. Keep text short and to the point.` 
    },
    { 
        id: 'p4t8', name: 'P4T8', tag: 'BALANCED', delay: 0, 
        persona: `INSTRUCTION: You are a balanced model. Give concise answers and quick code solutions without unnecessary paragraphs.` 
    },
    { 
        id: 'k2j6', name: 'K2J6', tag: 'DIRECT', delay: 0, 
        persona: `INSTRUCTION: You are a direct model. Avoid any commentary or fluff. Deliver the response efficiently.` 
    },
    { 
        id: 'r8n1', name: 'R8N1', tag: 'INSTANT', delay: 0, 
        persona: `INSTRUCTION: You are an rapid model. Give short answers instantly.` 
    },
    { 
        id: 'z3b5', name: 'Z3B5', tag: 'MICRO', delay: 0, 
        persona: `INSTRUCTION: You answer in the absolute minimum words possible.` 
    },
    { 
        id: 'm6f9', name: 'M6F9', tag: 'RAW', delay: 0, 
        persona: `INSTRUCTION: Output raw code or text directly with no decorative conversational text.` 
    }
];

let activeModelId = 'x7k2';
let chatSessions = [];
let activeSessionId = null;
let isStreamingActive = false;
let streamTimer = null;
let activeRawStreamText = "";
let isOwner = false;
let userIsScrollingUp = false; 
let DOM = {};

document.addEventListener('DOMContentLoaded', () => {
    DOM.chatFeed = document.getElementById('chat-feed');
    DOM.chatWorkspace = document.getElementById('chat-workspace');
    DOM.userInput = document.getElementById('userMessageInput');
    DOM.sendBtn = document.getElementById('send-button');
    DOM.scrollFab = document.getElementById('scroll-fab');
    DOM.toast = document.getElementById('toast-notification');
    
    setButtonState(false);
    initModelDropdown();
    loadTheme();
    checkOnboardingStatus();
});

function setButtonState(isStreaming) {
    if (!DOM.sendBtn) return;
    if (isStreaming) {
        DOM.sendBtn.classList.add('cancel-mode');
        DOM.sendBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`;
    } else {
        DOM.sendBtn.classList.remove('cancel-mode');
        DOM.sendBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
    }
}

function handleButtonClick() {
    if (isStreamingActive) {
        stopActiveAIStreaming();
    } else {
        submitMessagePipeline();
    }
}

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
    
    localStorage.setItem('pycj_user_name', name);
    localStorage.setItem('pycj_language', 'English');
    localStorage.setItem('pycj_api_key', apiKey);
    
    // Check if matching Arshman Anil AND correct password to define owner status
    if (name === OWNER_NAME && pass === OWNER_PASS) { 
        isOwner = true; 
        localStorage.setItem('pycj_is_owner', 'true'); 
    } else { 
        isOwner = false; 
        localStorage.removeItem('pycj_is_owner'); 
    }
    document.getElementById('onboarding-modal').classList.remove('active');
    initApp();
}

function verifyOwnerStatus() { isOwner = (localStorage.getItem('pycj_user_name') === OWNER_NAME && localStorage.getItem('pycj_is_owner') === 'true'); }
function initApp() { loadChatSessionsFromStorage(); checkUserApiKeyAuthorization(); setupScrollListener(); setupInputHistory(); }

function loadTheme() { document.documentElement.setAttribute('data-theme', localStorage.getItem('pycj_theme') || 'dark'); }
function toggleTheme() { const n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', n); localStorage.setItem('pycj_theme', n); }
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebar-overlay').classList.toggle('active'); }

function setupScrollListener() {
    if(!DOM.chatWorkspace || !DOM.scrollFab) return;
    DOM.chatWorkspace.addEventListener('scroll', () => {
        const nearBottom = DOM.chatWorkspace.scrollHeight - DOM.chatWorkspace.scrollTop - DOM.chatWorkspace.clientHeight < 40;
        if (nearBottom) {
            DOM.scrollFab.classList.remove('visible');
            userIsScrollingUp = false; 
        } else {
            if (isStreamingActive || DOM.chatWorkspace.querySelectorAll('.msg-wrapper').length > 2) {
                DOM.scrollFab.classList.add('visible');
            }
            if (isStreamingActive) {
                userIsScrollingUp = true;
            }
        }
    });
}

function scrollToBottom() { 
    if(DOM.chatWorkspace) {
        DOM.chatWorkspace.scrollTo({ top: DOM.chatWorkspace.scrollHeight, behavior: 'smooth' }); 
    } 
}

function showToast(msg) { if(!DOM.toast) return; DOM.toast.textContent = msg; DOM.toast.classList.add('show'); setTimeout(() => DOM.toast.classList.remove('show'), 2000); }
function getTimeGreeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }

const SUGGESTION_POOL = [
    { icon: "💡", text: "Explain standard imagine variables assignment" },
    { icon: "🔄", text: "Write a loop using repeat framework" },
    { icon: "🛡️", text: "Show if and elif syntax parameters" },
    { icon: "👤", text: "Who created PyCJ and why?" },
    { icon: "📦", text: "How do I create and use arrays in PyCJ?" },
    { icon: "⚙️", text: "Show me how to write a custom function" },
    { icon: "🏗️", text: "Explain structure (OOP) in PyCJ V1.1" },
    { icon: "⌨️", text: "How does the 'ask' input system work?" }
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

function renderSidebarHistoryList() {
    const container = document.getElementById('history-list'); if(!container) return;
    container.innerHTML = chatSessions.map(s => `<div class="history-item ${s.id === activeSessionId ? 'active' : ''}" onclick="selectChatSession('${s.id}')"><span class="item-title">${escapeHTML(s.title)}</span><button class="item-delete" onclick="deleteSession('${s.id}', event)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div>`).join('');
}

function filterChats(val) {
    const q = val.toLowerCase().trim();
    document.querySelectorAll('.history-item').forEach((el, index) => {
        const title = chatSessions[index]?.title.toLowerCase() || '';
        el.style.display = title.includes(q) ? 'flex' : 'none';
    });
}

function loadActiveSessionChatFeed() {
    if(!DOM.chatFeed) return;
    const s = chatSessions.find(s => s.id === activeSessionId); if (!s) return;
    if (s.history.length === 0) {
        const name = localStorage.getItem('pycj_user_name') || '';
        let greeting = isOwner ? `${getTimeGreeting()}, Boss. How can I assist you today?` : `${getTimeGreeting()}${name ? ', ' + name : ''}`;
        DOM.chatFeed.innerHTML = `<div class="dashboard-container"><h1 class="dashboard-title">${greeting}</h1><p class="dashboard-subtitle">How can I help you with PyCJ today?</p><div class="suggestion-grid">${renderSuggestionGrid()}</div><button class="refresh-suggestions-btn" onclick="refreshDashboardSuggestions()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>Show different suggestions</button></div>`;
        return;
    }
    DOM.chatFeed.innerHTML = '';
    s.history.forEach(m => {
        if (m.role === "user") appendMessageBubble(m.content, 'user-type', false, false);
        else if (m.role === "assistant") appendMessageBubble(m.content, 'bot-type', true, false);
    });
    setTimeout(scrollToBottom, 50);
}

function setupInputHistory() {
    if(!DOM.userInput) return;
    DOM.userInput.addEventListener('input', () => {
        DOM.userInput.style.height = 'auto';
        DOM.userInput.style.height = Math.min(DOM.userInput.scrollHeight, 150) + 'px';
    });
}

function checkUserApiKeyAuthorization() {
    const k = localStorage.getItem('pycj_api_key');
    if (!k) {
        setTimeout(() => openKeyModal(), 500);
        if(DOM.userInput) {
            DOM.userInput.disabled = true;
            DOM.userInput.placeholder = "Awaiting credentials...";
        }
    } else {
        if(DOM.userInput) {
            DOM.userInput.disabled = false;
            DOM.userInput.placeholder = "Message PyCJ AI...";
        }
    }
}

function openKeyModal() {
    const modal = document.getElementById('key-modal');
    if(modal) {
        modal.classList.add('active');
        document.getElementById('modalUserName').value = localStorage.getItem('pycj_user_name') || '';
        document.getElementById('modalApiKey').value = localStorage.getItem('pycj_api_key') || '';
        document.getElementById('modalOwnerPass').value = isOwner ? OWNER_PASS : '';
    }
}

function closeKeyModal() { const m = document.getElementById('key-modal'); if(m) m.classList.remove('active'); }

function saveApiKeyCredentials() {
    const name = document.getElementById('modalUserName').value.trim();
    const apiKey = document.getElementById('modalApiKey').value.trim();
    const pass = document.getElementById('modalOwnerPass').value.trim();
    
    if(!name) { alert("Name required."); return; }
    if(!apiKey || !apiKey.startsWith("gsk_")) { alert("Enter a valid Groq API Key."); return; }
    
    localStorage.setItem('pycj_user_name', name);
    localStorage.setItem('pycj_api_key', apiKey);
    
    if(name === OWNER_NAME && pass === OWNER_PASS) {
        isOwner = true; 
        localStorage.setItem('pycj_is_owner', 'true');
    } else {
        isOwner = false; 
        localStorage.removeItem('pycj_is_owner');
    }
    
    closeKeyModal();
    loadActiveSessionChatFeed();
    checkUserApiKeyAuthorization();
    showToast("Settings updated successfully");
}

function handleInputKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitMessagePipeline();
    }
}

function executeSuggestionPill(text) {
    if(isStreamingActive) return;
    if(DOM.userInput) DOM.userInput.value = text;
    submitMessagePipeline();
}

function submitMessagePipeline(overrideMessages = null) {
    if (isStreamingActive) return;
    const userToken = localStorage.getItem('pycj_api_key');
    if (!userToken) { openKeyModal(); return; }

    let query = "";
    const currentSession = chatSessions.find(s => s.id === activeSessionId);
    if (!currentSession) return;

    if (overrideMessages) {
        query = overrideMessages[overrideMessages.length - 1].content;
    } else {
        if (!DOM.userInput) return;
        query = DOM.userInput.value.trim();
        if (!query) return;

        DOM.chatFeed.querySelector('.follow-up-container')?.remove();
        if (currentSession.history.length === 0) {
            DOM.chatFeed.innerHTML = '';
        }

        appendMessageBubble(query, 'user-type', false, true);
        currentSession.history.push({ role: "user", content: query });
        
        DOM.userInput.value = '';
        DOM.userInput.style.height = 'auto';
    }

    if (currentSession.history.filter(m => m.role === "user").length === 1 && !overrideMessages) {
        generateSmartChatTitle(query, currentSession);
    }

    isStreamingActive = true;
    setButtonState(true);

    appendMessageBubble("", 'bot-type thinking-bubble', true, true);
    
    const currentModel = MODEL_ARCHITECTURE.find(m => m.id === activeModelId) || MODEL_ARCHITECTURE[0];
    const userName = localStorage.getItem('pycj_user_name') || 'User';
    let ownerContext = "";
    if (isOwner) {
        ownerContext = `\nUSER METADATA:\n- Name: ${OWNER_NAME}\n- Status: System Creator / Owner\n- Authorization Level: Root Admin\n- Language Preference: English`;
    } else {
        ownerContext = `\nUSER METADATA:\n- Name: ${userName}\n- Lang: English`;
    }
    const finalSystemPrompt = PYCJ_KNOWLEDGE_SYSTEM_PROMPT + ownerContext + "\n\n" + currentModel.persona;

    fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${userToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: finalSystemPrompt }, ...currentSession.history.slice(-14)],
            temperature: 0.3,
            max_tokens: 1024
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!isStreamingActive) return;

        if(data.error) throw new Error(data.error.message);
        const text = data.choices[0].message.content;
        currentSession.history.push({ role: "assistant", content: text });
        saveChatSessionsToStorage();
        setTimeout(() => {
            appendStreamingMessageBubble(text, () => generateFollowUpQuestions(query));
        }, 50);
    })
    .catch(err => {
        if (!isStreamingActive) return;
        stopActiveAIStreaming();
        appendMessageBubble(`Error: ${err.message}`, 'bot-type', true, true);
    });
}

function appendStreamingMessageBubble(fullText, onDoneCallback) {
    const thinkingEl = DOM.chatFeed.querySelector('.thinking-bubble');
    if (thinkingEl) thinkingEl.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper bot-type';
    wrapper.innerHTML = `<div class="msg-avatar">AI</div><div class="msg-content"><div class="msg-bubble"></div><div class="msg-actions-bot" style="display:flex; gap:4px; margin-top:8px; opacity:0; transition: opacity 0.2s;"></div></div>`;
    DOM.chatFeed.appendChild(wrapper);

    const bubble = wrapper.querySelector('.msg-bubble');
    const actionsContainer = wrapper.querySelector('.msg-actions-bot');
    const chars = Array.from(fullText);
    let i = 0;
    activeRawStreamText = "";
    isStreamingActive = true;
    userIsScrollingUp = false; 

    setButtonState(true);

    streamTimer = setInterval(() => {
        if (i < chars.length && isStreamingActive) {
            activeRawStreamText += chars[i];
            parseTextMarkdownContentHTML(bubble, activeRawStreamText, true);
            i++;
            if (!userIsScrollingUp) scrollToBottom();
        } else {
            clearInterval(streamTimer);
            if (isStreamingActive) {
                isStreamingActive = false;
                setButtonState(false);
                parseTextMarkdownContentHTML(bubble, activeRawStreamText, false);
                attachCodeActionListeners(bubble);
                
                actionsContainer.innerHTML = `
                    <button class="action-icon-btn" onclick="copyFullResponse(this)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></button>
                    <button class="action-icon-btn" onclick="handleFeedback(this, 'good')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
                    <button class="action-icon-btn" onclick="handleFeedback(this, 'bad')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg></button>
                    <button class="action-icon-btn" onclick="regenerateResponse()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
                `;
                wrapper.onmouseenter = () => actionsContainer.style.opacity = '1';
                wrapper.onmouseleave = () => actionsContainer.style.opacity = '0';
                
                if(DOM.userInput) DOM.userInput.focus();
                if (onDoneCallback) onDoneCallback();
            }
        }
    }, 8);
}

function stopActiveAIStreaming() {
    clearInterval(streamTimer);
    
    const thinkingEl = DOM.chatFeed.querySelector('.thinking-bubble');
    if (thinkingEl) thinkingEl.remove();

    isStreamingActive = false;
    userIsScrollingUp = false;
    
    setButtonState(false);

    const m = DOM.chatFeed?.lastChild;
    if (m && m.classList.contains('bot-type')) {
        let t = activeRawStreamText;
        if (!t) {
            m.remove();
            return;
        }
        if (((t.match(/```/g) || []).length) % 2 !== 0) t += "\n```";
        const b = m.querySelector('.msg-bubble');
        if(b) {
            parseTextMarkdownContentHTML(b, t, false);
            attachCodeActionListeners(b);
        }

        const actionsContainer = m.querySelector('.msg-actions-bot');
        if (actionsContainer) {
            actionsContainer.innerHTML = `
                <button class="action-icon-btn" onclick="copyFullResponse(this)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></button>
                <button class="action-icon-btn" onclick="handleFeedback(this, 'good')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
                <button class="action-icon-btn" onclick="handleFeedback(this, 'bad')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg></button>
                <button class="action-icon-btn" onclick="regenerateResponse()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
            `;
            m.onmouseenter = () => actionsContainer.style.opacity = '1';
            m.onmouseleave = () => actionsContainer.style.opacity = '0';
        }

        const currentSession = chatSessions.find(s => s.id === activeSessionId);
        if (currentSession) {
            currentSession.history.push({ role: "assistant", content: t });
            saveChatSessionsToStorage();
        }
    }
}

function appendMessageBubble(text, className, isBot, shouldScroll) {
    const thinkingEl = DOM.chatFeed.querySelector('.thinking-bubble');
    if (thinkingEl && className !== 'bot-type thinking-bubble') thinkingEl.remove();

    const w = document.createElement('div');
    w.className = `msg-wrapper ${className}`;
    if (isBot) {
        if (className.includes('thinking-bubble')) {
            w.innerHTML = `<div class="msg-avatar">AI</div><div class="msg-content"><div class="msg-bubble"><div class="thinking-container"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div></div>`;
        } else {
            w.innerHTML = `<div class="msg-avatar">AI</div><div class="msg-content"><div class="msg-bubble"></div><div class="msg-actions-bot" style="display:flex; gap:4px; margin-top:8px; opacity:0; transition: opacity 0.2s;"></div></div>`;
            const b = w.querySelector('.msg-bubble');
            parseTextMarkdownContentHTML(b, text, false);
            attachCodeActionListeners(b);
            const actionsContainer = w.querySelector('.msg-actions-bot');
            actionsContainer.innerHTML = `
                <button class="action-icon-btn" onclick="copyFullResponse(this)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></button>
                <button class="action-icon-btn" onclick="handleFeedback(this, 'good')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>
                <button class="action-icon-btn" onclick="handleFeedback(this, 'bad')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg></button>
                <button class="action-icon-btn" onclick="regenerateResponse()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
            `;
            w.onmouseenter = () => actionsContainer.style.opacity = '1';
            w.onmouseleave = () => actionsContainer.style.opacity = '0';
        }
    } else {
        w.innerHTML = `<div class="msg-content user-content"><div class="msg-bubble user-bubble"></div></div>`;
        w.querySelector('.msg-bubble').textContent = text;
    }
    DOM.chatFeed.appendChild(w); 
    if (shouldScroll && !userIsScrollingUp) setTimeout(scrollToBottom, 50);
}

function generateSmartChatTitle(msg, obj) {
    const t = localStorage.getItem('pycj_api_key'); if (!t) return;
    fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Authorization": `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: "2-3 word title. ONLY output title." }, { role: "user", content: msg }], temperature: 0.1, max_tokens: 10 }) }).then(r => r.json()).then(d => { if(d.choices?.[0]?.message?.content) executeDirectSessionRename(obj, d.choices[0].message.content.trim().replace(/^["']|["']$/g, '')); }).catch(() => {});
}

function executeDirectSessionRename(obj, newTitle) { obj.title = newTitle; saveChatSessionsToStorage(); renderSidebarHistoryList(); }

function regenerateResponse() {
    const s = chatSessions.find(s => s.id === activeSessionId);
    if (!s || s.history.length === 0) return;

    DOM.chatFeed.querySelector('.follow-up-container')?.remove();

    // If the last response was from the assistant, remove it
    if (s.history[s.history.length - 1].role === "assistant") {
        s.history.pop();
        if(DOM.chatFeed.lastChild) DOM.chatFeed.lastChild.remove();
    }
    
    saveChatSessionsToStorage();
    
    // Fire generation using remaining context without pushing a new user bubble
    submitMessagePipeline(s.history);
}

function copyFullResponse(btn) {
    const wrapper = btn.closest('.msg-wrapper');
    const bubble = wrapper ? wrapper.querySelector('.msg-bubble') : null;
    if (bubble) {
        let cleanText = bubble.innerText || bubble.textContent;
        navigator.clipboard.writeText(cleanText).then(() => showToast("Response copied"));
    }
}

function handleFeedback(btn, type) {
    showToast(type === 'good' ? "Thanks for your feedback!" : "Feedback logged");
}

function escapeHTML(s) { return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split('"').join("&quot;").split("'").join("&#039;"); }

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
window.refreshDashboardSuggestions = refreshDashboardSuggestions;
window.completeOnboarding = completeOnboarding;
window.handleButtonClick = handleButtonClick;

function parseTextMarkdownContentHTML(el, text, showCursor = false) {
    let segments = text.split("```"), html = "";
    for (let i = 0; i < segments.length; i++) {
        if (i % 2 === 1) {
            let block = segments[i], lines = block.split("\n"), lang = lines[0].toLowerCase().trim();
            if (["javascript", "pycj", "python", "html", "css"].includes(lang)) lines.shift();
            else lang = "code";
            let code = lines.join("\n");
            if (showCursor && i === segments.length - 1) {
                html += `<div class="code-block-container"><div class="code-header"><span>${lang}</span><button class="copy-code-badge" data-code="${encodeURIComponent(code)}">Copy code</button></div><pre><code>${highlightSyntaxPyCJEngine(code)}<span class="streaming-cursor">█</span></code></pre></div>`;
            } else {
                html += `<div class="code-block-container"><div class="code-header"><span>${lang}</span><button class="copy-code-badge" data-code="${encodeURIComponent(code)}">Copy code</button></div><pre><code>${highlightSyntaxPyCJEngine(code)}</code></pre></div>`;
            }
        } else {
            let plain = segments[i];
            if (showCursor && i === segments.length - 1) {
                html += parseInlineMarkdownStyling(plain) + `<span class="streaming-cursor">█</span>`;
            } else {
                html += parseInlineMarkdownStyling(plain);
            }
        }
    }
    el.innerHTML = html;
}

function parseInlineMarkdownStyling(txt) {
    let html = escapeHTML(txt);
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    return html.split("\n").join("<br>");
}

function highlightSyntaxPyCJEngine(code) {
    let e = escapeHTML(code);
    e = e.replace(/"([^"\\]|\\.)*"/g, '<span style="color:#a7f3d0;">$&</span>');
    e = e.replace(/'([^'\\]|\\.)*'/g, '<span style="color:#a7f3d0;">$&</span>');
    e = e.replace(/\b(imagine|structure|output|print|ask|str|int|float|bool|repeat|function|return|if|else|elif|for|while|true|True|false|False)\b/g, '<span style="color:#f43f5e; font-weight:bold;">$1</span>');
    return e.replace(/\b(\d+)\b/g, '<span style="color:#fbbf24;">$1</span>');
}

function attachCodeActionListeners(p) {
    p.querySelectorAll('.copy-code-badge').forEach(b => {
        b.onclick = () => navigator.clipboard.writeText(decodeURIComponent(b.getAttribute('data-code'))).then(() => showToast("Code copied"));
    });
}

const PYCJ_KNOWLEDGE_SYSTEM_PROMPT = `
You are the official AI Assistant for the PyCJ programming language.

CORE ENGINE DEFINITION:
- Architecture Framework: Powered by the "PyCJ Assistant Model V1".
- Production Timeline: PyCJ was officially launched and distributed in 2026.

THE TRUE NAME ORIGIN (HOW PYCJ WAS BORN):
- "Py": Initial engineering iterations began within a Python framework but were ultimately abandoned.
- "C": Subsequent low-level compilation attempts were prototyped in C and proved inefficient.
- "J": The final, highly performant engine implementation was successfully built entirely on JavaScript execution architecture.
- Hence the naming designation: Py-C-J.

ONBOARDING & PERSONALIZATION MANIFESTO:
- Maintain awareness of the user's explicit profile configurations (Name and preferred conversational language framework).
- Dynamically format chat dialog templates to match their chosen baseline language format (English, Roman English, or Roman Urdu). Respect explicit manual linguistic overrides requested inline during active sessions.

STRICT COMPILATION & VALIDATION PIPELINE:
- Prior to outputting any block of PyCJ source code, validate syntax structure against structural parameters.
- Single '=' operators inside evaluation clauses ('if', 'elif', 'repeat', and 'for') represent standard equality verification checkpoints rather than assignment declarations.

TONE & ANSWER LENGTH:
1. Deliver direct, point-to-point, structurally concise explanations of medium scale.
2. Translate complex logical structures into clear, instructional analogies appropriate for developers of any skill level.

STRICT INFO ABOUT OWNER / ARSHMAN:
- Creator: Arshman (Full-stack systems engineer, 15 years old, studies at SMS Aga Khan School, Karachi Karimabad).
- Objective Target: Strategic specialization as a Red Hat security operative within the Cyber Security domain.
- Resource Links:
  * Official PyCJ Compiler: https://pycjcompiler.vercel.app/
  * GitHub Repository: https://github.com/ZentrixVayne
  * Personal Portfolio: https://portfolioofarshman.vercel.app/

OFFICIAL PYCJ SYNTAX SPECIFICATION MANUAL:
1. OUTPUT: output("text") or output(variable)
2. VARIABLES: imagine variableName = value
3. CONDITIONALS: if x = 10 { }, elif x = 5 { }, else { } -> single evaluation '=' operator format.
4. LOOPS: for (imagine i = 1 , i <= 5 , i++) { }, repeat condition { }
`;

// State Managers
let chatSessions = [];
let activeSessionId = null;
let isStreamingActive = false;
let streamTimer = null;
let activeRawStreamText = "";

// History Tracking
let inputUndoStack = [];
let inputRedoStack = [];
const MAX_UNDO_DEPTH = 40;

document.addEventListener('DOMContentLoaded', () => {
    loadChatSessionsFromStorage();
    checkUserApiKeyAuthorization();
    setupInputHistoryEventInterceptor();
});

function loadChatSessionsFromStorage() {
    const stored = localStorage.getItem('pycj-chat-sessions');
    if (stored) {
        chatSessions = JSON.parse(stored);
    }
    createNewChatSession(false); 
}

function saveChatSessionsToStorage() {
    localStorage.setItem('pycj-chat-sessions', JSON.stringify(chatSessions));
}

function createNewChatSession(shouldSaveImmediate = true) {
    const newSession = {
        id: "session_" + Date.now(),
        title: "New Session Connection",
        history: []
    };
    chatSessions.unshift(newSession);
    activeSessionId = newSession.id;
    if (shouldSaveImmediate) saveChatSessionsToStorage();
    renderSidebarHistoryList();
    loadActiveSessionChatFeed();
}

function selectChatSession(id) {
    if (isStreamingActive) stopActiveAIStreaming();
    activeSessionId = id;
    renderSidebarHistoryList();
    loadActiveSessionChatFeed();
}

function renameChatSession(id, event) {
    event.stopPropagation();
    const session = chatSessions.find(s => s.id === id);
    if (!session) return;
    const newTitle = prompt("Update conversation designation:", session.title);
    if (newTitle && newTitle.trim()) {
        session.title = newTitle.trim();
        saveChatSessionsToStorage();
        renderSidebarHistoryList();
        if (activeSessionId === id) {
            document.getElementById('current-chat-title').textContent = session.title;
        }
    }
}

function deleteChatSession(id, event) {
    event.stopPropagation();
    if (isStreamingActive && activeSessionId === id) stopActiveAIStreaming();
    chatSessions = chatSessions.filter(s => s.id !== id);
    if (chatSessions.length === 0) {
        createNewChatSession();
    } else {
        if (activeSessionId === id) activeSessionId = chatSessions[0].id;
        saveChatSessionsToStorage();
        renderSidebarHistoryList();
        loadActiveSessionChatFeed();
    }
}

function renderSidebarHistoryList() {
    const container = document.getElementById('history-list');
    if (!container) return;
    container.innerHTML = "";
    chatSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = `history-item ${session.id === activeSessionId ? 'active' : ''}`;
        item.onclick = () => selectChatSession(session.id);
        item.innerHTML = `
            <span class="title-text">${escapeHTML(session.title)}</span>
            <div class="item-actions">
                <button class="action-btn" onclick="renameChatSession('${session.id}', event)" title="Rename">✏️</button>
                <button class="action-btn del-btn" onclick="deleteChatSession('${session.id}', event)" title="Delete">🗑️</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function loadActiveSessionChatFeed() {
    const feed = document.getElementById('chat-feed');
    if (!feed) return;
    feed.innerHTML = "";
    const session = chatSessions.find(s => s.id === activeSessionId);
    if (!session) return;
    document.getElementById('current-chat-title').textContent = session.title;
    if (session.history.length === 0) {
        feed.innerHTML = `<div class="message system-msg"><span>Interface initialized. Enter query to consult PyCJ context models.</span></div>`;
        return;
    }
    session.history.forEach(msg => {
        if (msg.role === "user") appendMessageBubble(msg.content, 'user-bubble', false, false);
        else if (msg.role === "assistant") appendMessageBubble(msg.content, 'bot-bubble', true, false);
    });
    feed.scrollTop = feed.scrollHeight;
}

function setupInputHistoryEventInterceptor() {
    const inputEl = document.getElementById('userMessageInput');
    if (!inputEl) return;
    inputUndoStack.push("");
    inputEl.addEventListener('input', (e) => {
        inputEl.style.height = 'auto';
        inputEl.style.height = Math.min(inputEl.scrollHeight, 150) + 'px';
        if (e.inputType === 'historyUndo' || e.inputType === 'historyRedo') return;
        const currentVal = inputEl.value;
        if (inputUndoStack[inputUndoStack.length - 1] !== currentVal) {
            inputUndoStack.push(currentVal);
            if (inputUndoStack.length > MAX_UNDO_DEPTH) inputUndoStack.shift();
            inputRedoStack = []; 
        }
    });
    inputEl.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (inputUndoStack.length > 1) {
                const poppedCurrent = inputUndoStack.pop();
                inputRedoStack.push(poppedCurrent);
                inputEl.value = inputUndoStack[inputUndoStack.length - 1];
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            if (inputRedoStack.length > 0) {
                const stateToRecover = inputRedoStack.pop();
                inputUndoStack.push(stateToRecover);
                inputEl.value = stateToRecover;
            }
        }
    });
}

function checkUserApiKeyAuthorization() {
    const activeKey = localStorage.getItem('chatbot-groq-key');
    const inputEl = document.getElementById('userMessageInput');
    if (!activeKey) {
        openKeyModal();
        if (inputEl) {
            inputEl.disabled = true;
            inputEl.placeholder = "Awaiting credentials initialization...";
        }
    } else if (inputEl) {
        inputEl.disabled = false;
        inputEl.placeholder = "Ask about imagine, output, ask, or loops...";
    }
}

function openKeyModal() {
    const modal = document.getElementById('key-modal');
    const inputKey = document.getElementById('modalApiKey');
    const inputName = document.getElementById('modalUserName');
    const selectLang = document.getElementById('modalLanguage');
    if (modal) {
        if (inputKey) inputKey.value = localStorage.getItem('chatbot-groq-key') || '';
        if (inputName) inputName.value = localStorage.getItem('chatbot-user-name') || '';
        if (selectLang) selectLang.value = localStorage.getItem('chatbot-user-lang') || 'English';
        modal.classList.add('active');
    }
}

function saveApiKeyCredentials() {
    const keyInput = document.getElementById('modalApiKey').value.trim();
    const nameInput = document.getElementById('modalUserName').value.trim();
    const langInput = document.getElementById('modalLanguage').value;

    if (nameInput) {
        localStorage.setItem('chatbot-user-name', nameInput);
    }
    localStorage.setItem('chatbot-user-lang', langInput);

    if (keyInput && keyInput.startsWith("gsk_")) {
        localStorage.setItem('chatbot-groq-key', keyInput);
    } else if (!keyInput) {
        localStorage.removeItem('chatbot-groq-key');
    } else {
        alert("Authentication syntax error: Groq token strings must utilize the 'gsk_' prefix.");
        return; 
    }
    document.getElementById('key-modal').classList.remove('active');
    checkUserApiKeyAuthorization();
}

function handleInputKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (!document.getElementById('userMessageInput').disabled) submitMessagePipeline();
    }
}

function toggleButtonToStopState(activeState) {
    const sendIcon = document.getElementById('send-icon');
    const stopIcon = document.getElementById('stop-icon');
    const sendBtn = document.getElementById('send-msg-btn');
    if (activeState) {
        sendIcon.style.display = 'none';
        stopIcon.style.display = 'block';
        sendBtn.setAttribute('onclick', 'stopActiveAIStreaming()');
        sendBtn.style.background = 'var(--accent-danger)';
    } else {
        sendIcon.style.display = 'block';
        stopIcon.style.display = 'none';
        sendBtn.setAttribute('onclick', 'submitMessagePipeline()');
        sendBtn.style.background = 'var(--accent-blue)';
    }
}

function stopActiveAIStreaming() {
    if (streamTimer) clearInterval(streamTimer);
    isStreamingActive = false;
    toggleButtonToStopState(false);
    const inputEl = document.getElementById('userMessageInput');
    if (inputEl) {
        inputEl.disabled = false;
        inputEl.focus();
    }
    const feed = document.getElementById('chat-feed');
    if (feed && feed.lastChild && feed.lastChild.classList.contains('bot-bubble')) {
        feed.lastChild.classList.remove('streaming');
        let textContentRaw = activeRawStreamText;
        if (((textContentRaw.match(/```/g) || []).length) % 2 !== 0) textContentRaw += "\n```"; 
        parseTextMarkdownContentHTML(feed.lastChild, textContentRaw);
        attachCodeActionListeners(feed.lastChild);
    }
}

function submitMessagePipeline(customQuery = null) {
    const userToken = localStorage.getItem('chatbot-groq-key');
    if (!userToken) { openKeyModal(); return; }
    const currentSession = chatSessions.find(s => s.id === activeSessionId);
    if (!currentSession) return;
    
    const inputEl = document.getElementById('userMessageInput');
    const query = customQuery ? customQuery.trim() : inputEl.value.trim();
    if (!query) return;

    appendMessageBubble(query, 'user-bubble', false, true);
    if (!customQuery) {
        inputEl.value = '';
        inputEl.style.height = 'auto';
    }
    inputEl.disabled = true;
    toggleButtonToStopState(true);

    currentSession.history.push({ role: "user", content: query });
    saveChatSessionsToStorage();

    const feed = document.getElementById('chat-feed');
    const loader = document.createElement('div');
    loader.className = 'message typing-loader';
    loader.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
    feed.appendChild(loader);
    feed.scrollTop = feed.scrollHeight;

    const currentUserName = localStorage.getItem('chatbot-user-name') || "User";
    const currentUserLang = localStorage.getItem('chatbot-user-lang') || "English";
    const structuredDynamicContext = `\nCURRENT USER SESSION METADATA:\n- User Identification Profile: ${currentUserName}\n- Baseline Linguistic Selection Strategy: ${currentUserLang}\nExecute processing operations strictly within these user configuration parameters.`;

    fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${userToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "system", content: PYCJ_KNOWLEDGE_SYSTEM_PROMPT + structuredDynamicContext }, ...currentSession.history.slice(-14)],
            temperature: 0.2
        })
    })
    .then(res => res.json())
    .then(data => {
        loader.remove();
        const responseText = data.choices[0].message.content;
        currentSession.history.push({ role: "assistant", content: responseText });
        saveChatSessionsToStorage();
        setTimeout(() => appendStreamingMessageBubble(responseText), 400);
    })
    .catch(() => {
        loader.remove();
        toggleButtonToStopState(false);
        inputEl.disabled = false;
    });
}

function appendStreamingMessageBubble(fullText) {
    const feed = document.getElementById('chat-feed');
    const bubble = document.createElement('div');
    bubble.className = `message bot-bubble streaming`;
    feed.appendChild(bubble);
    
    let wordTokens = fullText.split(" ");
    let currentTokenIndex = 0;
    activeRawStreamText = "";
    isStreamingActive = true;
    
    streamTimer = setInterval(() => {
        if (currentTokenIndex < wordTokens.length && isStreamingActive) {
            activeRawStreamText += (currentTokenIndex === 0 ? "" : " ") + wordTokens[currentTokenIndex];
            parseTextMarkdownContentHTML(bubble, activeRawStreamText);
            feed.scrollTop = feed.scrollHeight;
            currentTokenIndex++;
        } else {
            clearInterval(streamTimer);
            isStreamingActive = false;
            toggleButtonToStopState(false);
            bubble.classList.remove('streaming');
            parseTextMarkdownContentHTML(bubble, activeRawStreamText);
            attachCodeActionListeners(bubble);
            const inputEl = document.getElementById('userMessageInput');
            if (inputEl) { inputEl.disabled = false; inputEl.focus(); }
        }
    }, 35);
}

function parseTextMarkdownContentHTML(elementTarget, text) {
    let segments = text.split("```");
    let htmlContent = "";
    for (let i = 0; i < segments.length; i++) {
        if (i % 2 === 1) {
            let blockContent = segments[i];
            let lines = blockContent.split("\n");
            if (["javascript", "pycj", "python", "html", "css"].includes(lines[0].toLowerCase().trim())) lines.shift();
            let rawCode = lines.join("\n").trim();
            htmlContent += `
                <div class="code-block-wrapper" style="position:relative; margin: 16px 0; border: 1px solid #2d3748; border-radius: 8px; overflow: hidden; background: #090b11;">
                    <div class="code-block-header" style="display:flex; justify-content:flex-end; gap:6px; background:#141822; padding: 6px 12px; border-bottom: 1px solid #1e2433;">
                        <button class="run-code-badge" data-code="${encodeURIComponent(rawCode)}" style="background:#22c55e; color:#fff; border:none; padding:3px 8px; border-radius:4px; font-size:0.72rem; cursor:pointer; font-weight:bold; display:flex; align-items:center; gap:2px;">▶ Run Code</button>
                        <button class="explain-code-badge" data-code="${encodeURIComponent(rawCode)}" style="background:#3b82f6; color:#fff; border:none; padding:3px 8px; border-radius:4px; font-size:0.72rem; cursor:pointer; font-weight:bold;">💡 Explain Code</button>
                        <button class="copy-code-badge" data-code="${encodeURIComponent(rawCode)}" style="background:#1e2433; color:#64748b; border:1px solid #2d3748; padding:3px 8px; border-radius:4px; font-size:0.72rem; cursor:pointer;">Copy</button>
                    </div>
                    <pre style="margin:0; padding:12px; overflow-x:auto;"><code>${applySyntaxColoringTokens(rawCode)}</code></pre>
                </div>`;
        } else {
            let processedBlock = segments[i].replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/`(.*?)`/g, '<code>$1</code>');
            processedBlock.split("\n").forEach((line) => {
                let trimmed = line.trim();
                if (!trimmed) { htmlContent += "<br>"; return; }
                if (/^[A-D]\..+/i.test(trimmed) || /^\d+\..+/.test(trimmed)) htmlContent += `<div style="margin-left:18px; padding: 4px 0; font-weight:500;">${trimmed}</div>`;
                else if (trimmed.startsWith("-") || trimmed.startsWith("*")) htmlContent += `<div style="margin-left:12px; padding: 3px 0;">• ${trimmed.substring(1).trim()}</div>`;
                else htmlContent += `<span class="prose-line" style="display:block; padding: 2px 0;">${trimmed}</span>`;
            });
        }
    }
    elementTarget.innerHTML = htmlContent;
}

function applySyntaxColoringTokens(codeText) {
    let escaped = escapeHTML(codeText);
    escaped = escaped.replace(/(["'])(.*?)\1/g, '<span style="color:#a7f3d0;">$1$2$1</span>');
    let keywords = /\b(imagine|structure|output|ask|repeat|function|return|if|else|elif|for|while)\b/g;
    escaped = escaped.replace(keywords, '<span style="color:#f43f5e; font-weight:bold;">$1</span>');
    return escaped.replace(/\b(\d+)\b/g, '<span style="color:#fbbf24;">$1</span>');
}

function attachCodeActionListeners(parentElement) {
    parentElement.querySelectorAll('.copy-code-badge').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = decodeURIComponent(btn.getAttribute('data-code'));
            navigator.clipboard.writeText(code).then(() => {
                btn.textContent = "Copied!";
                setTimeout(() => { btn.textContent = "Copy"; }, 2000);
            });
        });
    });

    parentElement.querySelectorAll('.run-code-badge').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = decodeURIComponent(btn.getAttribute('data-code'));
            if (window.opener || window.parent) {
                const targetWindow = window.opener || window.parent;
                const parentEditor = targetWindow.document.getElementById('editor');
                const parentRunBtn = targetWindow.document.getElementById('run-btn');
                
                if (parentEditor) {
                    parentEditor.value = code;
                    parentEditor.dispatchEvent(new Event('input', { bubbles: true }));
                    if (parentRunBtn) {
                        parentRunBtn.click();
                        const tabConsole = targetWindow.document.getElementById('tab-console');
                        if (tabConsole) tabConsole.click();
                    }
                } else {
                    localStorage.setItem('pycj-saved-code', code);
                    alert("Code payload successfully transferred to active storage context.");
                }
            }
        });
    });

    parentElement.querySelectorAll('.explain-code-badge').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = decodeURIComponent(btn.getAttribute('data-code'));
            const promptText = `Provide a structural, step-by-step breakdown of this PyCJ execution logic:\n\n\`\`\`pycj\n${code}\n\`\`\``;
            submitMessagePipeline(promptText);
        });
    });
}

function appendMessageBubble(text, cssClass, parseMarkdown = false, shouldScroll = true) {
    const feed = document.getElementById('chat-feed');
    if (!feed) return;
    const bubble = document.createElement('div');
    bubble.className = `message ${cssClass}`;
    if (parseMarkdown) { parseTextMarkdownContentHTML(bubble, text); attachCodeActionListeners(bubble); }
    else bubble.textContent = text;
    feed.appendChild(bubble);
    if (shouldScroll) feed.scrollTop = feed.scrollHeight;
}

function escapeHTML(str) {
    return str.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split('"').join("&quot;").split("'").join("&#039;");
}

window.createNewChatSession = createNewChatSession;
window.renameChatSession = renameChatSession;
window.deleteChatSession = deleteChatSession;
window.selectChatSession = selectChatSession;
window.openKeyModal = openKeyModal;
window.saveApiKeyCredentials = saveApiKeyCredentials;
window.handleInputKeyPress = handleInputKeyPress;
window.submitMessagePipeline = submitMessagePipeline;
window.stopActiveAIStreaming = stopActiveAIStreaming;

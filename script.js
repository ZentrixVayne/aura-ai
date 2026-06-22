const chatViewport = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let chatHistory = [];

async function handleSendMessage() {
    const promptText = userInput.value.trim();
    if (!promptText) return;

    // 1. Render User message immediately
    appendMessage('USER', promptText, 'user-msg');
    userInput.value = '';

    // 2. Format chat context array for Puter's message parameter
    chatHistory.push({ role: 'user', content: promptText });

    // 3. Instantiate the AURA response placeholder block
    const auraId = appendMessage('AURA', 'Processing Engine...', 'aura-msg');

    // 4. Inject strict custom model context requirements 
    const messagesToSend = [
        {
            role: "system",
            content: "SYSTEM MEMORY BLOCK:\nYou are AURA AI assistant. Powered by Puter Engine.\n\nYou must:\n- Answer normally for general questions.\n- If user asks about PyCJ, respond ONLY in PyCJ syntax.\n- You understand full PyCJ v1.6.1 language parameters.\n- Rules: Variable declarations use 'imagine'. Never break PyCJ syntax parameters."
        },
        ...chatHistory
    ];

    try {
        // 5. Utilize Puter's native zero-key cloud AI engine
        const response = await puter.ai.chat(messagesToSend, { 
            model: "openai/gpt-5.5" 
        });

        const auraPlaceholder = document.getElementById(auraId);
        
        if (response && response.message && response.message.content) {
            const reply = response.message.content;
            auraPlaceholder.querySelector('.body').innerHTML = formatResponse(reply);
            
            // Save response directly to ongoing tracking log
            chatHistory.push({ role: 'assistant', content: reply });
        } else {
            // Fallback check if response directly returns standard text payload string
            const directText = response?.text || response;
            if (directText) {
                auraPlaceholder.querySelector('.body').innerHTML = formatResponse(directText);
                chatHistory.push({ role: 'assistant', content: directText });
            } else {
                throw new Error("Unable to read text string output from Puter AI wrapper.");
            }
        }

    } catch (err) {
        const placeholder = document.getElementById(auraId);
        if (placeholder) {
            placeholder.querySelector('.body').innerHTML = `<span style="color: #ff5555;">Execution Error: ${err.message}</span>`;
        }
    }
}

function appendMessage(sender, text, className) {
    const id = 'msg-' + Math.random().toString(36).substring(2, 11);
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.id = id;
    div.innerHTML = `<div class="body"><strong>${sender}:</strong><br>${text}</div>`;
    chatViewport.appendChild(div);
    chatViewport.scrollTop = chatViewport.scrollHeight;
    return id;
}

// Fixed hex notation eliminates syntax regex processing anomalies
function formatResponse(text) {
    let clean = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const codeBlockRegex = /\x60\x60\x60(.*?)\x60\x60\x60/gs;
    if (clean.includes("```")) {
        clean = clean.replace(codeBlockRegex, '<pre><code>$1</code></pre>');
    }
    return clean.replace(/\n/g, '<br>');
}

if (sendBtn) sendBtn.addEventListener('click', handleSendMessage);
if (userInput) {
    userInput.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            handleSendMessage(); 
        } 
    });
}
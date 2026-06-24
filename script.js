:root { --transition-speed: 0.2s; }
[data-theme="dark"] {
    --bg-main: #0a0a0a; --bg-sidebar: #0f0f0f; --bg-card: #1a1a1a; --bg-input: #1a1a1a;
    --bg-hover: rgba(255, 255, 255, 0.06); --bg-active: rgba(255, 255, 255, 0.1);
    --border-color: rgba(255, 255, 255, 0.08); --border-active: rgba(255, 255, 255, 0.2);
    --accent: #10a37f; --accent-hover: #0d8c6d;
    --text-primary: #ececec; --text-secondary: #b4b4b4; --text-muted: #6e6e6e;
    --code-bg: #111111; --code-header-bg: #1a1a1a; --modal-bg: rgba(0, 0, 0, 0.8);
    --shadow: 0 4px 20px rgba(0,0,0,0.5);
}
[data-theme="light"] {
    --bg-main: #ffffff; --bg-sidebar: #f9f9f9; --bg-card: #f0f0f0; --bg-input: #ffffff;
    --bg-hover: rgba(0, 0, 0, 0.04); --bg-active: rgba(0, 0, 0, 0.08);
    --border-color: #e5e5e5; --border-active: #cccccc;
    --accent: #10a37f; --accent-hover: #0d8c6d;
    --text-primary: #1a1a1a; --text-secondary: #666666; --text-muted: #999999;
    --code-bg: #f5f5f5; --code-header-bg: #eeeeee; --modal-bg: rgba(0, 0, 0, 0.4);
    --shadow: 0 4px 20px rgba(0,0,0,0.1);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: var(--bg-main); color: var(--text-primary); height: 100vh; width: 100vw; display: flex; overflow: hidden; transition: background-color var(--transition-speed), color var(--transition-speed); }
.app-layout { display: flex; width: 100%; height: 100%; }
.sidebar-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 90; }
.sidebar { width: 260px; background-color: var(--bg-sidebar); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; padding: 12px; flex-shrink: 0; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color var(--transition-speed); z-index: 100; }
.sidebar-header { padding: 8px; margin-bottom: 8px; }
.brand-title { display: flex; align-items: center; gap: 10px; color: var(--text-primary); }
.brand-logo { font-size: 1.2rem; font-weight: 700; letter-spacing: -0.5px; }
.btn-new-chat { width: 100%; background: transparent; color: var(--text-primary); border: 1px solid var(--border-color); padding: 10px 16px; border-radius: 10px; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px; font-weight: 500; }
.btn-new-chat:hover { background-color: var(--bg-hover); border-color: var(--border-active); }
.sidebar-search { display: flex; align-items: center; gap: 8px; background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; margin: 12px 0; color: var(--text-muted); }
.sidebar-search input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 0.85rem; width: 100%; }
.history-section { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
.history-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); padding: 0 8px 4px; font-weight: 600; }
.history-date-label { font-size: 0.75rem; color: var(--text-secondary); padding: 8px 8px 4px; font-weight: 500; }
.history-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.history-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; cursor: pointer; transition: all 0.15s; font-size: 0.88rem; color: var(--text-secondary); border-radius: 8px; margin: 0 0 2px; }
.history-item:hover { background-color: var(--bg-hover); color: var(--text-primary); }
.history-item.active { background-color: var(--bg-active); color: var(--text-primary); }
.item-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-delete { background: transparent; border: none; cursor: pointer; font-size: 0.7rem; padding: 4px; opacity: 0; transition: opacity 0.2s; border-radius: 4px; color: var(--text-muted); }
.history-item:hover .item-delete { opacity: 0.6; }
.item-delete:hover { opacity: 1 !important; background: var(--bg-active); }
.sidebar-footer { border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 12px; display: flex; flex-direction: column; gap: 2px; }
.sidebar-action-btn { width: 100%; background: transparent; border: none; padding: 10px 12px; border-radius: 8px; color: var(--text-secondary); font-size: 0.88rem; cursor: pointer; text-align: left; transition: all 0.15s; display: flex; align-items: center; gap: 10px; }
.sidebar-action-btn:hover { background-color: var(--bg-hover); color: var(--text-primary); }
.chat-container { background-color: var(--bg-main); flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; transition: background-color var(--transition-speed); }
.chat-header { padding: 12px 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-main); transition: background-color var(--transition-speed); }
.hamburger-btn { display: none; background: transparent; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px; border-radius: 6px; }
.hamburger-btn:hover { color: var(--text-primary); background: var(--bg-hover); }
.header-right-controls { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.theme-toggle-btn { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.theme-toggle-btn:hover { background-color: var(--bg-hover); color: var(--text-primary); border-color: var(--border-active); }
[data-theme="dark"] .icon-sun { display: none; }
[data-theme="light"] .icon-moon { display: none; }
.chat-workspace { flex: 1; overflow-y: auto; width: 100%; display: flex; flex-direction: column; position: relative; }
.chat-feed { max-width: 768px; width: 100%; margin: 0 auto; padding: 24px 24px 140px 24px; display: flex; flex-direction: column; gap: 24px; flex: 1; }
.dashboard-container { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; margin: auto 0; padding: 40px 0; animation: fadeIn 0.4s ease; }
.dashboard-title { font-size: 1.8rem; font-weight: 600; margin-bottom: 12px; color: var(--text-primary); }
.dashboard-subtitle { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 40px; }
.suggestion-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-width: 560px; width: 100%; }
.suggestion-card { background: transparent; border: 1px solid var(--border-color); padding: 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s; text-align: left; }
.suggestion-card:hover { background-color: var(--bg-hover); border-color: var(--border-active); }
.suggestion-text { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; }
.suggestion-card:hover .suggestion-text { color: var(--text-primary); }
.scroll-fab { position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%) translateY(20px); background-color: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow); opacity: 0; pointer-events: none; transition: all 0.2s; z-index: 10; }
.scroll-fab.visible { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0); }
.scroll-fab:hover { background-color: var(--bg-active); color: var(--text-primary); }
.msg-wrapper { display: flex; gap: 16px; width: 100%; opacity: 0; transform: translateY(10px); animation: slideIn 0.3s ease forwards; }
.msg-wrapper.user-type { justify-content: flex-end; animation-name: slideInRight; }
@keyframes slideIn { to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { to { opacity: 1; transform: translateX(0); } from { transform: translateX(20px); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.msg-avatar { width: 28px; height: 28px; border-radius: 4px; background-color: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: white; flex-shrink: 0; margin-top: 2px; }
.msg-content { max-width: 85%; min-width: 0; }
.user-content { display: flex; justify-content: flex-end; }
.msg-bubble { padding: 0; font-size: 0.95rem; line-height: 1.7; color: var(--text-primary); position: relative; }
.user-bubble { background-color: var(--bg-card); padding: 12px 16px; border-radius: 16px 16px 4px 16px; border: 1px solid var(--border-color); max-width: fit-content; }
.msg-actions { display: flex; gap: 4px; margin-top: 8px; opacity: 0; transition: opacity 0.2s; }
.msg-wrapper:hover .msg-actions { opacity: 1; }
.msg-action-btn { background: transparent; border: 1px solid transparent; color: var(--text-muted); padding: 4px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; transition: all 0.15s; }
.msg-action-btn:hover { color: var(--text-primary); background-color: var(--bg-hover); border-color: var(--border-color); }
.thinking-container { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-size: 0.9rem; padding: 4px 0; }
.thinking-dots { display: flex; gap: 4px; }
.thinking-dots span { width: 6px; height: 6px; background-color: var(--text-muted); border-radius: 50%; animation: thinkingBounce 1.4s infinite ease-in-out both; }
.thinking-dots span:nth-child(1) { animation-delay: -0.32s; }
.thinking-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes thinkingBounce { 0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
.chat-input-area { padding: 0 24px 16px; width: 100%; background: transparent; }
.input-container-premium { max-width: 768px; margin: 0 auto; background-color: var(--bg-input); border: 1px solid var(--border-color); border-radius: 24px; padding: 12px 12px 8px 20px; display: flex; flex-direction: column; gap: 4px; box-shadow: var(--shadow); transition: border-color 0.2s, background-color var(--transition-speed); }
.input-container-premium:focus-within { border-color: var(--border-active); }
.input-main-row { display: flex; align-items: flex-end; gap: 12px; }
.input-main-row textarea { flex: 1; background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 1rem; font-family: inherit; resize: none; max-height: 150px; line-height: 1.5; padding: 4px 0; }
.input-main-row textarea:disabled { opacity: 0.5; cursor: not-allowed; }
.send-button { background-color: var(--text-primary); color: var(--bg-main); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.1s, opacity 0.2s; flex-shrink: 0; margin-bottom: 2px; }
.send-button:hover { transform: scale(1.05); }
.send-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.input-sub-row { display: flex; justify-content: space-between; align-items: center; padding-left: 4px; height: 24px; }
.stop-generate-text { font-size: 0.8rem; color: var(--text-muted); cursor: pointer; display: none; transition: color 0.2s; }
.stop-generate-text.active { display: block; }
.stop-generate-text:hover { color: var(--text-primary); }
.model-badge-sub { font-size: 0.75rem; color: var(--text-muted); }
.footer-disclaimer { text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 8px; max-width: 768px; margin-left: auto; margin-right: auto; }
.onboarding-box { max-width: 420px; padding: 0; overflow: hidden; }
.onboarding-header { background: var(--bg-active); padding: 40px 32px; text-align: center; border-bottom: 1px solid var(--border-color); }
.onboarding-logo { color: var(--accent); margin-bottom: 16px; display: flex; justify-content: center; }
.onboarding-header h2 { font-size: 1.5rem; margin-bottom: 8px; }
.onboarding-sub { color: var(--text-secondary); font-size: 0.95rem; }
.onboarding-body { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
.input-hint { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }
.input-hint a { color: var(--accent); text-decoration: none; }
.input-hint a:hover { text-decoration: underline; }
.btn-continue { width: 100%; background: var(--accent); color: white; border: none; padding: 14px; border-radius: 12px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-continue:hover { background: var(--accent-hover); }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--modal-bg); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 1000; backdrop-filter: blur(4px); }
.modal-overlay.active { opacity: 1; pointer-events: auto; }
.modal-box { background: var(--bg-sidebar); border: 1px solid var(--border-color); border-radius: 16px; width: 480px; max-width: 90vw; padding: 0; display: flex; flex-direction: column; box-shadow: 0 10px 40px rgba(0,0,0,0.4); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
.modal-header h3 { font-size: 1.1rem; font-weight: 600; }
.modal-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 6px; }
.modal-close:hover { color: var(--text-primary); background: var(--bg-hover); }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-group label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }
.input-group input, .input-group select { background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-primary); padding: 10px 12px; border-radius: 8px; outline: none; font-size: 0.9rem; }
.input-group input:focus, .input-group select:focus { border-color: var(--accent); }
.api-help-text { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }
.api-help-text a { color: var(--accent); text-decoration: none; }
.api-help-text a:hover { text-decoration: underline; }
.modal-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid var(--border-color); }
.btn-cancel { background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; }
.btn-cancel:hover { background-color: var(--bg-hover); color: var(--text-primary); }
.btn-save { background: var(--accent); border: none; color: white; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
.btn-save:hover { background: var(--accent-hover); }
.toast-notification { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px); background-color: var(--text-primary); color: var(--bg-main); padding: 10px 20px; border-radius: 8px; font-size: 0.85rem; box-shadow: var(--shadow); opacity: 0; pointer-events: none; transition: all 0.2s; z-index: 2000; }
.toast-notification.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.premium-terminal-cursor { display: inline-block; width: 7px; height: 15px; background: var(--text-secondary); margin-left: 2px; vertical-align: -2px; animation: pulse 0.8s infinite alternate; }
@keyframes pulse { 0% { opacity: 1; } 100% { opacity: 0; } }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
@media (max-width: 768px) {
    .hamburger-btn { display: flex; }
    .sidebar { position: fixed; top: 0; left: 0; height: 100%; transform: translateX(-100%); box-shadow: 4px 0 15px rgba(0,0,0,0.3); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.active { display: block; }
    .suggestion-grid { grid-template-columns: 1fr; }
    .chat-feed { padding-bottom: 160px; }
}

/* ==========================================
   PREMIUM THANK YOU DREAM ANIMATION
   ========================================== */
.thank-you-dream {
    margin-top: 12px;
    opacity: 1;
    transition: opacity 0.3s ease;
}

.dream-cloud {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, rgba(16, 163, 127, 0.1), rgba(16, 163, 127, 0.05));
    border: 1px solid rgba(16, 163, 127, 0.2);
    padding: 8px 16px;
    border-radius: 16px;
    animation: dreamFadeIn 0.4s ease;
}

.dream-icon {
    font-size: 1rem;
    animation: dreamSpin 2s infinite linear;
}

.dream-text {
    font-size: 0.85rem;
    color: var(--accent);
    font-weight: 500;
}

@keyframes dreamFadeIn {
    from { opacity: 0; transform: translateY(5px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes dreamSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Fix actions visibility for old messages */
.msg-actions-bot {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    opacity: 0;
    transition: opacity 0.2s;
}

.msg-wrapper:hover .msg-actions-bot {
    opacity: 1;
}


/* ==========================================
   DYNAMIC CONTEXT UPDATES
   ========================================== */
.refresh-suggestions-btn {
    margin-top: 24px;
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
}

.refresh-suggestions-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-active);
    background: var(--bg-hover);
}

.refresh-suggestions-btn svg {
    transition: transform 0.3s;
}

.refresh-suggestions-btn:hover svg {
    transform: rotate(180deg);
}

/* Follow Up Questions Container */
.follow-up-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: fit-content;
    max-width: 85%;
    margin-left: 44px;
    margin-top: -16px;
    margin-bottom: 16px;
    animation: slideIn 0.3s ease forwards;
}

.follow-up-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
}

.follow-up-btn:hover {
    background: var(--bg-hover);
    border-color: var(--border-active);
    color: var(--text-primary);
}

.follow-up-btn svg {
    flex-shrink: 0;
    opacity: 0.5;
}

/* Thank You Dream Animation */
.thank-you-dream { margin-top: 12px; opacity: 1; transition: opacity 0.3s ease; }
.dream-cloud { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, rgba(16, 163, 127, 0.1), rgba(16, 163, 127, 0.05)); border: 1px solid rgba(16, 163, 127, 0.2); padding: 8px 16px; border-radius: 16px; animation: dreamFadeIn 0.4s ease; }
.dream-icon { font-size: 1rem; animation: dreamSpin 2s infinite linear; }
.dream-text { font-size: 0.85rem; color: var(--accent); font-weight: 500; }
@keyframes dreamFadeIn { from { opacity: 0; transform: translateY(5px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes dreamSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.msg-actions-bot { display: flex; gap: 4px; margin-top: 8px; opacity: 0; transition: opacity 0.2s; }
.msg-wrapper:hover .msg-actions-bot { opacity: 1; }

/* ==========================================
   MODEL SELECTOR DROPDOWN
   ========================================== */
.model-selector-wrapper {
    position: relative;
    margin-left: auto;
    margin-right: 12px;
}

.model-selector-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
}

.model-selector-btn:hover {
    border-color: var(--border-active);
    color: var(--text-primary);
    background: var(--bg-active);
}

.model-selector-btn svg {
    transition: transform 0.2s;
}

.model-selector-btn.active svg {
    transform: rotate(180deg);
}

.model-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    width: 280px;
    background: var(--bg-sidebar);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    padding: 8px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s var(--ease-out);
    z-index: 100;
}

.model-dropdown.active {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(-50%) translateY(0);
}

.dropdown-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    padding: 8px 12px 4px;
    font-weight: 600;
}

.fast-label {
    margin-top: 8px !important;
    border-top: 1px solid var(--border-color);
    padding-top: 12px !important;
}

.model-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.model-option:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.model-option.active-model {
    background: var(--bg-active);
    color: var(--accent);
}

.model-tag {
    font-size: 0.65rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: var(--bg-hover);
    color: var(--text-muted);
    font-weight: 600;
    font-family: monospace;
}

.model-option.active-model .model-tag {
    background: rgba(16, 163, 127, 0.15);
    color: var(--accent);
}

import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

/* ═══════════════════════════════════════════════════════════════════
   CSS
   ═══════════════════════════════════════════════════════════════════ */

const STYLES = `
/* ── Root ── */
.claude-root {
  display: flex; flex-direction: column; height: 100%; flex: 1; min-height: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--fg-color, #ddd); background: var(--bg-color, #1a1a1a);
}

/* ── Header ── */
.claude-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px;
  background: linear-gradient(135deg, rgba(74,170,255,0.06) 0%, transparent 100%);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.claude-header-title {
  font-weight: 700; font-size: 14px; flex: 1;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, var(--p-primary-color, #4af), #a78bfa);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.claude-header-btn {
  background: none; border: none; color: var(--fg-color, #ddd);
  cursor: pointer; padding: 5px 7px; border-radius: 6px;
  font-size: 13px; opacity: 0.5; transition: all 0.2s;
}
.claude-header-btn:hover { opacity: 1; background: rgba(255,255,255,0.05); }
.claude-header-btn.active { opacity: 1; color: var(--p-primary-color, #4af); background: rgba(74,170,255,0.1); }
.claude-header-btn.popout-btn { opacity: 0.7; }
.claude-header-btn.popout-btn:hover { opacity: 1; color: var(--p-primary-color, #4af); }

/* ── Settings ── */
.claude-settings {
  display: none; flex-direction: column; gap: 10px; padding: 12px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(0,0,0,0.15); flex-shrink: 0;
  max-height: 50%; overflow-y: auto;
}
.claude-settings.open { display: flex; }
.claude-settings label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--fg-color, #888); opacity: 0.6;
}
.claude-settings input, .claude-settings select {
  padding: 8px 10px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px; background: rgba(255,255,255,0.04);
  color: var(--input-text, #ddd); font-size: 13px; font-family: inherit;
  width: 100%; box-sizing: border-box; transition: border-color 0.2s;
}
.claude-settings input:focus, .claude-settings select:focus {
  border-color: var(--p-primary-color, #4af); outline: none;
}
.claude-settings-row { display: flex; flex-direction: column; gap: 4px; }
.claude-settings-row.hidden { display: none; }
.claude-settings-actions { display: flex; gap: 8px; align-items: center; margin-top: 2px; }
.claude-settings-status { font-size: 11px; opacity: 0.6; flex: 1; }
.claude-settings-hint { font-size: 11px; opacity: 0.35; margin-top: 2px; }
.claude-btn {
  padding: 6px 14px; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px; background: rgba(255,255,255,0.05);
  color: var(--input-text, #ddd); cursor: pointer; font-size: 12px;
  font-family: inherit; transition: all 0.2s;
}
.claude-btn:hover { background: rgba(255,255,255,0.1); }
.claude-btn-primary {
  background: var(--p-primary-color, #4af); color: #fff;
  border-color: transparent; font-weight: 500;
}
.claude-btn-primary:hover { filter: brightness(1.1); }

/* ── Messages ── */
.claude-messages {
  flex: 1; overflow-y: auto; padding: 14px;
  display: flex; flex-direction: column; gap: 12px; min-height: 0;
  scroll-behavior: smooth;
}
.claude-messages::-webkit-scrollbar { width: 4px; }
.claude-messages::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1); border-radius: 2px;
}
.claude-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; opacity: 0.3;
  text-align: center; font-size: 13px; gap: 12px; padding: 30px;
}
.claude-empty-icon { font-size: 36px; opacity: 0.5; }

/* Message bubbles */
.claude-msg {
  padding: 10px 14px; border-radius: 16px; max-width: 90%;
  word-wrap: break-word; font-size: 13px; line-height: 1.55;
  animation: claude-fade-in 0.2s ease-out;
}
@keyframes claude-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.claude-msg.user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--p-primary-color, #4af), #3d8bd9);
  color: #fff; border-bottom-right-radius: 4px;
  box-shadow: 0 1px 3px rgba(74,170,255,0.15);
}
.claude-msg.assistant {
  align-self: flex-start;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-bottom-left-radius: 4px;
}
.claude-msg.error {
  align-self: center;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  color: #fca5a5; font-size: 12px; max-width: 100%; border-radius: 8px;
}
.claude-retry-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: none; border: 1px solid rgba(255,255,255,0.08);
  color: var(--fg-color, #aaa); cursor: pointer; padding: 3px 10px;
  border-radius: 12px; font-size: 11px; font-family: inherit;
  opacity: 0.4; transition: all 0.2s; margin-top: 6px;
}
.claude-retry-btn:hover { opacity: 0.9; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); }
.claude-msg.error .claude-retry-btn { color: #fca5a5; border-color: rgba(239,68,68,0.2); margin-top: 8px; opacity: 0.7; }
.claude-msg.error .claude-retry-btn:hover { opacity: 1; background: rgba(239,68,68,0.08); }

/* Markdown in assistant messages */
.claude-msg.assistant p { margin: 0 0 8px 0; }
.claude-msg.assistant p:last-child { margin-bottom: 0; }
.claude-msg.assistant code {
  background: rgba(255,255,255,0.08); padding: 2px 6px;
  border-radius: 4px; font-size: 12px;
  font-family: "JetBrains Mono", "Consolas", "Monaco", monospace;
}
.claude-msg.assistant pre {
  background: rgba(0,0,0,0.35); padding: 10px 12px; border-radius: 8px;
  overflow-x: auto; margin: 8px 0; font-size: 12px; line-height: 1.5;
  border: 1px solid rgba(255,255,255,0.04);
}
.claude-msg.assistant pre code { background: none; padding: 0; }
.claude-msg.assistant ul, .claude-msg.assistant ol { margin: 6px 0; padding-left: 18px; }
.claude-msg.assistant li { margin: 3px 0; }
.claude-msg.assistant strong { font-weight: 600; color: rgba(255,255,255,0.95); }
.claude-msg.assistant em { font-style: italic; opacity: 0.85; }
.claude-msg.assistant h1,.claude-msg.assistant h2,.claude-msg.assistant h3 {
  margin: 10px 0 6px 0; font-weight: 700; letter-spacing: -0.01em;
}
.claude-msg.assistant h1 { font-size: 16px; }
.claude-msg.assistant h2 { font-size: 15px; }
.claude-msg.assistant h3 { font-size: 14px; }

/* Typing indicator */
.claude-typing { padding: 12px 16px; }
.claude-typing span {
  display: inline-block; width: 7px; height: 7px;
  background: var(--p-primary-color, #4af); border-radius: 50%;
  margin: 0 2px; animation: claude-bounce 1.2s infinite;
  opacity: 0.6;
}
.claude-typing span:nth-child(2) { animation-delay: 0.2s; }
.claude-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes claude-bounce {
  0%,60%,100% { transform: translateY(0); opacity: 0.3; }
  30% { transform: translateY(-8px); opacity: 0.8; }
}

/* ── Action cards (graph manipulation) ── */
.claude-action-card {
  background: rgba(74,170,255,0.05); border: 1px solid rgba(74,170,255,0.15);
  border-radius: 10px; padding: 12px; margin: 8px 0;
  backdrop-filter: blur(4px);
}
.claude-action-card summary {
  cursor: pointer; font-size: 12px; font-weight: 700;
  color: var(--p-primary-color, #4af); margin-bottom: 6px;
  letter-spacing: -0.01em;
}
.claude-action-list { font-size: 12px; margin: 6px 0; padding-left: 16px; opacity: 0.75; }
.claude-action-list li { margin: 3px 0; }
.claude-apply-btn {
  margin-top: 8px; padding: 6px 16px;
  background: linear-gradient(135deg, var(--p-primary-color, #4af), #3d8bd9);
  color: #fff; border: none; border-radius: 6px; cursor: pointer;
  font-size: 12px; font-family: inherit; font-weight: 500; transition: all 0.2s;
}
.claude-apply-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
.claude-apply-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; filter: none; }
.claude-apply-btn.applied { background: linear-gradient(135deg, #34d399, #059669); }
.claude-apply-result { font-size: 11px; margin-top: 6px; opacity: 0.6; white-space: pre-line; }

/* ── Node context bar ── */
.claude-node-ctx {
  display: none; align-items: center; gap: 8px; padding: 8px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(74,170,255,0.04); flex-shrink: 0; font-size: 12px;
}
.claude-node-ctx.visible { display: flex; }
.claude-node-ctx-label {
  flex: 1; opacity: 0.6; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
}
.claude-node-ctx-label strong { color: var(--p-primary-color, #4af); opacity: 1; }
.claude-node-ctx-btn {
  padding: 4px 10px; font-size: 11px; font-weight: 500;
  background: rgba(74,170,255,0.1); border: 1px solid rgba(74,170,255,0.2);
  border-radius: 6px; color: var(--p-primary-color, #4af); cursor: pointer;
  flex-shrink: 0; transition: all 0.2s;
}
.claude-node-ctx-btn:hover { background: rgba(74,170,255,0.2); }

/* ── Quick actions ── */
.claude-quick-actions {
  display: flex; flex-wrap: wrap; gap: 5px; padding: 8px 14px;
  border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
}
.claude-quick-btn {
  padding: 5px 12px; font-size: 11px; font-weight: 500;
  border-radius: 14px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: var(--fg-color, #aaa); cursor: pointer;
  font-family: inherit; transition: all 0.2s; white-space: nowrap;
}
.claude-quick-btn:hover {
  background: rgba(255,255,255,0.08); color: #fff;
  border-color: rgba(255,255,255,0.15);
}
.claude-batch-group {
  display: inline-flex; align-items: center; gap: 4px;
}
.claude-batch-select {
  padding: 4px 6px; font-size: 11px; border-radius: 10px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  color: var(--fg-color, #aaa); font-family: inherit; cursor: pointer;
}
.claude-batch-select:hover {
  background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15);
}
.claude-quick-btn.error-btn {
  border-color: rgba(239,68,68,0.3); color: #fca5a5;
  background: rgba(239,68,68,0.06);
  animation: claude-pulse 2s infinite;
}
@keyframes claude-pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* ── Image attachment ── */
.claude-img-attach-btn {
  background: none; border: none; color: var(--fg-color, #ddd);
  cursor: pointer; padding: 5px 7px; border-radius: 8px;
  font-size: 15px; opacity: 0.35; transition: all 0.2s;
  flex-shrink: 0;
}
.claude-img-attach-btn:hover { opacity: 0.8; background: rgba(255,255,255,0.05); }
.claude-img-attach-btn.has-images { opacity: 0.6; color: var(--p-primary-color, #4af); }
.claude-img-attach-btn.attached {
  opacity: 1; color: #34d399;
  background: rgba(52,211,153,0.08);
}
.claude-img-attach-btn:disabled { opacity: 0.15; cursor: not-allowed; }
.claude-img-preview {
  display: none; align-items: center; gap: 8px; padding: 4px 14px;
  flex-shrink: 0;
}
.claude-img-preview.visible { display: flex; }
.claude-img-preview img {
  width: 48px; height: 48px; object-fit: cover; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.1);
}
.claude-img-preview .remove-img {
  font-size: 11px; opacity: 0.5; cursor: pointer; background: none;
  border: none; color: var(--fg-color, #ddd); padding: 4px 8px;
  border-radius: 4px; transition: all 0.2s;
}
.claude-img-preview .remove-img:hover { opacity: 1; background: rgba(255,255,255,0.05); }

/* Images in messages */
.claude-msg-images {
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;
}
.claude-msg-images img {
  max-width: 200px; max-height: 150px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
  transition: transform 0.2s;
}
.claude-msg-images img:hover { transform: scale(1.02); }

/* ── Floating panel ── */
.claude-floating-panel {
  position: fixed; z-index: 99999;
  width: 420px; height: 600px;
  min-width: 320px; min-height: 300px;
  background: #1e1e1e;
  border: 1px solid rgba(74,170,255,0.3);
  border-radius: 12px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,170,255,0.1);
  display: flex; flex-direction: column;
  resize: both;
}
.claude-floating-panel .claude-root {
  flex: 1; min-height: 0;
}
.claude-floating-panel .claude-drag-bar {
  height: 28px; cursor: grab; flex-shrink: 0;
  background: linear-gradient(135deg, rgba(74,170,255,0.1) 0%, rgba(0,0,0,0.3) 100%);
  display: flex; align-items: center; justify-content: center;
}
.claude-floating-panel .claude-drag-bar::after {
  content: ""; width: 40px; height: 4px; border-radius: 2px;
  background: rgba(255,255,255,0.15);
}
.claude-floating-panel .claude-drag-bar:active { cursor: grabbing; }

/* ── Input area ── */
.claude-input-area {
  display: flex; flex-direction: column; gap: 8px;
  padding: 10px 14px 12px; flex-shrink: 0;
}
.claude-workflow-toggle {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; opacity: 0.45; cursor: pointer; user-select: none;
  transition: opacity 0.2s;
}
.claude-workflow-toggle:hover { opacity: 0.7; }
.claude-workflow-toggle input { margin: 0; accent-color: var(--p-primary-color, #4af); }
.claude-input-row { display: flex; gap: 8px; align-items: flex-end; }
.claude-textarea {
  flex: 1; padding: 10px 14px;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
  background: rgba(255,255,255,0.04); color: var(--input-text, #ddd);
  font-size: 13px; font-family: inherit; resize: none;
  min-height: 40px; max-height: 140px; line-height: 1.45;
  outline: none; transition: all 0.2s;
}
.claude-textarea:focus {
  border-color: rgba(74,170,255,0.4);
  background: rgba(255,255,255,0.06);
  box-shadow: 0 0 0 3px rgba(74,170,255,0.08);
}
.claude-textarea::placeholder { color: var(--fg-color, #666); opacity: 0.5; }
.claude-send-btn {
  padding: 0; width: 40px; height: 40px; display: flex;
  align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--p-primary-color, #4af), #3d8bd9);
  color: #fff; border: none; border-radius: 12px; cursor: pointer;
  font-size: 14px; flex-shrink: 0; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(74,170,255,0.2);
}
.claude-send-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
.claude-send-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; filter: none; box-shadow: none; }

/* ── Drag & drop overlay ── */
.claude-messages.dragover {
  outline: 2px dashed var(--p-primary-color, #4af);
  outline-offset: -4px;
  background: rgba(74,170,255,0.03);
}

/* ── Info feedback bubble ── */
.claude-msg.info {
  align-self: center; text-align: center;
  background: rgba(74,170,255,0.06); border: 1px solid rgba(74,170,255,0.15);
  color: var(--fg-color, #aaa); font-size: 11px;
  max-width: 100%; border-radius: 8px; opacity: 0.7;
}

/* ── Token counter ── */
.claude-token-info {
  font-size: 10px; opacity: 0.3; text-align: right; padding: 0 2px; min-height: 14px;
}
.claude-token-info.warn { opacity: 0.6; color: #f59e0b; }

/* ── Workflow changed indicator ── */
.claude-workflow-indicator {
  display: none; font-size: 10px; color: #f59e0b; opacity: 0.7; margin-left: 4px;
}
.claude-workflow-indicator.visible { display: inline; }

/* ── Revert button ── */
.claude-revert-btn {
  margin-top: 4px; margin-left: 8px; padding: 4px 12px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  border-radius: 6px; color: #fca5a5; cursor: pointer;
  font-size: 11px; font-family: inherit; transition: all 0.2s;
}
.claude-revert-btn:hover { background: rgba(239,68,68,0.15); }

/* ── Custom instructions / memory textarea ── */
.claude-custom-instructions, .claude-memory-textarea {
  padding: 8px 10px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px; background: rgba(255,255,255,0.04);
  color: var(--input-text, #ddd); font-size: 12px; font-family: inherit;
  resize: vertical; min-height: 60px; max-height: 200px;
  width: 100%; box-sizing: border-box; transition: border-color 0.2s;
}
.claude-custom-instructions:focus, .claude-memory-textarea:focus {
  border-color: var(--p-primary-color, #4af); outline: none;
}

/* ── Stripped image placeholder ── */
.claude-msg-images .stripped-placeholder {
  width: 48px; height: 48px; border-radius: 8px;
  border: 1px dashed rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; opacity: 0.3;
}

`;

const STORAGE_KEY = "comfybot-conversation";

/* ═══════════════════════════════════════════════════════════════════
   MODEL LISTS
   ═══════════════════════════════════════════════════════════════════ */

const ANTHROPIC_MODELS = [
  { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5" },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6" },
];
const OPENROUTER_MODELS = [
  { id: "anthropic/claude-opus-4.6", name: "Claude Opus 4.6" },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5" },
  { id: "anthropic/claude-haiku-4.5", name: "Claude Haiku 4.5" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
  { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3" },
  { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick" },
];
const BEDROCK_MODELS = [
  { id: "global.anthropic.claude-opus-4-6-v1", name: "Claude Opus 4.6" },
  { id: "global.anthropic.claude-sonnet-4-5-20250929-v1:0", name: "Claude Sonnet 4.5" },
  { id: "global.anthropic.claude-opus-4-5-20251101-v1:0", name: "Claude Opus 4.5" },
  { id: "global.anthropic.claude-sonnet-4-20250514-v1:0", name: "Claude Sonnet 4" },
  { id: "global.anthropic.claude-haiku-4-5-20251001-v1:0", name: "Claude Haiku 4.5" },
];

/* ═══════════════════════════════════════════════════════════════════
   PERSISTENT STATE (survives sidebar tab switches)
   ═══════════════════════════════════════════════════════════════════ */

const STATE = {
  conversationHistory: [],  // [{role, content, images?, _appliedActions?}]
  isStreaming: false,
  streamingContent: "",
  includeWorkflow: true,
  settingsOpen: false,
  currentProvider: "openrouter",
  lastError: null,
  selectedNode: null,
  actionStore: {},          // actionId → actions array
  lastOutputImages: [],     // [{filename, subfolder, type}] from last execution
  pendingImages: [],        // [{base64, media_type, thumbnail_url}] to attach to next message
  outputImageHistory: [],   // [{images: [...imgRefs], timestamp}] across executions
  isFloating: false,        // whether the panel is popped out as floating
  floatingPos: null,        // {x, y} position of floating panel
  _graphSnapshots: {},      // actionId → serialized graph (session-only, not persisted)
  _lastWorkflowHash: null,  // hash of workflow when last sent
  _chatGeneration: 0,       // incremented on clear — stale responses check this
  includeAnimeStyles: false,
};

// Module-scoped DOM references (updated on each buildChatUI call)
const DOM = {
  messages: null,
  streamingMsg: null,
  sendBtn: null,
  textarea: null,
  errorBtn: null,
  imgAttachBtn: null,
  imgPreview: null,
  batchBtn: null,
  batchGroup: null,
  batchSelect: null,
};

let _listenersRegistered = false;
let _nodeInterval = null;

/* ═══════════════════════════════════════════════════════════════════
   PERSISTENCE & UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function saveConversation() {
  try {
    const data = {
      conversationHistory: STATE.conversationHistory.map(m => {
        const entry = { ...m };
        if (entry.images) {
          entry.images = entry.images.map(img => ({
            media_type: img.media_type,
            thumbnail_url: img.thumbnail_url || null,
            _stripped: true,
          }));
        }
        return entry;
      }),
      actionStore: STATE.actionStore,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("ComfyBot: Failed to save conversation", e);
  }
}

function loadConversation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.conversationHistory) STATE.conversationHistory = data.conversationHistory;
    if (data.actionStore) STATE.actionStore = data.actionStore;
  } catch (e) {
    console.warn("ComfyBot: Failed to load conversation", e);
  }
}

loadConversation();

function estimateTokens(text) {
  return Math.ceil((text || "").length / 4);
}

function getConversationTokens() {
  let total = 0;
  for (const m of STATE.conversationHistory) {
    total += estimateTokens(m.content);
  }
  return total;
}

function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return hash;
}

function computeWorkflowDiff(before, after) {
  const beforeNodes = new Map((before.nodes || []).map(n => [n.id, n]));
  const afterNodes = new Map((after.nodes || []).map(n => [n.id, n]));
  let added = 0, removed = 0, widgetChanges = [];
  for (const [id, node] of afterNodes) {
    if (!beforeNodes.has(id)) { added++; }
    else {
      const old = beforeNodes.get(id);
      if (JSON.stringify(old.widgets_values || []) !== JSON.stringify(node.widgets_values || [])) {
        widgetChanges.push(node.type || `#${id}`);
      }
    }
  }
  for (const id of beforeNodes.keys()) { if (!afterNodes.has(id)) removed++; }
  const linkDelta = (after.links || []).length - (before.links || []).length;
  const parts = [];
  if (added) parts.push(`+${added} node${added > 1 ? "s" : ""}`);
  if (removed) parts.push(`-${removed} node${removed > 1 ? "s" : ""}`);
  if (widgetChanges.length) parts.push(`${widgetChanges.length} widget change${widgetChanges.length > 1 ? "s" : ""}`);
  if (linkDelta > 0) parts.push(`+${linkDelta} connection${linkDelta > 1 ? "s" : ""}`);
  if (linkDelta < 0) parts.push(`${linkDelta} connection${linkDelta < -1 ? "s" : ""}`);
  return parts.length ? parts.join(", ") : "No structural changes detected";
}

/* ═══════════════════════════════════════════════════════════════════
   GRAPH ACTION EXECUTOR
   ═══════════════════════════════════════════════════════════════════ */

function getSlotIndex(node, name, type) {
  if (typeof name === "number") return name;
  const slots = type === "output" ? node.outputs : node.inputs;
  if (!slots) return -1;
  const idx = slots.findIndex(
    (s) => s.name.toLowerCase() === String(name).toLowerCase()
  );
  return idx;
}

function executeGraphAction(action) {
  const graph = app.graph;
  try {
    switch (action.action) {
      case "add_node": {
        const node = LiteGraph.createNode(action.type);
        if (!node)
          return { ok: false, msg: `Unknown node type: ${action.type}` };
        if (action.pos) node.pos = action.pos;
        if (action.title) node.title = action.title;
        graph.add(node);
        if (action.widgets && node.widgets) {
          for (const [k, v] of Object.entries(action.widgets)) {
            const w = node.widgets.find((w) => w.name === k);
            if (w) {
              w.value = v;
              if (typeof w.callback === "function") {
                try { w.callback(w.value, app.canvas, node, null, {}); } catch {}
              }
            }
          }
        }
        return { ok: true, msg: `Added ${action.type} (node #${node.id})`, nodeId: node.id };
      }
      case "remove_node": {
        const node = graph.getNodeById(action.node_id);
        if (!node) return { ok: false, msg: `Node #${action.node_id} not found` };
        const t = node.type || node.comfyClass;
        graph.remove(node);
        return { ok: true, msg: `Removed ${t} #${action.node_id}` };
      }
      case "connect": {
        const from = graph.getNodeById(action.from_node);
        const to = graph.getNodeById(action.to_node);
        if (!from) return { ok: false, msg: `Node #${action.from_node} not found` };
        if (!to) return { ok: false, msg: `Node #${action.to_node} not found` };
        const outIdx = getSlotIndex(from, action.from_slot, "output");
        const inIdx = getSlotIndex(to, action.to_slot, "input");
        if (outIdx < 0) return { ok: false, msg: `Output slot "${action.from_slot}" not found on #${action.from_node}` };
        if (inIdx < 0) return { ok: false, msg: `Input slot "${action.to_slot}" not found on #${action.to_node}` };
        from.connect(outIdx, to, inIdx);
        return { ok: true, msg: `Connected #${action.from_node}→#${action.to_node}` };
      }
      case "disconnect": {
        const node = graph.getNodeById(action.node_id);
        if (!node) return { ok: false, msg: `Node #${action.node_id} not found` };
        const idx = getSlotIndex(node, action.slot, "input");
        if (idx < 0) return { ok: false, msg: `Input slot "${action.slot}" not found` };
        node.disconnectInput(idx);
        return { ok: true, msg: `Disconnected input ${action.slot} on #${action.node_id}` };
      }
      case "set_widget": {
        const node = graph.getNodeById(action.node_id);
        if (!node) return { ok: false, msg: `Node #${action.node_id} not found` };
        // Try widget first
        const w = node.widgets?.find((w) => w.name === action.name);
        if (w) {
          w.value = action.value;
          // Trigger widget callback so custom nodes react to the change
          if (typeof w.callback === "function") {
            try { w.callback(w.value, app.canvas, node, null, {}); } catch {}
          }
          // Also trigger node-level change handler
          if (typeof node.onWidgetChanged === "function") {
            try { node.onWidgetChanged(action.name, action.value, w); } catch {}
          }
          node.setDirtyCanvas?.(true, true);
          return { ok: true, msg: `Set ${action.name}=${JSON.stringify(action.value)} on #${action.node_id}` };
        }
        // Fallback: set node property (for custom nodes that store data in properties)
        if (node.properties && action.name in node.properties) {
          node.properties[action.name] = action.value;
          if (typeof node.onPropertyChanged === "function") {
            try { node.onPropertyChanged(action.name, action.value); } catch {}
          }
          node.setDirtyCanvas?.(true, true);
          return { ok: true, msg: `Set property ${action.name} on #${action.node_id}` };
        }
        return { ok: false, msg: `Widget "${action.name}" not found on #${action.node_id}` };
      }
      case "update_memory": {
        // Handled by the action card click handler (async fetch)
        return { ok: true, msg: "Memory update queued" };
      }
      default:
        return { ok: false, msg: `Unknown action: ${action.action}` };
    }
  } catch (e) {
    return { ok: false, msg: e.message };
  }
}

function applyGraphActions(actions) {
  const explicitMap = {}; // AI-assigned id → actual LiteGraph id
  const positionMap = {}; // sequential add position (1,2,3...) → actual id
  let addCount = 0;

  function remapId(id) {
    // 1. Explicit id mapping (AI provided "id" field in add_node) — always wins
    if (explicitMap[id] != null) return explicitMap[id];
    // 2. Fallback: sequential position mapping, but only if node doesn't exist in graph
    //    (avoids accidentally remapping a reference to a real existing node)
    if (!app.graph.getNodeById(id) && positionMap[id] != null) return positionMap[id];
    return id;
  }

  const results = actions.map((a) => {
    // Remap node IDs through the mapping table
    if (a.action === "connect") {
      a = { ...a, from_node: remapId(a.from_node), to_node: remapId(a.to_node) };
    } else if (
      a.action === "set_widget" ||
      a.action === "remove_node" ||
      a.action === "disconnect"
    ) {
      a = { ...a, node_id: remapId(a.node_id) };
    }
    const result = executeGraphAction(a);
    // Track ID mapping for add_node
    if (a.action === "add_node" && result.ok && result.nodeId != null) {
      addCount++;
      if (a.id != null) explicitMap[a.id] = result.nodeId;
      if (positionMap[addCount] == null) positionMap[addCount] = result.nodeId;
    }
    return result;
  });
  app.graph.setDirtyCanvas(true, true);
  return results;
}

function describeAction(a) {
  switch (a.action) {
    case "add_node": return `Add ${a.type}${a.title ? ` "${a.title}"` : ""}`;
    case "remove_node": return `Remove node #${a.node_id}`;
    case "connect": return `Connect #${a.from_node} → #${a.to_node}`;
    case "disconnect": return `Disconnect input on #${a.node_id}`;
    case "set_widget": return `Set ${a.name} = ${JSON.stringify(a.value)} on #${a.node_id}`;
    case "update_memory": return "Update AI memory";
    default: return JSON.stringify(a);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   MARKDOWN RENDERER
   ═══════════════════════════════════════════════════════════════════ */

function renderMarkdown(text, options = {}) {
  const codeBlocks = [];
  const actionBlocks = [];

  // Extract code blocks — detect comfyui-actions specially
  text = text.replace(/```(\w*[-\w]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    if (lang === "comfyui-actions") {
      try {
        const actions = JSON.parse(code.trim());
        actionBlocks.push(actions);
        return `%%ACTIONBLOCK_${actionBlocks.length - 1}%%`;
      } catch {
        // Malformed, treat as normal code block
      }
    }
    codeBlocks.push(
      `<pre><code class="lang-${lang}">${escapeHtml(code.trim())}</code></pre>`
    );
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  text = text.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  text = text.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  text = text.replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>");
  text = text.replace(/^[-*] (.+)$/gm, "<li>$1</li>");
  text = text.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
  text = text.replace(/\n\n+/g, "</p><p>");
  text = text.replace(/\n/g, "<br>");
  text = `<p>${text}</p>`;
  text = text.replace(/<p><(h[123]|ul|ol|pre)/g, "<$1");
  text = text.replace(/<\/(h[123]|ul|ol|pre)><\/p>/g, "</$1>");
  text = text.replace(/<p><\/p>/g, "");

  // Restore code blocks
  text = text.replace(/%%CODEBLOCK_(\d+)%%/g, (_, i) => codeBlocks[i]);

  // Replace action block placeholders with cards
  text = text.replace(/%%ACTIONBLOCK_(\d+)%%/g, (_, i) => {
    const actions = actionBlocks[i];
    const id = `action-${Date.now()}-${i}`;
    const items = actions.map((a) => `<li>${escapeHtml(describeAction(a))}</li>`).join("");
    return `<div class="claude-action-card" data-action-id="${id}">
      <details open><summary>${actions.length} workflow change${actions.length > 1 ? "s" : ""}</summary>
      <ul class="claude-action-list">${items}</ul></details>
      <button class="claude-apply-btn" data-action-id="${id}">Apply changes</button>
      <div class="claude-apply-result"></div>
    </div>`;
  });

  return { html: text, actionBlocks };
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ═══════════════════════════════════════════════════════════════════
   IMAGE HELPERS
   ═══════════════════════════════════════════════════════════════════ */

async function fetchImageAsBase64(imgRef) {
  const url = `/view?filename=${encodeURIComponent(imgRef.filename)}&subfolder=${encodeURIComponent(imgRef.subfolder || "")}&type=${imgRef.type || "output"}`;
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      base64: reader.result.split(",")[1],
      media_type: blob.type || "image/png",
      thumbnail_url: url,
    });
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(blob);
  });
}

function updateImagePreview() {
  if (!DOM.imgPreview || !DOM.imgAttachBtn) return;
  if (STATE.pendingImages.length > 0) {
    DOM.imgPreview.innerHTML = "";
    STATE.pendingImages.forEach((img) => {
      const imgEl = document.createElement("img");
      imgEl.src = img.thumbnail_url || `data:${img.media_type};base64,${img.base64}`;
      DOM.imgPreview.appendChild(imgEl);
    });
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-img";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      STATE.pendingImages = [];
      updateImagePreview();
    });
    DOM.imgPreview.appendChild(removeBtn);
    DOM.imgPreview.classList.add("visible");
    DOM.imgAttachBtn.classList.add("attached");
    DOM.imgAttachBtn.classList.remove("has-images");
  } else {
    DOM.imgPreview.classList.remove("visible");
    DOM.imgPreview.innerHTML = "";
    DOM.imgAttachBtn.classList.remove("attached");
    if (STATE.lastOutputImages.length > 0) {
      DOM.imgAttachBtn.classList.add("has-images");
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL EVENT LISTENERS (registered once)
   ═══════════════════════════════════════════════════════════════════ */

function updateBatchButton() {
  if (!DOM.batchGroup) return;
  const runs = STATE.outputImageHistory.length;
  if (runs >= 2) {
    DOM.batchGroup.style.display = "";
    // Rebuild select options: "All (N)", then N-1 down to 2
    const sel = DOM.batchSelect;
    const prev = sel.value;
    sel.innerHTML = `<option value="all">All (${runs})</option>`;
    for (let i = runs; i >= 2; i--) {
      sel.innerHTML += `<option value="${i}">Last ${i}</option>`;
    }
    if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
  } else {
    DOM.batchGroup.style.display = "none";
  }
}

function registerGlobalListeners() {
  if (_listenersRegistered) return;
  _listenersRegistered = true;

  api.addEventListener("execution_error", ({ detail }) => {
    STATE.lastError = detail;
    if (DOM.errorBtn) DOM.errorBtn.style.display = "";
  });

  api.addEventListener("executed", ({ detail }) => {
    if (detail?.output?.images) {
      STATE.lastOutputImages = detail.output.images.map((img) => ({
        filename: img.filename,
        subfolder: img.subfolder || "",
        type: img.type || "output",
      }));
      // Accumulate for batch analyze
      STATE.outputImageHistory.push({
        images: STATE.lastOutputImages.slice(),
        timestamp: Date.now(),
      });
      // Cap total images at 16
      while (STATE.outputImageHistory.reduce((n, e) => n + e.images.length, 0) > 16) {
        STATE.outputImageHistory.shift();
      }
      updateBatchButton();
      if (DOM.imgAttachBtn && STATE.pendingImages.length === 0) {
        DOM.imgAttachBtn.classList.add("has-images");
        DOM.imgAttachBtn.title = `Attach last output (${STATE.lastOutputImages.length} image${STATE.lastOutputImages.length > 1 ? "s" : ""})`;
      }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   SCROLL HELPER
   ═══════════════════════════════════════════════════════════════════ */

function scrollToBottom(force = false) {
  if (!DOM.messages) return;
  const el = DOM.messages;
  const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  if (force || nearBottom) el.scrollTop = el.scrollHeight;
}

/* ═══════════════════════════════════════════════════════════════════
   CHAT UI
   ═══════════════════════════════════════════════════════════════════ */

function buildChatUI(el) {
  el.innerHTML = "";
  if (_nodeInterval) { clearInterval(_nodeInterval); _nodeInterval = null; }

  // Ensure the parent container fills the full sidebar height
  el.style.display = "flex";
  el.style.flexDirection = "column";
  el.style.height = "100%";

  const root = document.createElement("div");
  root.className = "claude-root";

  // ── Header
  const header = document.createElement("div");
  header.className = "claude-header";
  header.innerHTML = `
    <span class="claude-header-title">ComfyBot</span>
    <button class="claude-header-btn popout-btn" data-action="popout" title="Pop out to floating window"><i class="pi pi-external-link"></i></button>
    <button class="claude-header-btn" data-action="export" title="Copy chat as markdown"><i class="pi pi-copy"></i></button>
    <button class="claude-header-btn" data-action="settings" title="Settings"><i class="pi pi-cog"></i></button>
    <button class="claude-header-btn" data-action="clear" title="Clear chat"><i class="pi pi-trash"></i></button>
  `;

  // ── Settings
  const settings = document.createElement("div");
  settings.className = "claude-settings";
  settings.innerHTML = `
    <div class="claude-settings-row">
      <label>Provider</label>
      <select class="claude-provider-select">
        <option value="openrouter">OpenRouter</option>
        <option value="anthropic">Anthropic (direct)</option>
        <option value="bedrock">AWS Bedrock</option>
      </select>
    </div>
    <div class="claude-settings-row claude-row-openrouter-key">
      <label>OpenRouter API Key</label>
      <input type="password" class="claude-openrouter-key" placeholder="sk-or-..." spellcheck="false" autocomplete="off">
      <span class="claude-settings-hint">Get one free at openrouter.ai/keys</span>
    </div>
    <div class="claude-settings-row claude-row-anthropic-key hidden">
      <label>Anthropic API Key</label>
      <input type="password" class="claude-anthropic-key" placeholder="sk-ant-..." spellcheck="false" autocomplete="off">
    </div>
    <div class="claude-settings-row claude-row-bedrock-access hidden">
      <label>AWS Access Key ID</label>
      <input type="password" class="claude-bedrock-access" placeholder="AKIA..." spellcheck="false" autocomplete="off">
    </div>
    <div class="claude-settings-row claude-row-bedrock-secret hidden">
      <label>AWS Secret Access Key</label>
      <input type="password" class="claude-bedrock-secret" placeholder="Secret key..." spellcheck="false" autocomplete="off">
    </div>
    <div class="claude-settings-row claude-row-bedrock-region hidden">
      <label>AWS Region</label>
      <input type="text" class="claude-bedrock-region" placeholder="us-east-1" spellcheck="false" autocomplete="off">
    </div>
    <div class="claude-settings-row">
      <label>Model</label>
      <select class="claude-model-select"></select>
    </div>
    <div class="claude-settings-row">
      <label>Custom Instructions</label>
      <textarea class="claude-custom-instructions" placeholder="Add custom instructions for the AI (e.g. preferred style, workflow preferences)..." rows="3"></textarea>
    </div>
    <div class="claude-settings-row">
      <label>AI Memory</label>
      <textarea class="claude-memory-textarea" placeholder="The AI can write notes here to remember across sessions..." rows="3" readonly></textarea>
      <span class="claude-settings-hint">Managed by the AI — ask it to remember something</span>
    </div>
    <div class="claude-settings-row">
      <label class="claude-workflow-toggle claude-anime-styles-toggle">
        <input type="checkbox" class="claude-anime-styles-checkbox"> Include anime artist style tags for AI suggestions
      </label>
      <span class="claude-settings-hint">Adds ~2,000 SDXL artist styles with descriptions + 500 anime tags (~20k tokens)</span>
    </div>
    <div class="claude-settings-actions">
      <button class="claude-btn claude-btn-primary claude-save-btn">Save</button>
      <span class="claude-settings-status"></span>
    </div>
  `;

  // ── Node context bar
  const nodeCtx = document.createElement("div");
  nodeCtx.className = "claude-node-ctx";
  nodeCtx.innerHTML = `
    <span class="claude-node-ctx-label"></span>
    <button class="claude-node-ctx-btn">Ask about this node</button>
  `;

  // ── Messages
  const messages = document.createElement("div");
  messages.className = "claude-messages";
  const emptyState = document.createElement("div");
  emptyState.className = "claude-empty";
  emptyState.innerHTML = `
    <div class="claude-empty-icon"><i class="pi pi-comments"></i></div>
    <div>Ask about your<br>ComfyUI workflow</div>
  `;

  // ── Quick actions
  const quickActions = document.createElement("div");
  quickActions.className = "claude-quick-actions";
  quickActions.innerHTML = `
    <button class="claude-quick-btn" data-prompt="Analyze this workflow: explain what it does step by step, and identify any potential issues.">Analyze</button>
    <button class="claude-quick-btn" data-prompt="Suggest optimizations for this workflow to improve quality, speed, or both. Be specific about which nodes/settings to change.">Optimize</button>
    <button class="claude-quick-btn" data-prompt="improve-prompts">Improve Prompts</button>
    <button class="claude-quick-btn" data-prompt="analyze-output">Analyze Output</button>
    <span class="claude-batch-group" style="display:none">
      <button class="claude-quick-btn batch-btn" data-prompt="batch-analyze">Batch Analyze</button>
      <select class="claude-batch-select" title="Number of recent runs to compare"></select>
    </span>
    <button class="claude-quick-btn error-btn" data-prompt="fix-error" style="display:none">Fix Error</button>
  `;

  // ── Image preview area
  const imgPreview = document.createElement("div");
  imgPreview.className = "claude-img-preview";

  // ── Input area
  const inputArea = document.createElement("div");
  inputArea.className = "claude-input-area";
  inputArea.innerHTML = `
    <label class="claude-workflow-toggle">
      <input type="checkbox" ${STATE.includeWorkflow ? "checked" : ""}> Include current workflow as context
      <span class="claude-workflow-indicator">~ changed</span>
    </label>
    <div class="claude-token-info"></div>
    <div class="claude-input-row">
      <textarea class="claude-textarea" placeholder="Ask about your workflow..." rows="1"></textarea>
      <button class="claude-img-attach-btn" title="Attach last output image"><i class="pi pi-image"></i></button>
      <button class="claude-send-btn" title="Send"><i class="pi pi-send"></i></button>
    </div>
  `;

  // ── Assemble
  root.appendChild(header);
  root.appendChild(settings);
  root.appendChild(nodeCtx);
  root.appendChild(messages);
  root.appendChild(quickActions);
  root.appendChild(imgPreview);
  root.appendChild(inputArea);
  el.appendChild(root);

  // ── Element refs
  const providerSelect = settings.querySelector(".claude-provider-select");
  const openrouterKeyInput = settings.querySelector(".claude-openrouter-key");
  const anthropicKeyInput = settings.querySelector(".claude-anthropic-key");
  const bedrockAccessInput = settings.querySelector(".claude-bedrock-access");
  const bedrockSecretInput = settings.querySelector(".claude-bedrock-secret");
  const bedrockRegionInput = settings.querySelector(".claude-bedrock-region");
  const openrouterKeyRow = settings.querySelector(".claude-row-openrouter-key");
  const anthropicKeyRow = settings.querySelector(".claude-row-anthropic-key");
  const bedrockAccessRow = settings.querySelector(".claude-row-bedrock-access");
  const bedrockSecretRow = settings.querySelector(".claude-row-bedrock-secret");
  const bedrockRegionRow = settings.querySelector(".claude-row-bedrock-region");
  const modelSelect = settings.querySelector(".claude-model-select");
  const saveBtn = settings.querySelector(".claude-save-btn");
  const statusEl = settings.querySelector(".claude-settings-status");
  const textarea = inputArea.querySelector(".claude-textarea");
  const sendBtn = inputArea.querySelector(".claude-send-btn");
  const imgAttachBtn = inputArea.querySelector(".claude-img-attach-btn");
  const workflowCheckbox = inputArea.querySelector(".claude-workflow-toggle input");
  const errorBtn = quickActions.querySelector('[data-prompt="fix-error"]');
  const batchBtn = quickActions.querySelector('[data-prompt="batch-analyze"]');
  const batchGroup = quickActions.querySelector(".claude-batch-group");
  const batchSelect = quickActions.querySelector(".claude-batch-select");
  const customInstructionsEl = settings.querySelector(".claude-custom-instructions");
  const memoryEl = settings.querySelector(".claude-memory-textarea");
  const animeStylesCheckbox = settings.querySelector(".claude-anime-styles-checkbox");
  const tokenInfoEl = inputArea.querySelector(".claude-token-info");
  const workflowIndicator = inputArea.querySelector(".claude-workflow-indicator");

  // Update module-scoped DOM refs
  DOM.messages = messages;
  DOM.sendBtn = sendBtn;
  DOM.textarea = textarea;
  DOM.errorBtn = errorBtn;
  DOM.imgAttachBtn = imgAttachBtn;
  DOM.imgPreview = imgPreview;
  DOM.batchBtn = batchBtn;
  DOM.batchGroup = batchGroup;
  DOM.batchSelect = batchSelect;
  DOM.tokenInfo = tokenInfoEl;
  DOM.workflowIndicator = workflowIndicator;

  // ── Model dropdown
  function updateModelList(provider, currentModel) {
    const models = provider === "anthropic" ? ANTHROPIC_MODELS
                 : provider === "bedrock" ? BEDROCK_MODELS
                 : OPENROUTER_MODELS;
    modelSelect.innerHTML = models.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
    if (currentModel && models.some((m) => m.id === currentModel)) modelSelect.value = currentModel;
  }

  function updateProviderUI(provider) {
    STATE.currentProvider = provider;
    openrouterKeyRow.classList.toggle("hidden", provider !== "openrouter");
    anthropicKeyRow.classList.toggle("hidden", provider !== "anthropic");
    bedrockAccessRow.classList.toggle("hidden", provider !== "bedrock");
    bedrockSecretRow.classList.toggle("hidden", provider !== "bedrock");
    bedrockRegionRow.classList.toggle("hidden", provider !== "bedrock");
    updateModelList(provider, modelSelect.value);
  }

  updateModelList("openrouter", null);
  loadConfig();

  async function loadConfig() {
    try {
      const res = await fetch("/claude-assistant/config");
      const cfg = await res.json();
      STATE.currentProvider = cfg.provider || "openrouter";
      providerSelect.value = STATE.currentProvider;
      updateProviderUI(STATE.currentProvider);
      if (cfg.openrouter_key_preview) openrouterKeyInput.placeholder = `Current: ${cfg.openrouter_key_preview}`;
      if (cfg.anthropic_key_preview) anthropicKeyInput.placeholder = `Current: ${cfg.anthropic_key_preview}`;
      if (cfg.bedrock_access_preview) bedrockAccessInput.placeholder = `Current: ${cfg.bedrock_access_preview}`;
      if (cfg.bedrock_secret_preview) bedrockSecretInput.placeholder = `Current: ${cfg.bedrock_secret_preview}`;
      if (cfg.bedrock_region) bedrockRegionInput.value = cfg.bedrock_region;
      if (cfg.model) updateModelList(STATE.currentProvider, cfg.model);
      if (cfg.custom_instructions) customInstructionsEl.value = cfg.custom_instructions;
      if (cfg.include_anime_styles) {
        animeStylesCheckbox.checked = true;
        STATE.includeAnimeStyles = true;
      }
      // Load AI memory
      try {
        const memRes = await fetch("/claude-assistant/memory");
        if (memRes.ok) {
          const memData = await memRes.json();
          if (memData.memory) memoryEl.value = memData.memory;
        }
      } catch {}
      if (!cfg.has_api_key) {
        STATE.settingsOpen = true;
        settings.classList.add("open");
        header.querySelector('[data-action="settings"]').classList.add("active");
        statusEl.textContent = "Please configure your API key";
      }
    } catch {}
  }

  // ── Restore UI state
  if (STATE.settingsOpen) {
    settings.classList.add("open");
    header.querySelector('[data-action="settings"]').classList.add("active");
  }
  if (STATE.lastError) errorBtn.style.display = "";
  if (STATE.lastOutputImages.length > 0) imgAttachBtn.classList.add("has-images");
  updateImagePreview();
  updateBatchButton();

  // ── Drag & drop images
  messages.addEventListener("dragover", (e) => {
    e.preventDefault();
    messages.classList.add("dragover");
  });
  messages.addEventListener("dragleave", (e) => {
    if (!messages.contains(e.relatedTarget)) messages.classList.remove("dragover");
  });
  messages.addEventListener("drop", (e) => {
    e.preventDefault();
    messages.classList.remove("dragover");
    const files = [...e.dataTransfer.files].filter(f =>
      ["image/png", "image/jpeg", "image/webp"].includes(f.type)
    ).slice(0, 4);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (STATE.pendingImages.length >= 4) return;
        STATE.pendingImages.push({
          base64: reader.result.split(",")[1],
          media_type: file.type,
          thumbnail_url: reader.result,
        });
        updateImagePreview();
      };
      reader.readAsDataURL(file);
    });
  });

  // ── Settings events
  providerSelect.addEventListener("change", () => updateProviderUI(providerSelect.value));

  header.querySelector('[data-action="settings"]').addEventListener("click", () => {
    STATE.settingsOpen = !STATE.settingsOpen;
    settings.classList.toggle("open", STATE.settingsOpen);
    header.querySelector('[data-action="settings"]').classList.toggle("active", STATE.settingsOpen);
  });

  animeStylesCheckbox.addEventListener("change", () => {
    STATE.includeAnimeStyles = animeStylesCheckbox.checked;
  });

  header.querySelector('[data-action="clear"]').addEventListener("click", () => {
    STATE.conversationHistory = [];
    STATE.actionStore = {};
    STATE.outputImageHistory = [];
    STATE._graphSnapshots = {};
    STATE._chatGeneration++;
    STATE.isStreaming = false;
    STATE.streamingContent = "";
    DOM.streamingMsg = null;
    messages.innerHTML = "";
    messages.appendChild(emptyState);
    updateBatchButton();
    localStorage.removeItem(STORAGE_KEY);
    updateTokenInfo();
    sendBtn.disabled = false;
  });

  // ── Export
  header.querySelector('[data-action="export"]').addEventListener("click", () => {
    if (STATE.conversationHistory.length === 0) return;
    const md = STATE.conversationHistory.map(m => {
      const role = m._isSystemFeedback ? "System" : m.role === "user" ? "You" : "ComfyBot";
      const imgs = m.images?.length ? `\n[${m.images.length} image${m.images.length > 1 ? "s" : ""} attached]\n` : "";
      return `**${role}:**${imgs}\n${m.content}`;
    }).join("\n\n---\n\n");
    navigator.clipboard.writeText(md).then(() => {
      const btn = header.querySelector('[data-action="export"]');
      const icon = btn.querySelector("i");
      icon.className = "pi pi-check";
      btn.classList.add("active");
      setTimeout(() => { icon.className = "pi pi-copy"; btn.classList.remove("active"); }, 1500);
    });
  });

  // ── Pop out / Dock
  const popoutBtn = header.querySelector('[data-action="popout"]');

  function popOut() {
    STATE.isFloating = true;
    popoutBtn.classList.add("active");
    popoutBtn.title = "Dock back to sidebar";
    popoutBtn.querySelector("i").className = "pi pi-window-minimize";

    // Remove any existing floating panel (from a previous buildChatUI cycle)
    const existing = document.querySelector(".claude-floating-panel");
    if (existing) existing.remove();

    const panel = document.createElement("div");
    panel.className = "claude-floating-panel";
    const dragBar = document.createElement("div");
    dragBar.className = "claude-drag-bar";
    panel.appendChild(dragBar);
    panel.appendChild(root);

    // Leave a placeholder in the sidebar so the user knows where it went
    el.innerHTML = "";
    const placeholder = document.createElement("div");
    placeholder.className = "claude-floating-placeholder";
    placeholder.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;opacity:0.35;font-size:13px;gap:12px;text-align:center;padding:30px;";
    placeholder.innerHTML = '<i class="pi pi-external-link" style="font-size:24px;opacity:0.5;"></i>ComfyBot is in floating mode.<br>Switch to another tab to use side-by-side.';
    el.appendChild(placeholder);

    // Default: center of viewport, avoiding the sidebar on the right
    const pos = STATE.floatingPos || {
      x: Math.max(20, Math.floor(window.innerWidth / 2 - 210)),
      y: Math.max(20, Math.floor(window.innerHeight / 2 - 300)),
    };
    panel.style.left = pos.x + "px";
    panel.style.top = pos.y + "px";
    document.body.appendChild(panel);

    // Drag handling
    let dragging = false, dx = 0, dy = 0;
    dragBar.addEventListener("mousedown", (e) => {
      dragging = true;
      dx = e.clientX - panel.offsetLeft;
      dy = e.clientY - panel.offsetTop;
      e.preventDefault();
    });
    const onMove = (e) => {
      if (!dragging) return;
      const nx = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dx));
      const ny = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dy));
      panel.style.left = nx + "px";
      panel.style.top = ny + "px";
      STATE.floatingPos = { x: nx, y: ny };
    };
    const onUp = () => { dragging = false; };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    // Clean up listeners when panel is removed
    const observer = new MutationObserver(() => {
      if (!panel.isConnected) {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true });
  }

  function dockBack() {
    STATE.isFloating = false;
    popoutBtn.classList.remove("active");
    popoutBtn.title = "Pop out to floating window";
    popoutBtn.querySelector("i").className = "pi pi-external-link";

    el.innerHTML = "";
    el.appendChild(root);
    const existing = document.querySelector(".claude-floating-panel");
    if (existing) existing.remove();
  }

  popoutBtn.addEventListener("click", () => {
    if (STATE.isFloating) dockBack(); else popOut();
  });

  // Restore floating state on tab switch rebuild
  if (STATE.isFloating) popOut();

  saveBtn.addEventListener("click", async () => {
    const body = { provider: providerSelect.value, model: modelSelect.value };
    body.custom_instructions = customInstructionsEl.value.trim();
    body.include_anime_styles = animeStylesCheckbox.checked;
    if (openrouterKeyInput.value.trim()) body.openrouter_api_key = openrouterKeyInput.value.trim();
    if (anthropicKeyInput.value.trim()) body.anthropic_api_key = anthropicKeyInput.value.trim();
    if (bedrockAccessInput.value.trim()) body.bedrock_access_key = bedrockAccessInput.value.trim();
    if (bedrockSecretInput.value.trim()) body.bedrock_secret_key = bedrockSecretInput.value.trim();
    if (bedrockRegionInput.value.trim()) body.bedrock_region = bedrockRegionInput.value.trim();
    try {
      const res = await fetch("/claude-assistant/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        statusEl.textContent = "Saved!";
        if (openrouterKeyInput.value.trim()) { openrouterKeyInput.placeholder = `Current: ...${openrouterKeyInput.value.trim().slice(-4)}`; openrouterKeyInput.value = ""; }
        if (anthropicKeyInput.value.trim()) { anthropicKeyInput.placeholder = `Current: ...${anthropicKeyInput.value.trim().slice(-4)}`; anthropicKeyInput.value = ""; }
        if (bedrockAccessInput.value.trim()) { bedrockAccessInput.placeholder = `Current: ...${bedrockAccessInput.value.trim().slice(-4)}`; bedrockAccessInput.value = ""; }
        if (bedrockSecretInput.value.trim()) { bedrockSecretInput.placeholder = `Current: ...${bedrockSecretInput.value.trim().slice(-4)}`; bedrockSecretInput.value = ""; }
        setTimeout(() => { statusEl.textContent = ""; }, 2000);
      }
    } catch { statusEl.textContent = "Error saving"; }
  });

  workflowCheckbox.addEventListener("change", () => { STATE.includeWorkflow = workflowCheckbox.checked; });

  // ── Textarea auto-resize
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + "px";
    updateTokenInfo();
  });

  function updateTokenInfo() {
    if (!tokenInfoEl) return;
    const inputTokens = estimateTokens(textarea.value);
    const historyTokens = getConversationTokens();
    let wfTokens = 0;
    if (STATE.includeWorkflow) {
      try { wfTokens = estimateTokens(JSON.stringify(app.graph?.serialize() || "")); } catch {}
    }
    const total = historyTokens + inputTokens + wfTokens;
    tokenInfoEl.textContent = `~${total.toLocaleString()} tokens`;
    tokenInfoEl.classList.toggle("warn", wfTokens > 5000);
  }
  updateTokenInfo();

  // ── Message helpers
  function addMessageToDOM(role, content, images) {
    if (emptyState.parentNode) emptyState.remove();
    const msg = document.createElement("div");
    msg.className = `claude-msg ${role}`;
    if (role === "assistant") {
      const { html, actionBlocks } = renderMarkdown(content, { actionStore: STATE.actionStore });
      msg.innerHTML = html;
      const cards = msg.querySelectorAll(".claude-action-card");
      cards.forEach((card, i) => {
        if (actionBlocks[i]) STATE.actionStore[card.dataset.actionId] = actionBlocks[i];
      });
    } else if (role === "error") {
      msg.textContent = content;
    } else if (role === "info") {
      msg.textContent = content;
    } else {
      // User message with optional images
      if (images && images.length) {
        const imgContainer = document.createElement("div");
        imgContainer.className = "claude-msg-images";
        images.forEach((img) => {
          if (img._stripped) {
            if (img.thumbnail_url) {
              const imgEl = document.createElement("img");
              imgEl.src = img.thumbnail_url;
              imgEl.style.opacity = "0.5";
              imgContainer.appendChild(imgEl);
            } else {
              const ph = document.createElement("div");
              ph.className = "stripped-placeholder";
              ph.innerHTML = '<i class="pi pi-image"></i>';
              imgContainer.appendChild(ph);
            }
          } else {
            const imgEl = document.createElement("img");
            imgEl.src = img.thumbnail_url || `data:${img.media_type};base64,${img.base64}`;
            imgContainer.appendChild(imgEl);
          }
        });
        msg.appendChild(imgContainer);
      }
      const textEl = document.createElement("span");
      textEl.textContent = content;
      msg.appendChild(textEl);
    }
    messages.appendChild(msg);
    scrollToBottom(true);
    return msg;
  }

  function appendRetryButton(msgEl) {
    const btn = document.createElement("button");
    btn.className = "claude-retry-btn";
    btn.innerHTML = '<i class="pi pi-refresh" style="font-size:10px;"></i> Retry';
    btn.addEventListener("click", () => {
      // Find the last user message in history
      const lastUserIdx = STATE.conversationHistory.findLastIndex((m) => m.role === "user");
      if (lastUserIdx < 0) return;
      const lastUser = STATE.conversationHistory[lastUserIdx];
      // Remove everything from the last user message onward
      STATE.conversationHistory.splice(lastUserIdx);
      saveConversation();
      // Remove corresponding DOM messages (user msg + assistant/error msgs after it)
      const allMsgs = [...messages.querySelectorAll(".claude-msg")];
      let removing = false;
      for (const m of allMsgs) {
        if (m.classList.contains("user") && !removing) {
          // Find the last user msg DOM element
          const nextSibling = m.nextElementSibling;
          if (nextSibling && (nextSibling === msgEl || nextSibling.contains(msgEl) || msgEl.contains(nextSibling) || nextSibling === msgEl.parentElement)) {
            removing = true;
          }
        }
      }
      // Simpler: just remove the assistant/error msg and the user msg before it
      msgEl.remove();
      const userMsgs = messages.querySelectorAll(".claude-msg.user");
      const lastUserEl = userMsgs[userMsgs.length - 1];
      if (lastUserEl) lastUserEl.remove();
      // Re-send
      sendMessageText(lastUser.content, lastUser.images);
    });
    msgEl.appendChild(btn);
  }

  function addTypingIndicator() {
    if (emptyState.parentNode) emptyState.remove();
    const el = document.createElement("div");
    el.className = "claude-msg assistant claude-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(el);
    scrollToBottom(true);
    return el;
  }

  // ── Rebuild messages from persisted history
  if (STATE.conversationHistory.length > 0) {
    emptyState.remove();
    for (let i = 0; i < STATE.conversationHistory.length; i++) {
      const entry = STATE.conversationHistory[i];
      const displayRole = entry._isSystemFeedback ? "info" : entry.role;
      const msgEl = addMessageToDOM(displayRole, entry.content, entry.images);
      msgEl.dataset.historyIdx = String(i);
      // Restore applied action states
      if (entry.role === "assistant") appendRetryButton(msgEl);
      if (entry.role === "assistant" && entry._appliedActions) {
        const cards = msgEl.querySelectorAll(".claude-action-card");
        cards.forEach((card, j) => {
          if (entry._appliedActions[j]) {
            const btn = card.querySelector(".claude-apply-btn");
            if (btn) {
              btn.disabled = true;
              btn.classList.add("applied");
              btn.textContent = "Applied!";
            }
          }
        });
      }
    }
    requestAnimationFrame(() => scrollToBottom(true));
  } else {
    messages.appendChild(emptyState);
  }

  // If streaming was in progress, show partial content
  if (STATE.isStreaming && STATE.streamingContent) {
    DOM.streamingMsg = addMessageToDOM("assistant", STATE.streamingContent);
    addTypingIndicator();
  }

  // ── Action card click handler (delegated)
  messages.addEventListener("click", async (e) => {
    // Handle revert button clicks
    const revertBtn = e.target.closest(".claude-revert-btn");
    if (revertBtn) {
      const actionId = revertBtn.dataset.actionId;
      const snapshot = STATE._graphSnapshots[actionId];
      if (snapshot) {
        app.graph.configure(snapshot);
        app.graph.setDirtyCanvas(true, true);
        revertBtn.textContent = "Reverted";
        revertBtn.disabled = true;
        revertBtn.style.opacity = "0.4";
      }
      return;
    }

    const btn = e.target.closest(".claude-apply-btn");
    if (!btn || btn.disabled) return;

    const card = btn.closest(".claude-action-card");
    const resultEl = card.querySelector(".claude-apply-result");
    const id = card.dataset.actionId;
    const actions = STATE.actionStore[id];

    if (!actions) {
      resultEl.textContent = "Error: Could not find action data";
      return;
    }

    // Snapshot graph before applying (for undo + diff)
    let beforeSnapshot = null;
    try { beforeSnapshot = app.graph.serialize(); } catch {}
    STATE._graphSnapshots[id] = beforeSnapshot;

    // Separate memory actions from graph actions
    const memoryActions = actions.filter(a => a.action === "update_memory");
    const graphActions = actions.filter(a => a.action !== "update_memory");

    const results = graphActions.length > 0 ? applyGraphActions(graphActions) : [];

    // Process memory updates
    for (const ma of memoryActions) {
      try {
        const res = await fetch("/claude-assistant/memory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memory: ma.content || ma.value || "" }),
        });
        if (res.ok) {
          results.push({ ok: true, msg: "AI memory updated" });
          if (memoryEl) {
            const memRes = await fetch("/claude-assistant/memory");
            if (memRes.ok) { const d = await memRes.json(); memoryEl.value = d.memory || ""; }
          }
        } else {
          results.push({ ok: false, msg: "Failed to update memory" });
        }
      } catch (err) {
        results.push({ ok: false, msg: `Memory update error: ${err.message}` });
      }
    }

    btn.disabled = true;
    btn.classList.add("applied");
    btn.textContent = "Applied!";

    // Compute workflow diff
    let diffSummary = "";
    if (beforeSnapshot && graphActions.length > 0) {
      try {
        const afterSnapshot = app.graph.serialize();
        diffSummary = computeWorkflowDiff(beforeSnapshot, afterSnapshot);
      } catch {}
    }

    // Track applied state in history
    const msgEl = card.closest(".claude-msg.assistant");
    const histIdx = parseInt(msgEl?.dataset.historyIdx);
    if (!isNaN(histIdx) && STATE.conversationHistory[histIdx]) {
      const entry = STATE.conversationHistory[histIdx];
      if (!entry._appliedActions) entry._appliedActions = [];
      const cardIdx = Array.from(msgEl.querySelectorAll(".claude-action-card")).indexOf(card);
      if (cardIdx >= 0) entry._appliedActions[cardIdx] = true;
    }

    const succeeded = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;
    let summaryText = results.map((r) => `${r.ok ? "\u2713" : "\u2717"} ${r.msg}`).join("\n");
    if (diffSummary) summaryText += `\nDiff: ${diffSummary}`;
    resultEl.textContent = summaryText;

    // Add revert button (only if we had graph actions)
    if (beforeSnapshot && graphActions.length > 0) {
      const rvBtn = document.createElement("button");
      rvBtn.className = "claude-revert-btn";
      rvBtn.dataset.actionId = id;
      rvBtn.textContent = "Revert";
      card.appendChild(rvBtn);
    }

    // Feed back applied results to AI
    const actionSummary = graphActions.map(a => describeAction(a)).join(", ");
    const feedbackText = `[Graph changes applied: ${succeeded} succeeded, ${failed} failed. Actions: ${actionSummary}${diffSummary ? ". Diff: " + diffSummary : ""}]`;
    STATE.conversationHistory.push({ role: "user", content: feedbackText, _isSystemFeedback: true });
    addMessageToDOM("info", feedbackText);
    saveConversation();
    updateTokenInfo();
  });

  // ── Image attach button
  imgAttachBtn.addEventListener("click", async () => {
    if (STATE.pendingImages.length > 0) {
      STATE.pendingImages = [];
      updateImagePreview();
      return;
    }
    if (STATE.lastOutputImages.length === 0) return;
    imgAttachBtn.disabled = true;
    try {
      const images = [];
      for (const imgRef of STATE.lastOutputImages.slice(0, 4)) {
        images.push(await fetchImageAsBase64(imgRef));
      }
      STATE.pendingImages = images;
      updateImagePreview();
    } catch {
      // Silently fail
    } finally {
      imgAttachBtn.disabled = false;
    }
  });

  // ── Workflow helpers
  function getWorkflow() {
    try { return app.graph ? app.graph.serialize() : null; } catch { return null; }
  }

  function getPromptsFromWorkflow() {
    try {
      const wf = getWorkflow();
      if (!wf?.nodes) return [];
      return wf.nodes
        .filter((n) => n.type === "CLIPTextEncode" || n.type === "CLIPTextEncodeSDXL")
        .map((n) => {
          const textWidget = n.widgets_values?.[0];
          return { id: n.id, type: n.type, title: n.title || n.type, text: textWidget || "" };
        })
        .filter((p) => p.text);
    } catch { return []; }
  }

  // ── Node context tracking
  _nodeInterval = setInterval(() => {
    try {
      const sel = app.canvas?.selected_nodes;
      if (!sel) return;
      const ids = Object.keys(sel);
      if (ids.length === 1) {
        const node = sel[ids[0]];
        if (node !== STATE.selectedNode) {
          STATE.selectedNode = node;
          const label = nodeCtx.querySelector(".claude-node-ctx-label");
          const typeName = node.type || node.comfyClass || "Unknown";
          label.innerHTML = `Selected: <strong>${typeName} #${node.id}</strong>`;
          nodeCtx.classList.add("visible");
        }
      } else if (ids.length !== 1 && STATE.selectedNode) {
        STATE.selectedNode = null;
        nodeCtx.classList.remove("visible");
      }
    } catch {}
    // Workflow changed indicator
    try {
      if (STATE._lastWorkflowHash != null && workflowIndicator) {
        const wf = app.graph?.serialize();
        if (wf) {
          const hash = simpleHash(JSON.stringify(wf));
          workflowIndicator.classList.toggle("visible", hash !== STATE._lastWorkflowHash);
        }
      }
    } catch {}
  }, 500);

  nodeCtx.querySelector(".claude-node-ctx-btn").addEventListener("click", () => {
    if (!STATE.selectedNode) return;
    const typeName = STATE.selectedNode.type || STATE.selectedNode.comfyClass || "Unknown";
    const widgets = STATE.selectedNode.widgets
      ?.map((w) => `  ${w.name}: ${JSON.stringify(w.value)}`)
      .join("\n") || "  (none)";
    const inputs = STATE.selectedNode.inputs
      ?.map((inp, i) => `  [${i}] ${inp.name} (${inp.type})${inp.link != null ? " - connected" : ""}`)
      .join("\n") || "  (none)";
    const outputs = STATE.selectedNode.outputs
      ?.map((out, i) => `  [${i}] ${out.name} (${out.type})`)
      .join("\n") || "  (none)";

    const prompt = `Tell me about this node and what it does:\n\nType: ${typeName}\nID: #${STATE.selectedNode.id}\nTitle: ${STATE.selectedNode.title || typeName}\n\nWidgets:\n${widgets}\n\nInputs:\n${inputs}\n\nOutputs:\n${outputs}`;
    sendMessageText(prompt);
  });

  // ── Quick actions
  quickActions.addEventListener("click", async (e) => {
    const btn = e.target.closest(".claude-quick-btn");
    if (!btn || STATE.isStreaming) return;
    let prompt = btn.dataset.prompt;

    if (prompt === "improve-prompts") {
      const prompts = getPromptsFromWorkflow();
      if (!prompts.length) {
        addMessageToDOM("error", "No text prompts found in the current workflow.");
        return;
      }
      const promptList = prompts.map((p) => `${p.title} (#${p.id}):\n"${p.text}"`).join("\n\n");
      prompt = `Here are the text prompts in my workflow. Suggest improvements for better image quality and specificity:\n\n${promptList}`;
    } else if (prompt === "fix-error") {
      if (!STATE.lastError) return;
      const errInfo = `Node: ${STATE.lastError.node_type || "?"} (#${STATE.lastError.node_id || "?"})\nError: ${STATE.lastError.exception_message || STATE.lastError.exception_type || "Unknown error"}\nTraceback:\n${STATE.lastError.traceback?.slice(0, 2000) || "N/A"}`;
      prompt = `My workflow failed with this error. Help me diagnose and fix it:\n\n${errInfo}`;
      errorBtn.style.display = "none";
      STATE.lastError = null;
    } else if (prompt === "batch-analyze") {
      if (STATE.outputImageHistory.length < 2) return;
      try {
        const selVal = batchSelect ? batchSelect.value : "all";
        const history = selVal === "all"
          ? STATE.outputImageHistory
          : STATE.outputImageHistory.slice(-parseInt(selVal));
        const allRefs = history.flatMap((e) => e.images);
        const images = [];
        for (const imgRef of allRefs.slice(0, 16)) {
          images.push(await fetchImageAsBase64(imgRef));
        }
        const runCount = history.length;
        STATE.outputImageHistory = [];
        updateBatchButton();
        sendMessageText(
          `Compare these ${images.length} images generated across ${runCount} workflow runs. Analyze differences in quality, composition, and artifacts. Identify what improved or regressed between generations, considering possible workflow changes, and suggest next steps.`,
          images
        );
      } catch (err) {
        addMessageToDOM("error", `Failed to fetch batch images: ${err.message}`);
      }
      return;
    } else if (prompt === "analyze-output") {
      if (STATE.lastOutputImages.length === 0) {
        addMessageToDOM("error", "No output images available. Run a workflow first.");
        return;
      }
      try {
        const images = [];
        for (const imgRef of STATE.lastOutputImages.slice(0, 4)) {
          images.push(await fetchImageAsBase64(imgRef));
        }
        sendMessageText(
          "Analyze this generated image. Comment on the composition, quality, any artifacts or issues, and suggest improvements to the workflow or prompts.",
          images
        );
      } catch (err) {
        addMessageToDOM("error", `Failed to fetch output images: ${err.message}`);
      }
      return;
    }

    // For text-only quick actions, populate textarea so user can add context
    textarea.value = prompt;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + "px";
    textarea.focus();
  });

  // ── Send message
  async function sendMessageText(text, images) {
    if (!text || STATE.isStreaming) return;
    STATE.isStreaming = true;
    const gen = STATE._chatGeneration;
    sendBtn.disabled = true;
    textarea.value = "";
    textarea.style.height = "auto";

    // Collect attached images
    const attachedImages = images || (STATE.pendingImages.length > 0 ? [...STATE.pendingImages] : undefined);
    STATE.pendingImages = [];
    updateImagePreview();

    addMessageToDOM("user", text, attachedImages);
    const historyEntry = { role: "user", content: text };
    if (attachedImages) historyEntry.images = attachedImages;
    STATE.conversationHistory.push(historyEntry);
    saveConversation();

    const typingEl = addTypingIndicator();

    try {
      const rawMessages = STATE.conversationHistory.map((m) => {
        const msg = { role: m.role, content: m.content };
        // Skip stripped images (from localStorage restoration)
        if (m.images && !m.images[0]?._stripped) {
          msg.images = m.images.map((img) => ({
            base64: img.base64,
            media_type: img.media_type,
          }));
        }
        return msg;
      });
      // Merge consecutive same-role messages for provider compatibility
      const mergedMessages = [];
      for (const msg of rawMessages) {
        if (mergedMessages.length > 0 && mergedMessages[mergedMessages.length - 1].role === msg.role) {
          mergedMessages[mergedMessages.length - 1].content += "\n\n" + msg.content;
        } else {
          mergedMessages.push({ ...msg });
        }
      }
      // Truncate to fit context window — keep most recent messages
      const MAX_MSG_TOKENS = 80000;
      let tokenBudget = 0;
      let truncateAt = mergedMessages.length;
      for (let i = mergedMessages.length - 1; i >= 0; i--) {
        const t = estimateTokens(mergedMessages[i].content) + (mergedMessages[i].images ? mergedMessages[i].images.length * 1000 : 0);
        if (tokenBudget + t > MAX_MSG_TOKENS) break;
        tokenBudget += t;
        truncateAt = i;
      }
      if (truncateAt > 0) mergedMessages.splice(0, truncateAt);
      // Ensure first message is from user (required by Anthropic)
      while (mergedMessages.length > 1 && mergedMessages[0].role !== "user") mergedMessages.shift();
      const body = {
        provider: STATE.currentProvider,
        messages: mergedMessages,
      };
      if (STATE.includeWorkflow) {
        const wf = getWorkflow();
        if (wf) {
          body.workflow = wf;
          STATE._lastWorkflowHash = simpleHash(JSON.stringify(wf));
          if (workflowIndicator) workflowIndicator.classList.remove("visible");
        }
      }
      if (customInstructionsEl?.value?.trim()) {
        body.custom_instructions = customInstructionsEl.value.trim();
      }
      if (STATE.includeAnimeStyles) {
        body.include_anime_styles = true;
      }

      const res = await fetch("/claude-assistant/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        if (typingEl.isConnected) typingEl.remove();
        const errMsg = addMessageToDOM("error", err.error || `HTTP ${res.status}`);
        appendRetryButton(errMsg);
        STATE.conversationHistory.pop();
        saveConversation();
        STATE.isStreaming = false;
        STATE.streamingContent = "";
        if (DOM.sendBtn) DOM.sendBtn.disabled = false;
        return;
      }

      if (typingEl.isConnected) typingEl.remove();
      DOM.streamingMsg = addMessageToDOM("assistant", "");
      let fullResponse = "";

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Bail if chat was cleared during streaming
        if (gen !== STATE._chatGeneration) { reader.cancel(); break; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "text_delta") {
              fullResponse += data.text;
              STATE.streamingContent = fullResponse;
              if (DOM.streamingMsg && DOM.streamingMsg.isConnected) {
                const { html } = renderMarkdown(fullResponse);
                DOM.streamingMsg.innerHTML = html;
                scrollToBottom();
              }
            } else if (data.type === "error") {
              if (gen !== STATE._chatGeneration) break;
              if (DOM.streamingMsg && DOM.streamingMsg.isConnected) DOM.streamingMsg.remove();
              DOM.streamingMsg = null;
              const errMsg = addMessageToDOM("error", data.error);
              appendRetryButton(errMsg);
              fullResponse = "";
            }
          } catch {}
        }
      }

      // Bail if chat was cleared during streaming
      if (gen !== STATE._chatGeneration) return;

      // Final render with interactive action cards
      if (fullResponse) {
        const histIdx = STATE.conversationHistory.length;
        STATE.conversationHistory.push({ role: "assistant", content: fullResponse });

        if (DOM.streamingMsg && DOM.streamingMsg.isConnected) {
          const { html, actionBlocks } = renderMarkdown(fullResponse, { actionStore: STATE.actionStore });
          DOM.streamingMsg.innerHTML = html;
          DOM.streamingMsg.dataset.historyIdx = String(histIdx);

          // Store action blocks by card ID
          const cards = DOM.streamingMsg.querySelectorAll(".claude-action-card");
          cards.forEach((card, i) => {
            if (actionBlocks[i]) {
              STATE.actionStore[card.dataset.actionId] = actionBlocks[i];
            }
          });

          // Add retry button
          appendRetryButton(DOM.streamingMsg);
          scrollToBottom(true);
        }
        saveConversation();
      } else {
        // Empty response — treat as error
        if (DOM.streamingMsg && DOM.streamingMsg.isConnected) DOM.streamingMsg.remove();
        const errMsg = addMessageToDOM("error", "Empty response from model");
        appendRetryButton(errMsg);
      }
    } catch (err) {
      if (typingEl.isConnected) typingEl.remove();
      const errMsg = addMessageToDOM("error", `Connection error: ${err.message}`);
      appendRetryButton(errMsg);
    }

    STATE.isStreaming = false;
    STATE.streamingContent = "";
    DOM.streamingMsg = null;
    if (DOM.sendBtn) DOM.sendBtn.disabled = false;
    if (DOM.textarea && DOM.textarea.isConnected) DOM.textarea.focus();
    updateTokenInfo();
  }

  // ── Input events
  sendBtn.addEventListener("click", () => sendMessageText(textarea.value.trim()));
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessageText(textarea.value.trim());
    }
  });

  // ── Disable send if streaming in progress (from previous tab session)
  if (STATE.isStreaming) {
    sendBtn.disabled = true;
  }

  // ── Register global listeners
  registerGlobalListeners();
}

/* ═══════════════════════════════════════════════════════════════════
   EXTENSION REGISTRATION
   ═══════════════════════════════════════════════════════════════════ */

app.registerExtension({
  name: "comfyui.comfybot",

  async setup() {
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);

    app.extensionManager.registerSidebarTab({
      id: "comfybot",
      icon: "pi pi-comments",
      title: "ComfyBot",
      tooltip: "ComfyBot - AI Assistant",
      type: "custom",
      render: (el) => buildChatUI(el),
    });
  },
});

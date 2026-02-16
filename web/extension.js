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
  position: fixed; z-index: 9999;
  width: 420px; height: 600px;
  min-width: 320px; min-height: 300px;
  background: var(--bg-color, #1a1a1a);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
  resize: both;
}
.claude-floating-panel .claude-root {
  flex: 1; min-height: 0;
}
.claude-floating-panel .claude-drag-bar {
  height: 6px; cursor: grab; flex-shrink: 0;
  background: linear-gradient(135deg, rgba(74,170,255,0.15) 0%, transparent 100%);
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
`;

/* ═══════════════════════════════════════════════════════════════════
   MODEL LISTS
   ═══════════════════════════════════════════════════════════════════ */

const ANTHROPIC_MODELS = [
  { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5" },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
  { id: "claude-opus-4-6", name: "Claude Opus 4.6" },
];
const OPENROUTER_MODELS = [
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5" },
  { id: "anthropic/claude-haiku-4.5", name: "Claude Haiku 4.5" },
  { id: "anthropic/claude-opus-4", name: "Claude Opus 4" },
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
            if (w) w.value = v;
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
        const w = node.widgets?.find((w) => w.name === action.name);
        if (!w) return { ok: false, msg: `Widget "${action.name}" not found on #${action.node_id}` };
        w.value = action.value;
        return { ok: true, msg: `Set ${action.name}=${JSON.stringify(action.value)} on #${action.node_id}` };
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
    <button class="claude-header-btn" data-action="popout" title="Pop out / Dock"><i class="pi pi-external-link"></i></button>
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
    </label>
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

  // ── Settings events
  providerSelect.addEventListener("change", () => updateProviderUI(providerSelect.value));

  header.querySelector('[data-action="settings"]').addEventListener("click", () => {
    STATE.settingsOpen = !STATE.settingsOpen;
    settings.classList.toggle("open", STATE.settingsOpen);
    header.querySelector('[data-action="settings"]').classList.toggle("active", STATE.settingsOpen);
  });

  header.querySelector('[data-action="clear"]').addEventListener("click", () => {
    STATE.conversationHistory = [];
    STATE.actionStore = {};
    STATE.outputImageHistory = [];
    messages.innerHTML = "";
    messages.appendChild(emptyState);
    updateBatchButton();
  });

  // ── Pop out / Dock
  const popoutBtn = header.querySelector('[data-action="popout"]');
  let floatingPanel = document.querySelector(".claude-floating-panel");

  function popOut() {
    if (floatingPanel) return;
    STATE.isFloating = true;
    popoutBtn.classList.add("active");
    popoutBtn.title = "Dock back to sidebar";
    popoutBtn.querySelector("i").className = "pi pi-window-minimize";

    floatingPanel = document.createElement("div");
    floatingPanel.className = "claude-floating-panel";
    const dragBar = document.createElement("div");
    dragBar.className = "claude-drag-bar";
    floatingPanel.appendChild(dragBar);
    floatingPanel.appendChild(root);

    const pos = STATE.floatingPos || { x: window.innerWidth - 450, y: 60 };
    floatingPanel.style.left = pos.x + "px";
    floatingPanel.style.top = pos.y + "px";
    document.body.appendChild(floatingPanel);

    // Drag handling
    let dragging = false, dx = 0, dy = 0;
    dragBar.addEventListener("mousedown", (e) => {
      dragging = true;
      dx = e.clientX - floatingPanel.offsetLeft;
      dy = e.clientY - floatingPanel.offsetTop;
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const nx = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dx));
      const ny = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dy));
      floatingPanel.style.left = nx + "px";
      floatingPanel.style.top = ny + "px";
      STATE.floatingPos = { x: nx, y: ny };
    });
    document.addEventListener("mouseup", () => { dragging = false; });
  }

  function dockBack() {
    if (!floatingPanel) return;
    STATE.isFloating = false;
    popoutBtn.classList.remove("active");
    popoutBtn.title = "Pop out";
    popoutBtn.querySelector("i").className = "pi pi-external-link";

    el.appendChild(root);
    floatingPanel.remove();
    floatingPanel = null;
  }

  popoutBtn.addEventListener("click", () => {
    if (STATE.isFloating) dockBack(); else popOut();
  });

  // Restore floating state on tab switch rebuild
  if (STATE.isFloating) popOut();

  saveBtn.addEventListener("click", async () => {
    const body = { provider: providerSelect.value, model: modelSelect.value };
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
  });

  // ── Message helpers
  function addMessageToDOM(role, content, images) {
    if (emptyState.parentNode) emptyState.remove();
    const msg = document.createElement("div");
    msg.className = `claude-msg ${role}`;
    if (role === "assistant") {
      const { html, actionBlocks } = renderMarkdown(content, { actionStore: STATE.actionStore });
      msg.innerHTML = html;
      // Store action blocks by card data-action-id
      const cards = msg.querySelectorAll(".claude-action-card");
      cards.forEach((card, i) => {
        if (actionBlocks[i]) STATE.actionStore[card.dataset.actionId] = actionBlocks[i];
      });
    } else if (role === "error") {
      msg.textContent = content;
    } else {
      // User message with optional images
      if (images && images.length) {
        const imgContainer = document.createElement("div");
        imgContainer.className = "claude-msg-images";
        images.forEach((img) => {
          const imgEl = document.createElement("img");
          imgEl.src = img.thumbnail_url || `data:${img.media_type};base64,${img.base64}`;
          imgContainer.appendChild(imgEl);
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
      const msgEl = addMessageToDOM(entry.role, entry.content, entry.images);
      msgEl.dataset.historyIdx = String(i);
      // Restore applied action states
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
  messages.addEventListener("click", (e) => {
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

    const results = applyGraphActions(actions);
    btn.disabled = true;
    btn.classList.add("applied");
    btn.textContent = "Applied!";

    // Track applied state in history
    const msgEl = card.closest(".claude-msg.assistant");
    const histIdx = parseInt(msgEl?.dataset.historyIdx);
    if (!isNaN(histIdx) && STATE.conversationHistory[histIdx]) {
      const entry = STATE.conversationHistory[histIdx];
      if (!entry._appliedActions) entry._appliedActions = [];
      const cardIdx = Array.from(msgEl.querySelectorAll(".claude-action-card")).indexOf(card);
      if (cardIdx >= 0) entry._appliedActions[cardIdx] = true;
    }

    const summary = results.map((r) => `${r.ok ? "\u2713" : "\u2717"} ${r.msg}`).join("\n");
    resultEl.textContent = summary;
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

    const typingEl = addTypingIndicator();

    try {
      const body = {
        provider: STATE.currentProvider,
        messages: STATE.conversationHistory.map((m) => {
          const msg = { role: m.role, content: m.content };
          if (m.images) {
            msg.images = m.images.map((img) => ({
              base64: img.base64,
              media_type: img.media_type,
            }));
          }
          return msg;
        }),
      };
      if (STATE.includeWorkflow) {
        const wf = getWorkflow();
        if (wf) body.workflow = wf;
      }

      const res = await fetch("/claude-assistant/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        if (typingEl.isConnected) typingEl.remove();
        addMessageToDOM("error", err.error || `HTTP ${res.status}`);
        STATE.conversationHistory.pop();
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
              // Update DOM if still connected
              if (DOM.streamingMsg && DOM.streamingMsg.isConnected) {
                const { html } = renderMarkdown(fullResponse);
                DOM.streamingMsg.innerHTML = html;
                scrollToBottom();
              }
            } else if (data.type === "error") {
              if (DOM.streamingMsg && DOM.streamingMsg.isConnected) DOM.streamingMsg.remove();
              DOM.streamingMsg = null;
              addMessageToDOM("error", data.error);
              fullResponse = "";
            }
          } catch {}
        }
      }

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

          scrollToBottom(true);
        }
      }
    } catch (err) {
      if (typingEl.isConnected) typingEl.remove();
      addMessageToDOM("error", `Connection error: ${err.message}`);
    }

    STATE.isStreaming = false;
    STATE.streamingContent = "";
    DOM.streamingMsg = null;
    if (DOM.sendBtn) DOM.sendBtn.disabled = false;
    if (DOM.textarea && DOM.textarea.isConnected) DOM.textarea.focus();
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

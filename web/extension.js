import { app } from "../../scripts/app.js";

/* ── CSS ────────────────────────────────────────────────────────── */

const STYLES = `
.claude-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: inherit;
  color: var(--fg-color, #ddd);
}

/* ── Header ── */
.claude-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color, #4a4a4a);
  flex-shrink: 0;
}
.claude-header-title {
  font-weight: 600;
  font-size: 14px;
  flex: 1;
}
.claude-header-btn {
  background: none;
  border: none;
  color: var(--fg-color, #ddd);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.claude-header-btn:hover { opacity: 1; }
.claude-header-btn.active { opacity: 1; color: var(--p-primary-color, #4af); }

/* ── Settings ── */
.claude-settings {
  display: none;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--border-color, #4a4a4a);
  background: var(--comfy-menu-bg, #242424);
  flex-shrink: 0;
  max-height: 50%;
  overflow-y: auto;
}
.claude-settings.open { display: flex; }
.claude-settings label {
  font-size: 12px;
  font-weight: 500;
  color: var(--fg-color, #aaa);
}
.claude-settings input,
.claude-settings select {
  padding: 6px 8px;
  border: 1px solid var(--border-color, #4a4a4a);
  border-radius: 4px;
  background: var(--comfy-input-bg, #333);
  color: var(--input-text, #ddd);
  font-size: 13px;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.claude-settings-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.claude-settings-row.hidden { display: none; }
.claude-settings-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}
.claude-settings-status {
  font-size: 11px;
  opacity: 0.7;
  flex: 1;
}
.claude-btn {
  padding: 5px 12px;
  border: 1px solid var(--border-color, #4a4a4a);
  border-radius: 4px;
  background: var(--comfy-input-bg, #333);
  color: var(--input-text, #ddd);
  cursor: pointer;
  font-size: 12px;
  font-family: inherit;
  transition: background 0.15s;
}
.claude-btn:hover { background: var(--border-color, #4a4a4a); }
.claude-btn-primary {
  background: var(--p-primary-color, #4af);
  color: #fff;
  border-color: var(--p-primary-color, #4af);
}
.claude-btn-primary:hover { opacity: 0.85; }
.claude-settings-hint {
  font-size: 11px;
  opacity: 0.5;
  margin-top: 1px;
}

/* ── Messages ── */
.claude-messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}
.claude-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  opacity: 0.4;
  text-align: center;
  font-size: 13px;
  gap: 8px;
  padding: 20px;
}
.claude-empty-icon { font-size: 32px; }
.claude-msg {
  padding: 8px 12px;
  border-radius: 10px;
  max-width: 92%;
  word-wrap: break-word;
  font-size: 13px;
  line-height: 1.5;
}
.claude-msg.user {
  align-self: flex-end;
  background: var(--p-primary-color, #4af);
  color: #fff;
  border-bottom-right-radius: 3px;
}
.claude-msg.assistant {
  align-self: flex-start;
  background: var(--comfy-menu-bg, #2a2a2a);
  border: 1px solid var(--border-color, #4a4a4a);
  border-bottom-left-radius: 3px;
}
.claude-msg.error {
  align-self: center;
  background: rgba(220, 50, 50, 0.15);
  border: 1px solid rgba(220, 50, 50, 0.4);
  color: #f88;
  font-size: 12px;
  max-width: 100%;
}

/* Markdown inside messages */
.claude-msg.assistant p { margin: 0 0 8px 0; }
.claude-msg.assistant p:last-child { margin-bottom: 0; }
.claude-msg.assistant code {
  background: rgba(255,255,255,0.08);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 12px;
  font-family: "Consolas", "Monaco", monospace;
}
.claude-msg.assistant pre {
  background: rgba(0,0,0,0.3);
  padding: 8px 10px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 6px 0;
  font-size: 12px;
  line-height: 1.4;
}
.claude-msg.assistant pre code {
  background: none;
  padding: 0;
}
.claude-msg.assistant ul, .claude-msg.assistant ol {
  margin: 4px 0;
  padding-left: 20px;
}
.claude-msg.assistant li { margin: 2px 0; }
.claude-msg.assistant strong { font-weight: 600; }
.claude-msg.assistant em { font-style: italic; }
.claude-msg.assistant h1, .claude-msg.assistant h2, .claude-msg.assistant h3 {
  margin: 8px 0 4px 0;
  font-weight: 600;
}
.claude-msg.assistant h1 { font-size: 16px; }
.claude-msg.assistant h2 { font-size: 15px; }
.claude-msg.assistant h3 { font-size: 14px; }

/* Typing indicator */
.claude-typing span {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--fg-color, #aaa);
  border-radius: 50%;
  margin: 0 2px;
  animation: claude-bounce 1.2s infinite;
}
.claude-typing span:nth-child(2) { animation-delay: 0.2s; }
.claude-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes claude-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* ── Input ── */
.claude-input-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border-top: 1px solid var(--border-color, #4a4a4a);
  flex-shrink: 0;
}
.claude-workflow-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  opacity: 0.7;
  cursor: pointer;
  user-select: none;
}
.claude-workflow-toggle input { margin: 0; }
.claude-input-row {
  display: flex;
  gap: 6px;
  align-items: flex-end;
}
.claude-textarea {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--border-color, #4a4a4a);
  border-radius: 8px;
  background: var(--comfy-input-bg, #333);
  color: var(--input-text, #ddd);
  font-size: 13px;
  font-family: inherit;
  resize: none;
  min-height: 38px;
  max-height: 140px;
  line-height: 1.4;
  outline: none;
  transition: border-color 0.15s;
}
.claude-textarea:focus { border-color: var(--p-primary-color, #4af); }
.claude-textarea::placeholder { color: var(--fg-color, #888); opacity: 0.5; }
.claude-send-btn {
  padding: 8px 12px;
  background: var(--p-primary-color, #4af);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  height: 38px;
  transition: opacity 0.15s;
}
.claude-send-btn:hover { opacity: 0.85; }
.claude-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

/* ── Model lists ────────────────────────────────────────────────── */

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

/* ── Markdown renderer (lightweight) ────────────────────────────── */

function renderMarkdown(text) {
  const codeBlocks = [];
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(`<pre><code class="lang-${lang}">${escapeHtml(code.trim())}</code></pre>`);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  text = text.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
  text = text.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  text = text.replace(/\n\n+/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  text = `<p>${text}</p>`;
  text = text.replace(/<p><(h[123]|ul|ol|pre)/g, '<$1');
  text = text.replace(/<\/(h[123]|ul|ol|pre)><\/p>/g, '</$1>');
  text = text.replace(/<p><\/p>/g, '');
  text = text.replace(/%%CODEBLOCK_(\d+)%%/g, (_, i) => codeBlocks[i]);

  return text;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Chat UI builder ────────────────────────────────────────────── */

function buildChatUI(el) {
  const root = document.createElement("div");
  root.className = "claude-root";

  // ── State
  let conversationHistory = [];
  let isStreaming = false;
  let includeWorkflow = true;
  let settingsOpen = false;
  let currentProvider = "openrouter";

  // ── Header
  const header = document.createElement("div");
  header.className = "claude-header";
  header.innerHTML = `
    <span class="claude-header-title">AI Assistant</span>
    <button class="claude-header-btn" data-action="settings" title="Settings">
      <i class="pi pi-cog"></i>
    </button>
    <button class="claude-header-btn" data-action="clear" title="Clear chat">
      <i class="pi pi-trash"></i>
    </button>
  `;

  // ── Settings panel
  const settings = document.createElement("div");
  settings.className = "claude-settings";
  settings.innerHTML = `
    <div class="claude-settings-row">
      <label>Provider</label>
      <select class="claude-provider-select">
        <option value="openrouter">OpenRouter</option>
        <option value="anthropic">Anthropic (direct)</option>
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
    <div class="claude-settings-row">
      <label>Model</label>
      <select class="claude-model-select"></select>
    </div>
    <div class="claude-settings-actions">
      <button class="claude-btn claude-btn-primary claude-save-btn">Save</button>
      <span class="claude-settings-status"></span>
    </div>
  `;

  // ── Messages area
  const messages = document.createElement("div");
  messages.className = "claude-messages";
  const emptyState = document.createElement("div");
  emptyState.className = "claude-empty";
  emptyState.innerHTML = `
    <div class="claude-empty-icon"><i class="pi pi-comments"></i></div>
    <div>Ask about your<br>ComfyUI workflow</div>
  `;
  messages.appendChild(emptyState);

  // ── Input area
  const inputArea = document.createElement("div");
  inputArea.className = "claude-input-area";
  inputArea.innerHTML = `
    <label class="claude-workflow-toggle">
      <input type="checkbox" checked> Include current workflow as context
    </label>
    <div class="claude-input-row">
      <textarea class="claude-textarea" placeholder="Ask about your workflow..." rows="1"></textarea>
      <button class="claude-send-btn" title="Send"><i class="pi pi-send"></i></button>
    </div>
  `;

  root.appendChild(header);
  root.appendChild(settings);
  root.appendChild(messages);
  root.appendChild(inputArea);
  el.appendChild(root);

  // ── Element references
  const providerSelect = settings.querySelector(".claude-provider-select");
  const openrouterKeyInput = settings.querySelector(".claude-openrouter-key");
  const anthropicKeyInput = settings.querySelector(".claude-anthropic-key");
  const openrouterKeyRow = settings.querySelector(".claude-row-openrouter-key");
  const anthropicKeyRow = settings.querySelector(".claude-row-anthropic-key");
  const modelSelect = settings.querySelector(".claude-model-select");
  const saveBtn = settings.querySelector(".claude-save-btn");
  const statusEl = settings.querySelector(".claude-settings-status");
  const textarea = inputArea.querySelector(".claude-textarea");
  const sendBtn = inputArea.querySelector(".claude-send-btn");
  const workflowCheckbox = inputArea.querySelector(".claude-workflow-toggle input");

  // ── Populate model dropdown
  function updateModelList(provider, currentModel) {
    const models = provider === "anthropic" ? ANTHROPIC_MODELS : OPENROUTER_MODELS;
    modelSelect.innerHTML = models
      .map((m) => `<option value="${m.id}">${m.name}</option>`)
      .join("");

    // Try to keep current selection, otherwise default to first
    if (currentModel && models.some((m) => m.id === currentModel)) {
      modelSelect.value = currentModel;
    }
  }

  // ── Show/hide API key fields based on provider
  function updateProviderUI(provider) {
    currentProvider = provider;
    openrouterKeyRow.classList.toggle("hidden", provider !== "openrouter");
    anthropicKeyRow.classList.toggle("hidden", provider !== "anthropic");
    updateModelList(provider, modelSelect.value);
  }

  // ── Initial model list
  updateModelList("openrouter", null);

  // ── Load saved config
  loadConfig();

  async function loadConfig() {
    try {
      const res = await fetch("/claude-assistant/config");
      const cfg = await res.json();

      currentProvider = cfg.provider || "openrouter";
      providerSelect.value = currentProvider;
      updateProviderUI(currentProvider);

      if (cfg.openrouter_key_preview) {
        openrouterKeyInput.placeholder = `Current: ${cfg.openrouter_key_preview}`;
      }
      if (cfg.anthropic_key_preview) {
        anthropicKeyInput.placeholder = `Current: ${cfg.anthropic_key_preview}`;
      }
      if (cfg.model) {
        updateModelList(currentProvider, cfg.model);
      }
      if (!cfg.has_api_key) {
        settingsOpen = true;
        settings.classList.add("open");
        header.querySelector('[data-action="settings"]').classList.add("active");
        statusEl.textContent = "Please configure your API key";
      }
    } catch (e) {
      // Server not ready yet
    }
  }

  // ── Provider change
  providerSelect.addEventListener("change", () => {
    updateProviderUI(providerSelect.value);
  });

  // ── Settings toggle
  header.querySelector('[data-action="settings"]').addEventListener("click", () => {
    settingsOpen = !settingsOpen;
    settings.classList.toggle("open", settingsOpen);
    header.querySelector('[data-action="settings"]').classList.toggle("active", settingsOpen);
  });

  // ── Clear chat
  header.querySelector('[data-action="clear"]').addEventListener("click", () => {
    conversationHistory = [];
    messages.innerHTML = "";
    messages.appendChild(emptyState);
  });

  // ── Save settings
  saveBtn.addEventListener("click", async () => {
    const body = {
      provider: providerSelect.value,
      model: modelSelect.value,
    };
    if (openrouterKeyInput.value.trim()) {
      body.openrouter_api_key = openrouterKeyInput.value.trim();
    }
    if (anthropicKeyInput.value.trim()) {
      body.anthropic_api_key = anthropicKeyInput.value.trim();
    }
    try {
      const res = await fetch("/claude-assistant/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        statusEl.textContent = "Saved!";
        if (openrouterKeyInput.value.trim()) {
          openrouterKeyInput.placeholder = `Current: ...${openrouterKeyInput.value.trim().slice(-4)}`;
          openrouterKeyInput.value = "";
        }
        if (anthropicKeyInput.value.trim()) {
          anthropicKeyInput.placeholder = `Current: ...${anthropicKeyInput.value.trim().slice(-4)}`;
          anthropicKeyInput.value = "";
        }
        setTimeout(() => { statusEl.textContent = ""; }, 2000);
      }
    } catch (e) {
      statusEl.textContent = "Error saving";
    }
  });

  // ── Workflow checkbox
  workflowCheckbox.addEventListener("change", () => {
    includeWorkflow = workflowCheckbox.checked;
  });

  // ── Auto-resize textarea
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 140) + "px";
  });

  // ── Add a message to the UI
  function addMessage(role, content) {
    if (emptyState.parentNode) emptyState.remove();

    const msg = document.createElement("div");
    msg.className = `claude-msg ${role}`;

    if (role === "assistant") {
      msg.innerHTML = renderMarkdown(content);
    } else if (role === "error") {
      msg.textContent = content;
    } else {
      msg.textContent = content;
    }

    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  // ── Typing indicator
  function addTypingIndicator() {
    if (emptyState.parentNode) emptyState.remove();
    const el = document.createElement("div");
    el.className = "claude-msg assistant claude-typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  }

  // ── Get current workflow
  function getWorkflow() {
    try {
      if (app.graph) {
        return app.graph.serialize();
      }
    } catch (e) {
      // Graph not available
    }
    return null;
  }

  // ── Send message
  async function sendMessage() {
    const text = textarea.value.trim();
    if (!text || isStreaming) return;

    isStreaming = true;
    sendBtn.disabled = true;
    textarea.value = "";
    textarea.style.height = "auto";

    addMessage("user", text);
    conversationHistory.push({ role: "user", content: text });

    const typingEl = addTypingIndicator();

    try {
      const body = { messages: conversationHistory };
      if (includeWorkflow) {
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
        typingEl.remove();
        addMessage("error", err.error || `HTTP ${res.status}`);
        conversationHistory.pop();
        isStreaming = false;
        sendBtn.disabled = false;
        return;
      }

      typingEl.remove();
      const msgEl = addMessage("assistant", "");
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
              msgEl.innerHTML = renderMarkdown(fullResponse);
              messages.scrollTop = messages.scrollHeight;
            } else if (data.type === "error") {
              msgEl.remove();
              addMessage("error", data.error);
              fullResponse = "";
            }
          } catch {
            // Malformed JSON, skip
          }
        }
      }

      if (fullResponse) {
        conversationHistory.push({ role: "assistant", content: fullResponse });
      }
    } catch (err) {
      typingEl.remove?.();
      addMessage("error", `Connection error: ${err.message}`);
    }

    isStreaming = false;
    sendBtn.disabled = false;
    textarea.focus();
  }

  // ── Event listeners
  sendBtn.addEventListener("click", sendMessage);
  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

/* ── Extension registration ─────────────────────────────────────── */

app.registerExtension({
  name: "comfyui.claude.assistant",

  async setup() {
    const style = document.createElement("style");
    style.textContent = STYLES;
    document.head.appendChild(style);

    app.extensionManager.registerSidebarTab({
      id: "claude-assistant",
      icon: "pi pi-comments",
      title: "AI Assistant",
      tooltip: "AI Assistant (Claude / OpenRouter)",
      type: "custom",
      render: (el) => {
        buildChatUI(el);
      },
    });
  },
});

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ComfyBot — AI-powered sidebar extension for ComfyUI. Chat with AI, manipulate graphs, analyze images, diagnose errors, engineer prompts. Includes conversation persistence, undo/revert, drag & drop images, AI memory, custom instructions, and more. No custom nodes, sidebar-only (`NODE_CLASS_MAPPINGS = {}`).

## Project Structure

```
__init__.py          # Entry point: WEB_DIRECTORY = "./web", imports server.py
server.py            # aiohttp API routes on PromptServer, streaming to 3 providers
web/extension.js     # Single-file frontend (~2300 lines): sidebar UI, CSS inlined, all features
requirements.txt     # anthropic[bedrock]>=0.40.0
logo.svg             # Sidebar tab icon
memory.md            # Persistent AI memory (written at runtime via update_memory action)
anime_styles.json    # Danbooru anime artist tags (loaded on demand, cached)
sdxl_styles.json     # SDXL artist style tags with descriptions (loaded on demand, cached)
```

## Development

No build step, linter, or test suite. The extension is vanilla JS + Python with no transpilation.

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Test changes:** This extension runs inside ComfyUI. Install to `ComfyUI/custom_nodes/`, restart ComfyUI (or just refresh browser for JS-only changes — ComfyUI auto-loads JS from `WEB_DIRECTORY`). Python changes (server.py) require a ComfyUI restart.

**Frontend debugging:** Browser DevTools console — the extension logs errors there. All CSS is inlined in extension.js (no separate stylesheet).

## Architecture

### Providers (server.py)

Three streaming backends, all normalize to SSE format `data: {"type": "text_delta", "text": "..."}`:

| Provider | Function | Client | Auth |
|----------|----------|--------|------|
| OpenRouter | `stream_openrouter()` | raw aiohttp to OpenAI-compatible API | `OPENROUTER_API_KEY` |
| Anthropic | `stream_anthropic()` | `AsyncAnthropic` SDK | `ANTHROPIC_API_KEY` |
| Bedrock | `stream_bedrock()` | `AsyncAnthropicBedrock` SDK | `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + region |

Key server functions:
- `SYSTEM_PROMPT` — large inline string defining ComfyBot's persona, action format, node slot reference, and prompt engineering guidance
- `convert_messages_for_anthropic()` / `convert_messages_for_openrouter()` — image content conversion
- `build_system_with_workflow()` — combines SYSTEM_PROMPT + custom instructions + workflow JSON + installed models + AI memory + optional artist style tags
- `get_installed_models()` — reads ComfyUI `folder_paths` for checkpoints, LoRAs, VAEs, etc.
- `load_memory()` / `save_memory()` — persistent AI memory stored in `memory.md` (extension root)
- `load_anime_styles()` / `load_sdxl_styles()` — cached loaders for artist tag JSON files, injected into system prompt when `include_anime_styles` config is enabled

### Frontend (web/extension.js)

Single file (~2300 lines), CSS inlined at top. Organized into labeled sections with `/* ═══ */` delimiters:

| Section | Approx. Lines | Contents |
|---------|--------------|----------|
| CSS | 1–462 | All styles in `STYLES` template literal |
| Model Lists | 463–491 | `ANTHROPIC_MODELS`, `OPENROUTER_MODELS`, `BEDROCK_MODELS` arrays |
| Persistent State | 493–542 | `STATE` and `DOM` module-scoped objects |
| Conversation Persistence | 546–628 | `saveConversation()`, `loadConversation()`, `estimateTokens()`, `simpleHash()`, `computeWorkflowDiff()` |
| Graph Actions | 630–833 | `executeGraphAction()`, `applyGraphActions()`, `applyActionCardActions()` |
| Markdown Rendering | 835–897 | `renderMarkdown()` with code block + action card parsing |
| Image Handling | 899–947 | `fetchImageAsBase64()`, `updateImagePreview()` |
| Global Listeners | 949–1021 | `registerGlobalListeners()` — error capture, execution events, node tracking interval |
| UI Building | 1023–2275 | `buildChatUI(el)` — the main function that builds all DOM, handles streaming, settings, quick actions, iteration mode |
| Extension Registration | 2277–2298 | `app.registerExtension()` + `registerSidebarTab()` |

Model lists are hardcoded constants — update them when adding new models. Conversation stored in `localStorage` under key `comfybot-conversation`.

Key architectural patterns:

- **Module-scoped STATE** — `const STATE = {...}` persists across sidebar tab switches (ComfyUI calls `render(el)` each time the tab is selected, destroying/rebuilding DOM). Holds conversationHistory, streaming state, actionStore, outputImageHistory, floatingPos, _graphSnapshots, _lastWorkflowHash.
- **Module-scoped DOM** — `const DOM = {...}` updated on each `buildChatUI()` call so async streaming callbacks always write to the current DOM elements.
- **Conversation persistence** — `saveConversation()` serializes history + actionStore to localStorage (base64 images stripped to save space; thumbnail_url preserved for display). `loadConversation()` restores on module init. Called after every history mutation.
- **Node ID remapping** — `applyGraphActions()` maps AI-assigned temporary IDs to real LiteGraph IDs via `explicitMap` (from `add_node.id` field) and `positionMap` (sequential fallback).
- **Widget callbacks** — `set_widget` triggers `w.callback()` and `node.onWidgetChanged()` so custom nodes react to value changes.
- **Graph undo** — Before applying actions, graph is snapshotted via `app.graph.serialize()`. "Revert" button restores via `app.graph.configure()`. Snapshots are session-only (not in localStorage).
- **Workflow diff** — `computeWorkflowDiff()` compares before/after serialized graphs, reports added/removed nodes, widget changes, connection deltas.
- **AI feedback** — After applying graph actions, a feedback message is appended to conversationHistory as `role: "user"` with `_isSystemFeedback: true`, rendered as centered info bubble. Consecutive same-role messages are merged in API payloads for provider compatibility.
- **Iteration mode** — Automated apply-and-refine loop. User sets a goal and max rounds (`STATE.iterationMode`, `iterationGoal`, `iterationMax`). Each round: AI suggests changes → auto-apply → queue prompt → capture output → send diff + output back to AI. `_iterationAwaitingResult` gates the loop; `iterationSnapshot` stores the graph before iteration 1 for full revert.
- **Drag & drop** — Images dropped on the message area are read via FileReader, pushed to `STATE.pendingImages`, max 4 images.
- **Token estimate** — `estimateTokens()` uses ~4 chars/token heuristic. Displays conversation + workflow token count in input area.
- **Context truncation** — Before sending, messages are truncated to ~80k estimated tokens (oldest dropped first). Ensures first message is `role: "user"` for Anthropic compatibility. Full history stays in localStorage for display.
- **Generation tracking** — `STATE._chatGeneration` counter incremented on clear. In-flight streaming responses check this to bail out if the chat was cleared mid-stream.
- **Workflow changed indicator** — Hashes the serialized workflow on send, polls in the node-tracking interval, shows "~ changed" label when hash differs.
- **Quick actions** — text-only actions populate the textarea (user can edit before sending); image-based actions (analyze-output, batch-analyze) send immediately.
- **Floating panel** — pop-out button moves the chat root into a `position: fixed` draggable panel; leaves a placeholder in the sidebar.

### Config Persistence

File location: `/workspace/.claude-assistant-config.json` (RunPod) > `~/.claude-assistant-config.json` > `config.json` (extension dir).

### AI Memory

Persistent memory file: `memory.md` in the extension root. AI writes to it via `update_memory` action. Injected into system prompt. User can view (read-only) in settings panel.

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/claude-assistant/chat/stream` | SSE streaming chat (accepts `provider`, `messages`, `workflow`, `model`, `custom_instructions`) |
| GET | `/claude-assistant/config` | Get config with masked API keys + custom_instructions |
| POST | `/claude-assistant/config` | Save provider, API keys, model, Bedrock credentials, custom_instructions |
| GET | `/claude-assistant/installed-models` | Installed checkpoints, LoRAs, VAEs, etc. |
| GET | `/claude-assistant/memory` | Get persistent AI memory |
| POST | `/claude-assistant/memory` | Update persistent AI memory |

## ComfyUI Extension Patterns

- Routes: `@routes.post("/path")` where `routes = PromptServer.instance.routes`
- Sidebar: `app.extensionManager.registerSidebarTab()` in `setup()` hook
- JS files in `WEB_DIRECTORY` root are auto-loaded (no recursion into subdirs)
- Import: `import { app } from "../../scripts/app.js"` / `import { api } from "../../scripts/api.js"`
- CSS vars: `--comfy-input-bg`, `--comfy-menu-bg`, `--border-color`, `--fg-color`, `--p-primary-color`

## Graph Manipulation Format

AI outputs `comfyui-actions` code blocks parsed into interactive "Apply" cards:
````
```comfyui-actions
[
  {"action": "add_node", "id": 1, "type": "KSampler", "pos": [500, 300], "widgets": {"steps": 30}},
  {"action": "connect", "from_node": 1, "from_slot": "LATENT", "to_node": 6, "to_slot": "samples"},
  {"action": "set_widget", "node_id": 3, "name": "seed", "value": 42},
  {"action": "remove_node", "node_id": 7},
  {"action": "disconnect", "node_id": 5, "slot": "model"},
  {"action": "update_memory", "content": "User prefers anime style"}
]
```
````
The `id` field in `add_node` is a temporary reference — `applyGraphActions()` remaps it to the actual LiteGraph node ID for subsequent connect/set_widget actions. Slot references support both names and indices. The `update_memory` action is handled separately from graph actions (async POST to `/claude-assistant/memory`).

## Key LiteGraph/ComfyUI JS APIs

- `app.graph.serialize()` — workflow JSON for context
- `LiteGraph.createNode(type)` / `app.graph.add(node)` — add nodes
- `node.connect(outSlot, targetNode, inSlot)` — connect
- `app.graph.getNodeById(id)` — find nodes
- `app.graph.setDirtyCanvas(true, true)` — force re-render
- `app.graph.configure(data)` — restore graph from serialized snapshot (used by undo/revert)
- `app.canvas.selected_nodes` — current selection
- `api.addEventListener("execution_error"|"executed", ...)` — runtime events
- `/view?filename=...&type=output` — fetch generated images

## Important Conventions

- **SSE normalization** — All three providers must emit the same `data: {"type": "text_delta", "text": "..."}` format. OpenRouter requires converting from OpenAI's delta format; Anthropic and Bedrock emit natively.
- **Consecutive same-role merging** — The Anthropic API rejects consecutive messages with the same role. The frontend merges them before sending (particularly relevant for system feedback messages appended as `role: "user"`).
- **No subdirectories in web/** — ComfyUI only auto-loads JS from the root of `WEB_DIRECTORY`. Don't create subdirs for JS modules.
- **API keys in config** — Stored as plaintext in the config JSON file. The GET endpoint masks them (shows only last 4 chars). Never return full keys in API responses.
- **Adding new models** — Update the corresponding `*_MODELS` array in `extension.js`. For new providers, also add a streaming function in `server.py` that normalizes output to the same SSE format.

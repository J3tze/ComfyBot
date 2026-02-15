# ComfyUI AI Assistant

AI-powered sidebar extension for ComfyUI with chat, graph manipulation, error diagnosis, and prompt engineering. Supports **OpenRouter** (many models) and **Anthropic** (direct).

## Project Structure

```
comfyui-claude-assistant/
├── __init__.py          # ComfyUI entry point: exports WEB_DIRECTORY, NODE_CLASS_MAPPINGS
├── server.py            # aiohttp API routes on PromptServer + streaming to OpenRouter/Anthropic
├── web/
│   └── extension.js     # Frontend: sidebar tab, chat UI, graph actions, node context (CSS inlined)
├── requirements.txt     # Python deps (anthropic SDK)
├── README.md            # GitHub readme
└── CLAUDE.md
```

## Features

1. **Chat with AI** — streaming responses, markdown rendering, workflow context
2. **Graph manipulation** — AI outputs `comfyui-actions` code blocks → parsed into "Apply" cards → executes LiteGraph API
3. **Quick actions** — "Analyze", "Optimize", "Improve Prompts", "Fix Error" preset buttons
4. **Error capture** — hooks `api.addEventListener("execution_error")` → shows "Fix Error" button with traceback
5. **Node context** — polls `app.canvas.selected_nodes` every 500ms → shows "Ask about this node" bar
6. **Prompt helper** — extracts CLIPTextEncode widget values → sends to AI for SD prompt improvement

## Architecture

- **No custom nodes** — sidebar-only extension (`NODE_CLASS_MAPPINGS = {}`)
- **Server** (`server.py`): Routes on `PromptServer.instance.routes`. Two streaming backends:
  - `stream_openrouter()` — raw aiohttp ClientSession to OpenRouter's OpenAI-compatible API
  - `stream_anthropic()` — AsyncAnthropic SDK
  - Both normalize to same SSE format: `data: {"type": "text_delta", "text": "..."}`
- **Frontend** (`web/extension.js`): Single file, CSS inlined. Key sections:
  - Graph action executor — `executeGraphAction()` wraps LiteGraph API (add/remove/connect/set_widget)
  - Markdown renderer — detects `comfyui-actions` code blocks → renders interactive action cards
  - Chat UI builder — assembles all panels, handles streaming, delegates events
- **Config persistence**: `/workspace/.claude-assistant-config.json` (RunPod) or `~/.claude-assistant-config.json`

## Graph Manipulation Format

The system prompt teaches the AI to output:
````
```comfyui-actions
[
  {"action": "add_node", "type": "KSampler", "pos": [500, 300], "widgets": {"steps": 30}},
  {"action": "connect", "from_node": 4, "from_slot": "MODEL", "to_node": 3, "to_slot": "model"},
  {"action": "set_widget", "node_id": 3, "name": "seed", "value": 42},
  {"action": "remove_node", "node_id": 7},
  {"action": "disconnect", "node_id": 5, "slot": "model"}
]
```
````
The frontend parses these after streaming completes, renders an action card with "Apply" button, and executes via LiteGraph API. Slot references support both names and indices.

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/claude-assistant/chat/stream` | Stream chat response (SSE) |
| GET | `/claude-assistant/config` | Get config (masked API keys) |
| POST | `/claude-assistant/config` | Save provider / API keys / model |

## Key JS APIs Used

- `app.graph.serialize()` — get workflow JSON for context
- `LiteGraph.createNode(type)` / `app.graph.add(node)` — add nodes
- `node.connect(outSlot, targetNode, inSlot)` — connect nodes
- `app.graph.getNodeById(id)` — find nodes
- `app.graph.setDirtyCanvas(true, true)` — force canvas re-render after changes
- `app.canvas.selected_nodes` — track node selection
- `api.addEventListener("execution_error", ...)` — capture errors
- `app.extensionManager.registerSidebarTab(...)` — register the sidebar

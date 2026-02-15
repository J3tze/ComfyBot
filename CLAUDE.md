# ComfyBot

AI-powered sidebar extension for ComfyUI with chat, graph manipulation, vision, error diagnosis, and prompt engineering. Supports **OpenRouter** (many models) and **Anthropic** (direct).

## Project Structure

```
comfyui-claude-assistant/
├── __init__.py          # ComfyUI entry point: exports WEB_DIRECTORY, NODE_CLASS_MAPPINGS
├── server.py            # aiohttp API routes on PromptServer + streaming to OpenRouter/Anthropic
├── web/
│   └── extension.js     # Frontend: sidebar tab, chat UI, graph actions, vision, node context (CSS inlined)
├── requirements.txt     # Python deps (anthropic SDK)
├── README.md            # GitHub readme
└── CLAUDE.md
```

## Features

1. **Chat with AI** — streaming responses, markdown rendering, workflow context
2. **Graph manipulation** — AI outputs `comfyui-actions` code blocks → parsed into "Apply" cards → executes LiteGraph API
3. **Vision** — capture execution output images, send to AI for analysis (supports both Anthropic and OpenRouter image formats)
4. **Quick actions** — "Analyze", "Optimize", "Improve Prompts", "Analyze Output", "Fix Error" preset buttons
5. **Error capture** — hooks `api.addEventListener("execution_error")` → shows "Fix Error" button with traceback
6. **Node context** — polls `app.canvas.selected_nodes` every 500ms → shows "Ask about this node" bar
7. **Prompt helper** — extracts CLIPTextEncode widget values → sends to AI for SD prompt improvement
8. **Installed models awareness** — backend reads `folder_paths` to list installed checkpoints, LoRAs, VAEs, etc. and includes them in the system prompt
9. **State persistence** — conversation history, settings, and streaming state survive sidebar tab switches (module-scoped STATE object)

## Architecture

- **No custom nodes** — sidebar-only extension (`NODE_CLASS_MAPPINGS = {}`)
- **Server** (`server.py`): Routes on `PromptServer.instance.routes`. Two streaming backends:
  - `stream_openrouter()` — raw aiohttp ClientSession to OpenRouter's OpenAI-compatible API
  - `stream_anthropic()` — AsyncAnthropic SDK
  - Both normalize to same SSE format: `data: {"type": "text_delta", "text": "..."}`
  - `convert_messages_for_anthropic()` / `convert_messages_for_openrouter()` — handle image content in messages
  - `get_installed_models()` — reads `folder_paths` for installed model lists
  - `build_system_with_workflow()` — combines system prompt + workflow JSON + installed models
- **Frontend** (`web/extension.js`): Single file, CSS inlined. Key sections:
  - **Persistent STATE** — module-scoped object holding conversationHistory, streaming state, actionStore, lastOutputImages, pendingImages. Survives `render(el)` being called again on tab switch.
  - **DOM refs** — module-scoped `DOM` object updated on each `buildChatUI()` call, so async streaming code can write to the latest DOM elements.
  - **Graph action executor** — `executeGraphAction()` wraps LiteGraph API (add/remove/connect/set_widget)
  - **Markdown renderer** — detects `comfyui-actions` code blocks → renders interactive action cards
  - **Image helpers** — `fetchImageAsBase64()` fetches from ComfyUI `/view` endpoint, `updateImagePreview()` manages attachment UI
  - **Global listeners** — registered once via `registerGlobalListeners()` for execution_error and executed events
  - **Chat UI builder** — assembles all panels, rebuilds from STATE on tab switch, handles streaming
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
The frontend parses these after streaming completes, renders an action card with "Apply" button, and executes via LiteGraph API. Slot references support both names and indices. Applied actions are tracked in STATE.conversationHistory entries and visually persist across tab switches.

## Vision / Image Flow

1. ComfyUI executes workflow → `executed` event fires → `STATE.lastOutputImages` updated with filenames
2. User clicks "Analyze Output" quick action or image attach button → images fetched from `/view` endpoint → converted to base64
3. Images sent to backend as `{base64, media_type}` in the `images` field of message objects
4. Backend converts: Anthropic format (image content blocks) or OpenRouter format (image_url with data URI)
5. AI analyzes the image and responds with feedback

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/claude-assistant/chat/stream` | Stream chat response (SSE), supports image messages |
| GET | `/claude-assistant/config` | Get config (masked API keys) |
| POST | `/claude-assistant/config` | Save provider / API keys / model |
| GET | `/claude-assistant/installed-models` | Get installed checkpoints, LoRAs, VAEs, etc. |

## Key JS APIs Used

- `app.graph.serialize()` — get workflow JSON for context
- `LiteGraph.createNode(type)` / `app.graph.add(node)` — add nodes
- `node.connect(outSlot, targetNode, inSlot)` — connect nodes
- `app.graph.getNodeById(id)` — find nodes
- `app.graph.setDirtyCanvas(true, true)` — force canvas re-render after changes
- `app.canvas.selected_nodes` — track node selection
- `api.addEventListener("execution_error", ...)` — capture errors
- `api.addEventListener("executed", ...)` — capture output images
- `app.extensionManager.registerSidebarTab(...)` — register the sidebar
- `/view?filename=...&type=output` — fetch generated images for vision

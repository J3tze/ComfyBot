# ComfyUI Claude Assistant

An AI-powered sidebar extension for ComfyUI that provides a chat assistant for workflow help, prompt engineering, and graph understanding. Supports **OpenRouter** (many models) and **Anthropic** (direct) as providers.

## Project Structure

```
comfyui-claude-assistant/
├── __init__.py          # ComfyUI entry point: exports WEB_DIRECTORY, NODE_CLASS_MAPPINGS
├── server.py            # aiohttp API routes registered on PromptServer.instance.routes
├── web/
│   └── extension.js     # Frontend: sidebar tab registration + chat UI (CSS inlined)
├── requirements.txt     # Python deps (anthropic SDK)
├── config.json          # Runtime-generated: stores API keys, provider, model preference
└── CLAUDE.md
```

## Architecture

- **No custom nodes** — this is a sidebar-only extension (`NODE_CLASS_MAPPINGS = {}`)
- **Two providers**:
  - **OpenRouter** (default): OpenAI-compatible API at `openrouter.ai/api/v1`. Supports Claude, GPT, Gemini, DeepSeek, Llama, etc. Uses raw aiohttp `ClientSession` for streaming — no extra SDK needed.
  - **Anthropic** (direct): Uses `AsyncAnthropic` SDK for native streaming.
- **Server**: `server.py` registers routes on ComfyUI's aiohttp `PromptServer`. Provider-specific streaming is handled by `stream_anthropic()` and `stream_openrouter()` functions.
- **Frontend**: `web/extension.js` is auto-loaded by ComfyUI (via `WEB_DIRECTORY = "./web"`). Registers a sidebar tab using `app.extensionManager.registerSidebarTab()`.
- **Communication**: Frontend POSTs to `/claude-assistant/chat/stream` → server normalizes both providers into the same SSE format (`text_delta` chunks) back to the browser.

## Key Patterns

- **Route registration**: Decorate async functions with `@PromptServer.instance.routes.post("/path")` at module level in `server.py`. They're auto-registered when `__init__.py` does `from .server import *`.
- **Sidebar tab**: Use `app.extensionManager.registerSidebarTab({ id, icon, title, type: "custom", render: (el) => {} })` inside `setup()` hook.
- **JS auto-loading**: Only `.js` files directly in the `WEB_DIRECTORY` folder are loaded (no recursion into subdirectories).
- **CSS**: Inlined in JS since only `.js` files are auto-loaded. External CSS would need manual `<link>` injection.
- **ComfyUI CSS vars**: Use `--comfy-input-bg`, `--comfy-menu-bg`, `--border-color`, `--fg-color`, `--input-text`, `--p-primary-color` for theme consistency.

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/claude-assistant/chat/stream` | Stream chat response (SSE) |
| GET | `/claude-assistant/config` | Get config (masked API keys) |
| POST | `/claude-assistant/config` | Save provider / API keys / model |

## Provider Details

### OpenRouter (default)
- Base URL: `https://openrouter.ai/api/v1/chat/completions`
- Auth: `Authorization: Bearer sk-or-...`
- SSE format: `data: {"choices":[{"delta":{"content":"text"}}]}` → normalized to `text_delta`
- System prompt goes in messages array as `{"role": "system", ...}`
- Sends `HTTP-Referer` and `X-Title` headers per OpenRouter guidelines
- Model IDs use `provider/model` format (e.g. `anthropic/claude-sonnet-4.5`)

### Anthropic (direct)
- Uses `anthropic` Python SDK with `AsyncAnthropic`
- System prompt is a separate `system` parameter (not in messages)
- Model IDs are Anthropic format (e.g. `claude-sonnet-4-5-20250929`)

## Config

- Stored in `config.json` (runtime-generated, should be gitignored)
- Fields: `provider`, `openrouter_api_key`, `anthropic_api_key`, `model`
- API key resolution: request body → config.json → environment variable (`OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY`)

## Development Notes

- Workflow JSON from `app.graph.serialize()` is sent as context when "Include workflow" is checked
- Large workflows (>50KB) are truncated server-side to avoid context limit issues
- The streaming uses aiohttp `StreamResponse` with SSE format (`data: {...}\n\n`)
- JS import path: `import { app } from "../../scripts/app.js"` — relative to the served extension path
- The `anthropic` SDK import is deferred (only imported when Anthropic provider is used)

# ComfyBot - AI Assistant for ComfyUI

An AI-powered sidebar extension for ComfyUI that lets you chat with Claude (or other models via OpenRouter) directly inside your workflow editor. Ask questions, get workflow advice, analyze outputs, and let the AI modify your graph.

![ComfyUI Sidebar](https://img.shields.io/badge/ComfyUI-Sidebar_Extension-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Chat with AI about your workflow
Send your current workflow as context and get intelligent advice about your node setup, connections, and parameters. The AI automatically knows your installed checkpoints, LoRAs, VAEs, and other models.

### Vision - Analyze Generated Images
Send your generated outputs to the AI for analysis. Get feedback on composition, quality, artifacts, and specific suggestions for improving your workflow and prompts. Click "Analyze Output" or attach images manually.

### Graph Manipulation
Ask the AI to modify your workflow directly. It outputs structured actions that you can review and apply with one click:
- Add, remove, and connect nodes
- Change widget values (steps, cfg, seed, etc.)
- All changes are previewed before applying

### Quick Actions
One-click preset prompts above the chat input:
- **Analyze** - Get a step-by-step explanation of your workflow
- **Optimize** - Suggestions for improving quality or speed
- **Improve Prompts** - AI-powered prompt engineering for your CLIPTextEncode nodes
- **Analyze Output** - Send the last generated image to the AI for feedback
- **Fix Error** - Appears automatically when an execution error occurs, sends the full traceback to the AI

### Node Context
Click any node on the canvas and a context bar appears in the sidebar. Hit "Ask about this node" to get a detailed explanation of what it does and its current settings.

### Error Diagnosis
Automatically captures ComfyUI execution errors. When something fails, click "Fix Error" to send the full error details + your workflow to the AI for diagnosis.

### Installed Models Awareness
The AI automatically knows about your installed checkpoints, LoRAs, VAEs, upscale models, ControlNets, and embeddings. It will only suggest models you actually have installed.

### Multi-Provider Support
- **OpenRouter** (default) - Access Claude, GPT-4o, Gemini, DeepSeek, Llama, and more with one API key
- **Anthropic** (direct) - Use Claude directly with an Anthropic API key

## Installation

### Option 1: Git clone (recommended)
```bash
cd /path/to/ComfyUI/custom_nodes
git clone https://github.com/J3tze/comfyui-claude-assistant.git
pip install -r comfyui-claude-assistant/requirements.txt
```

### Option 2: Manual
Download this repository and place it in your `ComfyUI/custom_nodes/` directory.

Then restart ComfyUI.

## Setup

1. Open ComfyUI
2. Click the chat bubble icon in the left sidebar
3. Click the gear icon to open settings
4. Choose your provider (OpenRouter or Anthropic)
5. Enter your API key
6. Select a model
7. Click Save

### Getting an API Key

**OpenRouter** (recommended - supports many models):
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Create an account and generate an API key
3. Add credits (pay-per-use)

**Anthropic** (direct Claude access):
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and generate an API key
3. Add credits (pay-per-use)

## Configuration

Settings are stored in a config file that persists across restarts:
- On RunPod: `/workspace/.claude-assistant-config.json`
- Elsewhere: `~/.claude-assistant-config.json`
- Fallback: `config.json` in the extension directory

Your API key, selected model, and provider preference all persist automatically.

## Supported Models

### Via OpenRouter
| Model | ID |
|-------|-----|
| Claude Sonnet 4.5 | `anthropic/claude-sonnet-4.5` |
| Claude Haiku 4.5 | `anthropic/claude-haiku-4.5` |
| Claude Opus 4 | `anthropic/claude-opus-4` |
| GPT-4o | `openai/gpt-4o` |
| Gemini 2.5 Pro | `google/gemini-2.5-pro` |
| DeepSeek V3 | `deepseek/deepseek-chat-v3-0324` |
| Llama 4 Maverick | `meta-llama/llama-4-maverick` |

### Via Anthropic (direct)
| Model | ID |
|-------|-----|
| Claude Sonnet 4.5 | `claude-sonnet-4-5-20250929` |
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` |
| Claude Opus 4.6 | `claude-opus-4-6` |

## How It Works

- **Frontend** (`web/extension.js`): Registers a sidebar tab via ComfyUI's extension API. Handles the chat UI, streaming responses, graph manipulation, vision, and node context tracking.
- **Backend** (`server.py`): Registers API routes on ComfyUI's aiohttp server. Proxies requests to OpenRouter or Anthropic with streaming SSE responses. Provides installed model lists and handles image message conversion.
- **No custom nodes** - this is a pure sidebar extension.

## License

MIT

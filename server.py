"""ComfyUI Claude Assistant - Server-side API routes."""

import os
import json
import asyncio
from pathlib import Path

import aiohttp as aiohttp_client
from server import PromptServer
from aiohttp import web

routes = PromptServer.instance.routes

# Configuration
CONFIG_DIR = Path(__file__).parent
CONFIG_FILE = CONFIG_DIR / "config.json"

OPENROUTER_BASE = "https://openrouter.ai/api/v1"

SYSTEM_PROMPT = """You are an AI assistant embedded in ComfyUI as a sidebar helper. \
ComfyUI is a node-based visual programming interface for Stable Diffusion and other generative AI models.

Your role is to help users:
1. Understand their current workflow and what each node does
2. Suggest improvements or modifications to their workflows
3. Help with prompt engineering for image generation
4. Explain ComfyUI concepts and node types
5. Troubleshoot workflow issues

When the user shares their workflow graph, you'll receive it as JSON. Key node types include:
- CheckpointLoaderSimple: Loads a Stable Diffusion model checkpoint
- CLIPTextEncode: Encodes text prompts for conditioning
- KSampler/KSamplerAdvanced: The main sampling/generation node
- VAEDecode: Decodes latent images to pixel space
- EmptyLatentImage: Creates a blank latent for generation
- SaveImage/PreviewImage: Outputs the generated image
- LoraLoader: Loads LoRA fine-tuning weights
- ControlNet nodes: Apply structural guidance (OpenPose, Canny, Depth, etc.)
- IPAdapter: Image prompt adapter for style/composition transfer
- CLIP Vision: Encodes images for IP-Adapter or other vision models
- Upscale nodes: Latent or pixel-space upscaling

Each node in the workflow JSON has:
- An ID number
- A "class_type" (the node type)
- "inputs" with parameter values and connections to other nodes

When referring to nodes, use their type and ID (e.g. "KSampler (node #3)").
Keep responses concise and practical. Focus on actionable advice."""


def load_config():
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {}


def save_config(config):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)


def get_api_key(provider=None):
    config = load_config()
    p = provider or config.get("provider", "openrouter")
    if p == "anthropic":
        return config.get("anthropic_api_key") or os.environ.get("ANTHROPIC_API_KEY", "")
    else:
        return config.get("openrouter_api_key") or os.environ.get("OPENROUTER_API_KEY", "")


def get_model():
    config = load_config()
    return config.get("model", "anthropic/claude-sonnet-4.5")


def get_provider():
    config = load_config()
    return config.get("provider", "openrouter")


def build_system_with_workflow(workflow):
    """Append workflow JSON to the system prompt if provided."""
    system = SYSTEM_PROMPT
    if workflow:
        workflow_str = json.dumps(workflow, indent=2)
        if len(workflow_str) > 50000:
            workflow_str = workflow_str[:50000] + "\n... (truncated)"
        system += f"\n\nThe user's current ComfyUI workflow:\n```json\n{workflow_str}\n```"
    return system


async def stream_anthropic(response, api_key, model, messages, system):
    """Stream from the Anthropic API using the SDK."""
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=api_key)

    async with client.messages.stream(
        model=model,
        max_tokens=4096,
        messages=messages,
        system=system,
    ) as stream:
        async for text in stream.text_stream:
            event_data = json.dumps({"type": "text_delta", "text": text})
            await response.write(f"data: {event_data}\n\n".encode("utf-8"))
            await asyncio.sleep(0)

    await response.write(
        f"data: {json.dumps({'type': 'done'})}\n\n".encode("utf-8")
    )


async def stream_openrouter(response, api_key, model, messages, system):
    """Stream from OpenRouter (OpenAI-compatible API)."""
    # OpenAI format: system message goes in the messages array
    api_messages = [{"role": "system", "content": system}] + messages

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/comfyui-claude-assistant",
        "X-Title": "ComfyUI Claude Assistant",
    }

    payload = {
        "model": model,
        "messages": api_messages,
        "max_tokens": 4096,
        "stream": True,
    }

    async with aiohttp_client.ClientSession() as session:
        async with session.post(
            f"{OPENROUTER_BASE}/chat/completions",
            headers=headers,
            json=payload,
        ) as api_resp:
            if api_resp.status != 200:
                body = await api_resp.text()
                try:
                    err = json.loads(body)
                    error_msg = err.get("error", {}).get("message", body)
                except json.JSONDecodeError:
                    error_msg = body
                await response.write(
                    f"data: {json.dumps({'type': 'error', 'error': error_msg})}\n\n".encode("utf-8")
                )
                return

            # Parse SSE stream from OpenRouter
            buffer = ""
            async for chunk in api_resp.content.iter_any():
                buffer += chunk.decode("utf-8")
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line or not line.startswith("data: "):
                        continue
                    data_str = line[6:]
                    if data_str == "[DONE]":
                        break
                    try:
                        data = json.loads(data_str)
                        delta = data.get("choices", [{}])[0].get("delta", {})
                        content = delta.get("content")
                        if content:
                            event_data = json.dumps({"type": "text_delta", "text": content})
                            await response.write(f"data: {event_data}\n\n".encode("utf-8"))
                            await asyncio.sleep(0)
                    except json.JSONDecodeError:
                        continue

    await response.write(
        f"data: {json.dumps({'type': 'done'})}\n\n".encode("utf-8")
    )


@routes.post("/claude-assistant/chat/stream")
async def chat_stream(request):
    """Stream a chat response via Server-Sent Events."""
    data = await request.json()

    provider = data.get("provider") or get_provider()
    api_key = data.get("api_key") or get_api_key(provider)
    if not api_key:
        key_name = "ANTHROPIC_API_KEY" if provider == "anthropic" else "OPENROUTER_API_KEY"
        return web.json_response(
            {"error": f"No API key configured. Set {key_name} environment variable or configure it in the sidebar settings."},
            status=400,
        )

    messages = data.get("messages", [])
    workflow = data.get("workflow")
    model = data.get("model") or get_model()
    system = build_system_with_workflow(workflow)

    response = web.StreamResponse(
        status=200,
        headers={
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
    await response.prepare(request)

    try:
        if provider == "anthropic":
            await stream_anthropic(response, api_key, model, messages, system)
        else:
            await stream_openrouter(response, api_key, model, messages, system)
    except Exception as e:
        error_msg = str(e)
        if "authentication" in error_msg.lower() or "api key" in error_msg.lower():
            error_msg = f"Invalid API key. Please check your {provider} API key in settings."
        await response.write(
            f"data: {json.dumps({'type': 'error', 'error': error_msg})}\n\n".encode("utf-8")
        )

    await response.write_eof()
    return response


@routes.get("/claude-assistant/config")
async def get_config(request):
    """Get current configuration (masks API keys)."""
    config = load_config()
    provider = config.get("provider", "openrouter")

    anthropic_key = config.get("anthropic_api_key") or os.environ.get("ANTHROPIC_API_KEY", "")
    openrouter_key = config.get("openrouter_api_key") or os.environ.get("OPENROUTER_API_KEY", "")

    active_key = anthropic_key if provider == "anthropic" else openrouter_key

    return web.json_response({
        "provider": provider,
        "has_api_key": bool(active_key),
        "anthropic_key_preview": f"...{anthropic_key[-4:]}" if len(anthropic_key) > 4 else "",
        "openrouter_key_preview": f"...{openrouter_key[-4:]}" if len(openrouter_key) > 4 else "",
        "model": config.get("model", "anthropic/claude-sonnet-4.5"),
    })


@routes.post("/claude-assistant/config")
async def set_config(request):
    """Update configuration."""
    data = await request.json()
    config = load_config()

    for key in ("provider", "model", "anthropic_api_key", "openrouter_api_key"):
        if key in data:
            config[key] = data[key]

    save_config(config)
    return web.json_response({"status": "ok"})

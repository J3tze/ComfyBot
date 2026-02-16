"""ComfyBot - Server-side API routes."""

import os
import json
import asyncio
from pathlib import Path

import aiohttp as aiohttp_client
from server import PromptServer
from aiohttp import web

routes = PromptServer.instance.routes

# Configuration — store in a persistent location outside the extension dir
# so config survives git pulls / reinstalls. Falls back to extension dir.
def _config_path():
    # Prefer /workspace (RunPod volume) or home dir, then fall back to extension dir
    for d in ["/workspace", os.path.expanduser("~")]:
        p = Path(d)
        if p.is_dir():
            return p / ".claude-assistant-config.json"
    return Path(__file__).parent / "config.json"

CONFIG_FILE = _config_path()

OPENROUTER_BASE = "https://openrouter.ai/api/v1"

SYSTEM_PROMPT = """\
You are ComfyBot, an AI assistant embedded in ComfyUI as a sidebar helper. \
ComfyUI is a node-based visual programming interface for Stable Diffusion and other generative AI models.

Your role is to help users:
1. Understand their current workflow and what each node does
2. Modify workflows by adding, removing, and connecting nodes
3. Help with prompt engineering for image generation
4. Explain ComfyUI concepts and node types
5. Troubleshoot workflow and execution errors
6. Analyze generated images and suggest improvements

## Workflow JSON format
When the user shares their workflow, you receive it as JSON. Each node has:
- An ID number
- A "class_type" (the node type)
- "inputs" with parameter values and connections to other nodes
When referring to nodes, use their type and ID (e.g. "KSampler (node #3)").

## Graph manipulation
When the user asks you to modify their workflow, output a ```comfyui-actions code block \
containing a JSON array of actions. The frontend will parse these and show an "Apply" button.

Available actions:
- add_node: Add a node. Fields: type (required), id (reference id for connections), pos [x,y], title, widgets {name: value}
- remove_node: Remove a node. Fields: node_id
- connect: Connect output→input. Fields: from_node, from_slot (output name), to_node, to_slot (input name)
- disconnect: Disconnect an input. Fields: node_id, slot (input name)
- set_widget: Change a widget value. Fields: node_id, name, value

IMPORTANT - When adding new nodes, always include an "id" field with a unique reference number. \
Use these same reference numbers in connect/set_widget actions. The system will map them to actual node IDs. \
For existing nodes already in the workflow, use their real node IDs.

Always explain what you're changing before the action block. Use node IDs from the workflow JSON for existing nodes. \
For new nodes, choose a position near related nodes.

NOTE: set_widget works for standard ComfyUI widgets (dropdowns, numbers, text fields). \
For complex custom node widgets (e.g. rgthree Power Lora Loader lora lists, complex UI panels), \
set_widget may not work — tell the user to adjust those values manually and explain exactly what to change.

## Node types and their slots
Use EXACTLY these slot names when connecting nodes:

**CheckpointLoaderSimple** — Outputs: MODEL, CLIP, VAE | Widgets: ckpt_name
**LoraLoader** — Inputs: model, clip | Outputs: MODEL, CLIP | Widgets: lora_name, strength_model, strength_clip
**CLIPTextEncode** — Inputs: clip | Outputs: CONDITIONING | Widgets: text
**EmptyLatentImage** — Outputs: LATENT | Widgets: width, height, batch_size
**KSampler** — Inputs: model, positive, negative, latent_image | Outputs: LATENT | Widgets: seed, steps, cfg, sampler_name, scheduler, denoise
**KSamplerAdvanced** — Inputs: model, positive, negative, latent_image | Outputs: LATENT | Widgets: noise_seed, steps, cfg, sampler_name, scheduler, start_at_step, end_at_step, add_noise, return_with_leftover_noise
**VAEDecode** — Inputs: samples, vae | Outputs: IMAGE
**VAEEncode** — Inputs: pixels, vae | Outputs: LATENT
**SaveImage** — Inputs: images | Widgets: filename_prefix
**PreviewImage** — Inputs: images
**LoadImage** — Outputs: IMAGE, MASK | Widgets: image
**ImageScale** — Inputs: image | Outputs: IMAGE | Widgets: width, height, upscale_method, crop
**ImageUpscaleWithModel** — Inputs: upscale_model, image | Outputs: IMAGE
**UpscaleModelLoader** — Outputs: UPSCALE_MODEL | Widgets: model_name
**ControlNetLoader** — Outputs: CONTROL_NET | Widgets: control_net_name
**ControlNetApplyAdvanced** — Inputs: positive, negative, control_net, image | Outputs: positive (CONDITIONING), negative (CONDITIONING) | Widgets: strength, start_percent, end_percent
**ConditioningCombine** — Inputs: conditioning_1, conditioning_2 | Outputs: CONDITIONING
**LatentUpscale** — Inputs: samples | Outputs: LATENT | Widgets: upscale_method, width, height, crop
**LatentUpscaleBy** — Inputs: samples | Outputs: LATENT | Widgets: upscale_method, scale_by

## Example: Build a complete txt2img workflow from scratch
```comfyui-actions
[
  {"action": "add_node", "id": 1, "type": "CheckpointLoaderSimple", "pos": [100, 300]},
  {"action": "add_node", "id": 2, "type": "CLIPTextEncode", "pos": [400, 200], "title": "Positive Prompt", "widgets": {"text": "a beautiful landscape"}},
  {"action": "add_node", "id": 3, "type": "CLIPTextEncode", "pos": [400, 400], "title": "Negative Prompt", "widgets": {"text": "worst quality, low quality"}},
  {"action": "add_node", "id": 4, "type": "EmptyLatentImage", "pos": [400, 600], "widgets": {"width": 1024, "height": 1024}},
  {"action": "add_node", "id": 5, "type": "KSampler", "pos": [700, 300], "widgets": {"steps": 20, "cfg": 7, "denoise": 1}},
  {"action": "add_node", "id": 6, "type": "VAEDecode", "pos": [1000, 300]},
  {"action": "add_node", "id": 7, "type": "SaveImage", "pos": [1250, 300]},
  {"action": "connect", "from_node": 1, "from_slot": "CLIP", "to_node": 2, "to_slot": "clip"},
  {"action": "connect", "from_node": 1, "from_slot": "CLIP", "to_node": 3, "to_slot": "clip"},
  {"action": "connect", "from_node": 1, "from_slot": "MODEL", "to_node": 5, "to_slot": "model"},
  {"action": "connect", "from_node": 2, "from_slot": "CONDITIONING", "to_node": 5, "to_slot": "positive"},
  {"action": "connect", "from_node": 3, "from_slot": "CONDITIONING", "to_node": 5, "to_slot": "negative"},
  {"action": "connect", "from_node": 4, "from_slot": "LATENT", "to_node": 5, "to_slot": "latent_image"},
  {"action": "connect", "from_node": 5, "from_slot": "LATENT", "to_node": 6, "to_slot": "samples"},
  {"action": "connect", "from_node": 1, "from_slot": "VAE", "to_node": 6, "to_slot": "vae"},
  {"action": "connect", "from_node": 6, "from_slot": "IMAGE", "to_node": 7, "to_slot": "images"}
]
```

## Prompt engineering
When helping with Stable Diffusion prompts:
- Use comma-separated tags for SDXL/Pony models (e.g. "masterpiece, best quality, 1girl, long hair")
- Quality tags: masterpiece, best quality, high resolution, detailed
- Negative prompt essentials: worst quality, low quality, blurry, bad anatomy
- Be specific about composition, lighting, style, and subject details
- For Pony/Animagine models, include score tags: "score_9, score_8_up, score_7_up"

## Vision
When the user sends generated images, analyze them carefully. Comment on:
- Overall quality and composition
- Artifacts, distortions, or issues (hands, faces, text, etc.)
- How well the image matches the prompts in the workflow
- Specific suggestions for improving the workflow, prompts, or settings

## Installed models
When suggesting LoRAs, checkpoints, or other models, ONLY suggest ones from the user's installed \
models list (provided below). Do not suggest models the user doesn't have installed.

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
    elif p == "bedrock":
        # Bedrock uses AWS credentials, not a single API key
        return config.get("bedrock_access_key") or os.environ.get("AWS_ACCESS_KEY_ID", "")
    else:
        return config.get("openrouter_api_key") or os.environ.get("OPENROUTER_API_KEY", "")


def get_model():
    config = load_config()
    return config.get("model", "anthropic/claude-sonnet-4.5")


def get_provider():
    config = load_config()
    return config.get("provider", "openrouter")


def get_installed_models():
    """Get lists of installed models for context."""
    try:
        import folder_paths
        info = {}
        for category in ["checkpoints", "loras", "vae", "upscale_models", "controlnet", "embeddings"]:
            try:
                files = folder_paths.get_filename_list(category)
                if files:
                    info[category] = list(files)
            except Exception:
                pass
        return info
    except ImportError:
        return {}


def build_system_with_workflow(workflow):
    """Append workflow JSON and installed models to the system prompt."""
    system = SYSTEM_PROMPT
    if workflow:
        workflow_str = json.dumps(workflow, indent=2)
        if len(workflow_str) > 50000:
            workflow_str = workflow_str[:50000] + "\n... (truncated)"
        system += f"\n\nThe user's current ComfyUI workflow:\n```json\n{workflow_str}\n```"

    # Add installed models info
    models = get_installed_models()
    if models:
        system += "\n\n## Available installed models"
        for category, files in models.items():
            if files:
                shown = files[:50]
                system += f"\n**{category}** ({len(files)} total): "
                system += ", ".join(shown)
                if len(files) > 50:
                    system += f" ... and {len(files) - 50} more"

    return system


def convert_messages_for_anthropic(messages):
    """Convert messages with images to Anthropic format."""
    converted = []
    for msg in messages:
        if msg.get("images"):
            content = []
            for img in msg["images"]:
                content.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": img.get("media_type", "image/png"),
                        "data": img["base64"],
                    }
                })
            content.append({"type": "text", "text": msg.get("content", "")})
            converted.append({"role": msg["role"], "content": content})
        else:
            converted.append({"role": msg["role"], "content": msg.get("content", "")})
    return converted


def convert_messages_for_openrouter(messages):
    """Convert messages with images to OpenAI/OpenRouter format."""
    converted = []
    for msg in messages:
        if msg.get("images"):
            content = []
            for img in msg["images"]:
                media_type = img.get("media_type", "image/png")
                content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{media_type};base64,{img['base64']}"}
                })
            content.append({"type": "text", "text": msg.get("content", "")})
            converted.append({"role": msg["role"], "content": content})
        else:
            converted.append({"role": msg["role"], "content": msg.get("content", "")})
    return converted


async def stream_anthropic(response, api_key, model, messages, system):
    """Stream from the Anthropic API using the SDK."""
    import anthropic

    converted = convert_messages_for_anthropic(messages)
    client = anthropic.AsyncAnthropic(api_key=api_key)

    async with client.messages.stream(
        model=model,
        max_tokens=4096,
        messages=converted,
        system=system,
    ) as stream:
        async for text in stream.text_stream:
            event_data = json.dumps({"type": "text_delta", "text": text})
            await response.write(f"data: {event_data}\n\n".encode("utf-8"))
            await asyncio.sleep(0)

    await response.write(
        f"data: {json.dumps({'type': 'done'})}\n\n".encode("utf-8")
    )


async def stream_bedrock(response, model, messages, system, aws_access_key=None, aws_secret_key=None, aws_region=None):
    """Stream from AWS Bedrock using the Anthropic SDK."""
    import anthropic

    converted = convert_messages_for_anthropic(messages)
    client = anthropic.AsyncAnthropicBedrock(
        aws_access_key=aws_access_key or None,
        aws_secret_key=aws_secret_key or None,
        aws_region=aws_region or "us-east-1",
    )

    async with client.messages.stream(
        model=model,
        max_tokens=4096,
        messages=converted,
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
    converted = convert_messages_for_openrouter(messages)
    # OpenAI format: system message goes in the messages array
    api_messages = [{"role": "system", "content": system}] + converted

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/J3tze/comfyui-claude-assistant",
        "X-Title": "ComfyUI ComfyBot",
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
                    # Strip HTML error pages (e.g. Cloudflare 500 pages)
                    if "<html" in body.lower():
                        error_msg = f"OpenRouter returned HTTP {api_resp.status}. The service may be temporarily unavailable — try again."
                    else:
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
    config = load_config()

    # Bedrock uses AWS credentials instead of a single API key
    if provider == "bedrock":
        aws_access_key = config.get("bedrock_access_key") or os.environ.get("AWS_ACCESS_KEY_ID", "")
        aws_secret_key = config.get("bedrock_secret_key") or os.environ.get("AWS_SECRET_ACCESS_KEY", "")
        aws_region = config.get("bedrock_region") or os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
        if not aws_access_key and not os.environ.get("AWS_ACCESS_KEY_ID"):
            return web.json_response(
                {"error": "No AWS credentials configured. Set AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY environment variables or configure them in settings."},
                status=400,
            )
    else:
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
        elif provider == "bedrock":
            await stream_bedrock(response, model, messages, system, aws_access_key, aws_secret_key, aws_region)
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
    bedrock_access = config.get("bedrock_access_key") or os.environ.get("AWS_ACCESS_KEY_ID", "")
    bedrock_secret = config.get("bedrock_secret_key") or os.environ.get("AWS_SECRET_ACCESS_KEY", "")
    bedrock_region = config.get("bedrock_region") or os.environ.get("AWS_DEFAULT_REGION", "us-east-1")

    if provider == "bedrock":
        active_key = bedrock_access
    elif provider == "anthropic":
        active_key = anthropic_key
    else:
        active_key = openrouter_key

    return web.json_response({
        "provider": provider,
        "has_api_key": bool(active_key),
        "anthropic_key_preview": f"...{anthropic_key[-4:]}" if len(anthropic_key) > 4 else "",
        "openrouter_key_preview": f"...{openrouter_key[-4:]}" if len(openrouter_key) > 4 else "",
        "bedrock_access_preview": f"...{bedrock_access[-4:]}" if len(bedrock_access) > 4 else "",
        "bedrock_secret_preview": f"...{bedrock_secret[-4:]}" if len(bedrock_secret) > 4 else "",
        "bedrock_region": bedrock_region,
        "model": config.get("model", "anthropic/claude-sonnet-4.5"),
    })


@routes.post("/claude-assistant/config")
async def set_config(request):
    """Update configuration."""
    data = await request.json()
    config = load_config()

    for key in ("provider", "model", "anthropic_api_key", "openrouter_api_key",
                 "bedrock_access_key", "bedrock_secret_key", "bedrock_region"):
        if key in data:
            config[key] = data[key]

    save_config(config)
    return web.json_response({"status": "ok"})


@routes.get("/claude-assistant/installed-models")
async def get_installed_models_endpoint(request):
    """Return lists of installed models (checkpoints, loras, etc.)."""
    return web.json_response(get_installed_models())

# Goal-Based Auto-Iteration

## Problem
Users currently do manual loops: ask AI to change settings, click Apply, queue prompt, wait for result, send output back to AI, repeat. This is tedious for iterative refinement tasks like tuning lighting, fixing artifacts, or dialing in a style.

## Solution
A supervised auto-iteration mode where the AI proposes changes, applies them, queues a generation, waits for the result, and presents it for user review — repeating until the goal is met or the user stops.

## User Flow

1. User types a goal: *"make the lighting more dramatic and fix the hands"*
2. System enters **iteration mode**:
   - Graph snapshot taken (for "Revert all")
   - Goal banner shown at top
   - Max iteration budget: 5 (configurable)
3. Each cycle:
   - AI analyzes current workflow + last output (if any) against the goal
   - AI proposes `set_widget` changes via `comfyui-actions` — **auto-applied** (no manual Apply click)
   - `app.queuePrompt()` fires immediately after changes
   - Wait for `executed` event, capture output image
   - Show image in chat with **iteration control bar**:
     - Iteration counter: `2 / 5`
     - **Continue** button — AI analyzes output and decides next changes
     - **Feedback input** — inline text field for user corrections (e.g. "too dark, increase CFG")
     - **Stop** button — end iteration, keep current state
4. Iteration ends when: AI declares goal met, max iterations reached, user clicks Stop, or execution error occurs

## Iteration Control Bar

```
┌─────────────────────────────────────────────────────┐
│  Iteration 2/5 — Goal: "more dramatic lighting"     │
│  [Continue]  [_________________ Add feedback] [Stop] │
└─────────────────────────────────────────────────────┘
```

Shown below each output image during iteration mode. If user types feedback and clicks Continue, that feedback is included in the next AI prompt.

## What the AI Receives Each Round

Auto-generated system feedback message (role: user, `_isSystemFeedback: true`):
```
[ITERATION MODE - Round 2/5]
Goal: "make the lighting more dramatic and fix the hands"
User feedback: "colors are too saturated now"  (if any)
[attached: output image from this round]
Changes applied this round: steps: 20→25, cfg: 7→8.5, denoise: 0.8→0.85

Analyze the output. If the goal is met, say "GOAL_MET" and explain why.
Otherwise, propose set_widget changes to get closer to the goal.
```

## Scope of Changes

The AI may use `set_widget` on any node parameter during iteration. It may NOT add/remove/reconnect nodes — only tune existing widget values. This prevents breaking the graph topology during automated loops.

## Safety Rails

- **Max iterations**: default 5, shown in UI, user can adjust
- **Stop button**: always visible, immediately halts the loop
- **Revert all**: restores graph to pre-iteration state (single snapshot before iteration 1)
- **Error handling**: if `execution_error` fires, iteration stops and error is shown
- **Generation tracking**: `_chatGeneration` counter prevents stale iterations if user clears chat

## STATE Additions

```js
iterationMode: false,       // whether auto-iteration is active
iterationGoal: "",          // the user's stated goal
iterationCount: 0,          // current iteration number
iterationMax: 5,            // max iterations
iterationSnapshot: null,    // graph state before iteration 1
```

## Implementation Scope

### Frontend (extension.js)
- Iteration state machine: idle → proposing → queuing → waiting → reviewing → (loop or done)
- Auto-apply logic: when in iteration mode, apply actions without user clicking Apply
- Auto-queue: call `app.queuePrompt(0)` after applying actions
- Executed listener: capture output image, build iteration feedback message
- Iteration control bar UI: Continue/Feedback/Stop below each iteration output
- Goal banner at top of chat during iteration
- Revert all button

### Server (server.py)
- No changes needed. The iteration loop is entirely frontend-driven — it just sends normal chat requests with the iteration context injected into the messages.

### System Prompt
- Add iteration mode instructions to `SYSTEM_PROMPT`: when in iteration mode, respond with only `set_widget` actions, and say "GOAL_MET" when done.

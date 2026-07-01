## Overview
Standing Orders is a squad autobattler where you never micro a unit. Instead you write each crew member a short directive in plain English, then watch a small language model interpret it tick-by-tick as your crew delves a Lethal-Company-style facility. For programmers who love Gladiabots and anyone who's watched an AI agent confidently misread its instructions.

## Problem
Agent meta-harnesses (omnigent, hermes-agent) promise autonomy, but ambiguity bites — a vague instruction produces confident nonsense. Turn the felt cost of an underspecified prompt into the whole game.

## How it works
Before a run you write each crew member standing orders: "grab the loot, retreat if HP under 30%, never split up." You cannot intervene mid-mission. Every tick, the model reads that agent's directive plus current state and picks one action from a fixed verb set (move, grab, heal, flee, revive, wait). Contradictory or ambiguous orders create emergent, often lethal, behavior. Between runs you rewrite your prose. Loot buys gear; the real progression is *your prompting*.

## Technical approach
TypeScript game loop over a grid facility with fog, hazards, loot, and a stalking monster. Each tick, serialize compact state to JSON and prompt a small model (a Leanstral/RWKV-class local model, or a hosted small model) constrained to emit a single JSON action. A typia-style runtime validator rejects malformed output — on invalid JSON the agent "hesitates" (a legible failure). Determinism via fixed seed and temperature 0 where possible, plus caching identical `(state, directive)` prompts. The hard part is keeping per-tick latency and cost sane — batch all agents into one call, and only re-prompt when state changes materially — while keeping failures *readable* so the player actually learns why their crew died.

## v1 scope
- 3 crew, one 8×8 facility, one monster
- 6-verb action set, strict JSON schema
- One batched model call per tick, seeded RNG
- Win = extract with loot

## Out of scope
- Multiplayer, procedural campaigns
- Model fine-tuning, voice orders

## Risks & unknowns
Per-tick LLM latency/cost is the existential risk; a deterministic rules-engine fallback is mandatory. Nondeterminism can frustrate — cache hard and pin temperature.

## Done means
Rewording a single directive from vague to precise measurably raises extraction rate across 10 seeded runs.

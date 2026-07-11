## Overview
Iron Out is a cooperative, real-time party game for 3–5 people sharing a host screen (TV/laptop) with a phone each. The host shows one garbled, high-perplexity sentence — grammatical noise the room must "iron smooth." Each phone privately owns a disjoint handful of the sentence's word-slots and can edit only those. It's for word-nerd friend groups who love Keep Talking and Nobody Explodes-style blind coordination.

## Problem
Almost every perplexity game is solo score-chasing. Nothing makes a tiny language model's sense of "smoothness" a thing a whole room has to steer together, live, while unable to see each other's work.

## How it works
The host shows a 10–14 word sentence seeded to score terribly (words shuffled, some swapped for odd synonyms), plus a big thermometer of the sentence's current perplexity and a target line near the bottom. Slots are dealt disjointly: player A owns words 1,4,7; B owns 2,5,9; and so on. Each phone PRIVATELY shows only its own slots as editable boxes plus the shared thermometer — never anyone else's words. As players type, the host re-scores and the single shared meter drops or spikes. The room has 75 seconds to push perplexity under the target line and hold it for 3 seconds. You coordinate blind: you feel the meter move when a teammate helps or hurts, but you can't see what they wrote, so you tune your slots to fit words you can only infer. Win = everyone banks the round.

Privacy is load-bearing: because no phone sees the others' current slot text, the ONLY shared channel is the aggregate perplexity meter — that's the entire game. On one passed-around phone it collapses into a trivial single-editor puzzle.

## Technical approach
The host tab runs distilgpt2 via transformers.js in a Web Worker; perplexity = exp(mean token NLL) over the assembled sentence. An authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve) holds room state: `{ sentence: Token[], slotOwners: Map<slotIdx,playerId>, edits: Map<slotIdx,string>, targetPPL, timer }`. Phones send `{slotIdx, text}` deltas; the server merges into the canonical sentence and broadcasts a version number. The host is sole scorer: on each broadcast (debounced ~250ms) it recomputes perplexity and pushes the meter to all clients. Genuinely hard part: real-time fairness under concurrent edits plus model latency — a forward pass is tens of ms but keystroke bursts queue. Mitigation: coalesce edits per tick, score at a fixed 4 Hz, and always score the latest canonical version so the meter never rewards stale text.

## v1 scope
- One fixed garbled sentence, one target line.
- 3–5 players, disjoint slots auto-dealt.
- Live shared thermometer, 75s timer, 3s hold-to-win.
- Host-side model in one Web Worker, no persistence.

## Out of scope
- Multiple rounds, difficulty ramp, streak scoring.
- Semantic checks that the sentence "means" anything.
- Reconnect handling, spectators, phone-side inference.

## Risks & unknowns
- Model latency under keystroke bursts making the meter feel laggy.
- Whether blind coordination reads as fun or just frustrating — target-line tuning is everything.
- Degenerate wins by dumping high-frequency filler; may need a per-slot repeat penalty.

## Done means
5 phones join, each edits only its slots, the shared thermometer moves within 300ms of a keystroke, and a room can drive one seeded sentence under the target and hold 3s to trigger the win screen.

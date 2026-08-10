## Overview

A 3–6 player writing game for a TV and a pile of phones. One paragraph grows on the shared screen. Each player privately holds one **payload word** and is trying to make that word *cheap* — low-surprisal — under a small in-browser LLM by the time they play it. The scoring engine is literally the model's negative log-probability of your word given the paragraph so far.

## Problem

Every "AI party game" uses the model as a judge of vibes: it reads your answer and picks a winner, which is arbitrary and unfalsifiable. Nobody has made the model's *probability distribution* the actual currency. Surprisal is a hard number, computed locally, that players can feel themselves moving.

## How it works

1. Host screen shows a seed sentence ("The inspector arrived on a Tuesday.") and the turn order.
2. Each phone privately receives a payload word — `kerosene`, `notary`, `vole`, `alimony` — drawn from a fixed pool. Nobody sees anyone else's.
3. On your turn you type a clause (≤12 words) which is appended to the paragraph on the TV, visible to all. You are steering shared context toward your word.
4. Instead of writing, you may **play** your payload. The host scores mean per-token surprisal of ` <word>` conditioned on the whole paragraph. 12+ bits = 0 points; under 3 bits ≈ maximum. The word and its bit cost go public.
5. Each phone has **2 private checks**: tap to see your word's current surprisal *right now*, without playing. The host screen shows only that you checked, never the number or the word.

The tension is the whole game: a setup obvious enough for a 0.5B model ("he poured something flammable across the—") is also obvious to the four humans, who will spend their next clauses dragging the paragraph somewhere else. You need prose that is legible to the model and opaque to the room.

**Private per phone:** payload word, checks remaining, live bit readout. **Shared:** paragraph, turn order, played words with their bit costs.

## Technical approach

Host browser tab runs Qwen2.5-0.5B-Instruct (ONNX q4) via transformers.js on WebGPU and is the only scorer. Phones are dumb PWA controllers. PartyKit Durable Object holds authoritative state: `Room { paragraph: string[], turn: int, players: [{id, name, payload, checksLeft, played, bits}] }`. Payloads never leave the DO except to their owner's socket. Scoring: host requests a forward pass over `paragraph + " " + word`, sums `-log2 p` over the payload's tokens, divides by token count, posts `{playerId, bits}` back; the DO records it. The server trusts the host tab, which is fine on a LAN.

Hard parts: one scoring pass is 200–600ms on WebGPU and must not stall turn flow, so checks are queued and answered async; tokenizer edges matter (score with a leading space, fixed casing) or bits jump by 3 for cosmetic reasons.

## v1 scope

- 4 players, 1 round, 6 turns, then everyone must play
- 20-word fixed payload pool, one seed sentence
- 2 checks each; single scoring formula, no bonuses
- Leaderboard is a plain list of names and bits

## Out of scope

Multiple rounds, custom seeds, avatars, model choice, spectators, rejoin-after-disconnect.

## Risks & unknowns

A 0.5B model may be too flat — if everyone lands at 6 bits the game has no gradient; needs calibration on the pool before locking it. WASM fallback (no WebGPU) is 5–10× slower and may make checks unusable. Phone typing is slow; the 12-word cap is load-bearing.

## Done means

Four phones join by QR, a round completes on a TV, and each final bit score matches a Python reference implementation of the same surprisal calculation to within 0.1 bits.

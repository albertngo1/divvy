## Overview

A 4-player elimination word game where a tiny in-browser language model is the executioner. The TV shows five anonymous sentences-in-progress ("beams") labelled A–E. Four of them secretly belong to a player; one is an ownerless decoy. Every tick, the beam with the worst per-token surprisal is crossed out and its owner is knocked out. Everyone feeds words to every beam. Nobody knows whose is whose.

For groups who like Werewolf's paranoia but want a game where the accusation is made of *evidence you generated yourself*.

## Problem

"Write something funny, everyone votes" games score taste. This one scores a number nobody can argue with — and the fun is that the number is public while the *stake* in it is private. Protecting the thing you love is the tell.

## How it works

1. Host loads five one-line story openers as beams. Server privately assigns one to each phone; the fifth is unowned.
2. **Tick (25s).** Each phone privately submits one word or 2-word phrase plus a target beam letter. Submissions are simultaneous and secret.
3. Host appends all submissions (random order within a beam), then scores every beam: mean per-token surprisal in bits of the whole text under the model. TV animates five bars.
4. Worst beam is **culled** — struck through, greyed. Its owner is revealed only at the very end; eliminated players keep submitting words as ghosts.
5. Three ticks, three culls, two beams left. Owner of the best surviving beam wins. Full ownership map revealed.

**Phone shows privately:** your beam letter; one *quote* per tick — type a candidate word, target a beam, see the exact bits it would add, once, then it's spent. **TV shows publicly:** all five texts, all five bars, the cull, and a per-beam anonymous word count ("C took 2 words this tick") — volume without authorship.

The squeeze: a fluent, safe word saves your beam and paints a target on it. A poison word may land on the decoy and waste your only move.

## Technical approach

Host browser tab runs `transformers.js` with distilgpt2 (or Qwen2.5-0.5B ONNX q4) on WebGPU with WASM fallback; it is the only model instance. PartyKit Durable Object is authoritative: `{beams: [{id, text, tokens, bits, owner|null, alive}], phones: [{id, beamId, quoteUsed}], tick}`.

Sync: server runs the tick clock and barriers on 4 submissions or timeout, then asks the host to score; host returns bits per beam; server broadcasts the cull. Private quotes are request/response on the owning socket only — the server must never fan them out, and the TV shows only a used-quote count.

Hard part: the host tab is a single-point scoring oracle. Backgrounded tabs get throttled, so the server needs a heartbeat and a "scoring stalled" banner rather than a silently frozen round. Tokenization must be pinned server-side so bits are reproducible across re-scores.

## v1 scope

- Exactly 4 phones + 5 beams, one game, three ticks.
- One hardcoded opener set. No lobby art, no avatars.
- One quote per phone per tick, no carryover.
- Winner screen = final bars plus ownership reveal.

## Out of scope

Multiple rounds, scoring history, spectators, phrase-length rules, model choice, rejoin-on-refresh.

## Risks & unknowns

Distilgpt2 may rank fluent-but-boring above funny, flattening the humor. Culling the decoy early wastes a tick. Mean surprisal punishes long beams unevenly — may need length normalization tuning. 25s may be too tight to both quote and submit.

## Done means

Four phones join a room; after three ticks exactly three beams are struck through, the TV reveals four owners, and a fifth beam is shown as unowned. No phone ever receives another phone's quote or beam assignment in its WebSocket log.

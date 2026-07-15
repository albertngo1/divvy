## Overview
Strike is a 3-6 player concurrent-room party game (shared TV + private phone controllers) built on subtraction: everyone starts from the *same* awkward sentence and races to **delete** words to minimize a tiny LLM's perplexity, without touching the words the host pinned. For people who've built enough low-perplexity sentences from scratch and want the sculptural pleasure of carving one down instead.

## Problem
Every perplexity word game is additive — assemble tiles, write a line, engineer a prefix. Nobody's mined the opposite pleasure: a redaction puzzle where *less is more* and the fun is finding which connective tissue to cut so what remains reads clean. The itch is editorial, not generative.

## How it works
The host TV shows one long, deliberately clumsy, high-perplexity sentence with several words highlighted as PINNED (must remain, in order). Each phone PRIVATELY shows the same sentence rendered as tappable tokens; tapping a deletable word strikes it, and a private live perplexity meter updates as the player toggles strikes on and off. A 60s timer runs. The goal: lowest final perplexity for a surviving sentence that keeps every pinned word and stays above a minimum length. The host TV shows only the base sentence, the countdown, and anonymized live rank bars — never anyone's actual edits. At time-out the host reveals each player's trimmed sentence with its authoritative perplexity.

Private per phone: your specific strike-set and your live meter. Shared: base sentence, pins, timer, rank bars.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). For a responsive per-tap meter without hammering the host, each phone computes perplexity *locally* via transformers.js distilgpt2 (WASM, service-worker cached) — advisory only. At submit, the host recomputes every sentence on its single authoritative model instance to prevent device drift or cheating. Data model: `base{tokens[], pinnedIdx[]}`, `players{pid:{struckSet}}`. Sync: toggles stay local; only the final `struckSet` is sent. Hard part: shipping a ~tens-of-MB model to phones and reconciling phone-local vs host perplexity — host is authority, phone meter is a hint.

## v1 scope
- One base sentence with pinned words, 3-6 players
- 60s timer, phone-local live meter, host-authoritative final scoring
- Must keep all pinned words in order, minimum 5 surviving words
- Anonymized live rank bars + reveal

## Out of scope
- Multiple rounds / cumulative scoring
- Semantic-preservation check beyond pinned words
- Adding or reordering words; phone-side authoritative scoring

## Risks & unknowns
Degenerate strategy: deleting down to just the pinned words might already minimize perplexity — mitigate by choosing pins that read awkwardly together, forcing real connective sculpting, plus the min-length floor. Old phones may load the model slowly. transformers.js host/phone consistency needs a tolerance band.

## Done means
Base sentence + pins appear on the TV, four phones each strike independently with moving live meters, and at 60s the host authoritatively scores four trimmed sentences, ranks them, and crowns the lowest perplexity — under three minutes total.

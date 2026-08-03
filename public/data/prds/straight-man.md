## Overview
Four players, four secret punchlines, one shared setup. Each phone privately holds an absurd sentence it must make *unsurprising*. Everyone writes a setup line simultaneously; a small in-browser LLM picks which single setup the room will actually use, then scores every secret punchline under it. You want your line cheap and everyone else's expensive — under a setup you may not even have written.

## Problem
"Write something funny, vote on it" games are solved and social-pressure-driven. This replaces the vote with a mechanical, blind commons: the setup that best serves the *whole* room wins the floor, which is exactly the setup that helps your rivals. The itch is a genuine simultaneous-decision tension that a single passed-around phone cannot produce.

## How it works
1. **Deal (private).** Each phone shows one punchline card, e.g. *"…so I kept the receipt in my mouth."* Eight hardcoded cards, four dealt, no overlap. Nobody sees any other punchline.
2. **Write (private, simultaneous, 90s).** Each phone writes a setup ≤12 words. As you type, your phone shows a single private dial — **how cold your own punchline runs** under your current draft (mean per-token surprisal, inverted into a 0–100 "warmth"). You get zero signal about the other three targets.
3. **The floor (host screen).** All four setups are revealed at once. The host scores all 4×4 pairs. The setup with the lowest *mean* surprisal across all four secret punchlines becomes **the line** — the most generously enabling setup takes the floor, whether or not its author benefits.
4. **Payoff.** For the chosen setup S*, `score = mean(surprisal of the other three punchlines | S*) − (surprisal of your punchline | S*)`. Positive means your line landed uniquely well. +2 if your own setup took the floor *and* your margin is positive. The TV animates the 4×4 grid filling in, then reveals the punchlines pinned under the winning setup and reads them aloud as one absurd script.

Private per phone: your punchline, your warmth dial, your draft. Public on TV: setups after lock, the 4×4 surprisal grid, the winning line, final reveal.

## Technical approach
Host tab runs transformers.js (distilgpt2 or SmolLM2-135M) on WebGPU as the sole scorer; phones are PWA controllers on a PartyKit / Cloudflare Durable Object room, or Socket.IO over Tailscale Serve. Data model: `Room{code, phase, deal{playerId→cardId}, drafts{playerId→text}, setups[], grid[4][4], winnerIdx}` — `deal[me]` is the only per-player private field, sent on join and never broadcast.

Hard part: **four live warmth dials on one GPU.** Each keystroke burst wants a fresh forward pass. Fix: per-player single-slot coalescing queue (stale drafts dropped, 350ms debounce), round-robin service so no fast typist starves the others, and cached tokenization of the fixed punchline suffix. Second trap: leading-space/BPE boundary between setup and punchline must be normalized or scores jitter meaninglessly. Third: cap setup length and use mean-per-token surprisal, or one-word setups win by default.

## v1 scope
- Exactly 4 players, one round, 8 punchline cards hardcoded.
- One 90s write phase, 12-word cap, no rematch, no persistence.
- 4×4 grid reveal, winner, scores, done.
- Warmth dial may lag a second and show one number.

## Out of scope
Multiple rounds, custom decks, player-written punchlines, TTS reading, 5+ players, tie-break elegance, any lobby art.

## Risks & unknowns
The generic-setup attractor: a bland setup ("So anyway,") may win the floor every game and flatten scores — needs a smoke test and possibly a minimum-content penalty. A 135M model may not discriminate between four punchlines under one setup enough to make margins feel earned.

## Done means
Four phones join, each sees a different punchline, all four submit setups inside 90s, and the host screen shows a filled 4×4 surprisal grid, names one winning setup, prints the four punchlines under it, and shows four distinct scores — start to finish in under three minutes with no host intervention.

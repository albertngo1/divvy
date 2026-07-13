## Overview
Focal Point is a 3–6 player Jackbox-shaped party game about spatial telepathy. A shared TV shows a sparse canvas; every player's phone is a private aiming reticle. With no talking, the room tries to all tap the *same* spot on an almost-empty screen — chasing the emergent focal point our eyes secretly agree on.

## Problem
Most convergence games abstract the fun into a slider or a meter. People love the specific, physical jolt of "we all pointed at the exact same place." But the instant anyone can see where others are aiming, they copy — the honest, simultaneous read is destroyed. Privacy per phone is the whole game.

## How it works
The host renders a large canvas with a few faint focal features — a single off-center dot, a soft directional gradient, a lone corner mark: a Schelling scene, not a puzzle with a right answer. Each phone privately shows the *identical* canvas with a draggable crosshair. You slide your reticle anywhere, seeing only your own crosshair plus a 12-second lock timer. Nobody sees anyone else — not even a count.

On lock, the server has every normalized coordinate. The host reveals the scatter and a **Spread score** (mean pairwise distance, normalized to canvas + player count). Tight cluster = the room wins the round. Across 3 rounds the host shows the *previous* round's ghost cluster between rounds so the room calibrates its shared instinct, and each new canvas adds one competing feature (two rival dots) so "just tap center" stops working.

**Private (phone):** your crosshair + timer only. **Shared (host):** nothing during aiming; the scatter + Spread score only after all lock.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). Data model: `Room{code, players[], round, canvasSpec, phase}`, `Player{id, name, pick:{x,y}, locked}`. `canvasSpec` is a seeded feature list in normalized 0–1 coordinates broadcast at round start so every device renders identically. Phones stream nothing during play — only a single final `pick` on lock — so there is effectively no real-time sync problem. The genuinely hard parts are (1) pixel-identical rendering across wildly different screen sizes → fixed aspect ratio with letterboxing and strictly normalized coords, and (2) a Spread metric that feels *fair* regardless of 3 vs 6 players and doesn't reward everyone hugging one obvious feature.

## v1 scope
- 3 players, one canvas (single center-vs-corner tension)
- One round: drag, lock on timer, reveal scatter + Spread %
- One win threshold → confetti
- Join by room code; no accounts, no persistence

## Out of scope
- Semantic/AI features, custom or user-uploaded canvases
- Multi-round ghost calibration, scoring history
- Tablet-vs-phone scaling polish, spectators

## Risks & unknowns
A truly blank canvas is trivial (everyone taps center) — the fun depends entirely on well-tuned competing focal features that split the room's instinct. Whether Spread feels fair across counts needs playtesting. Risk it reads as "a quiz with no answer" if features are too arbitrary.

## Done means
Three phones join by code, all see a byte-identical canvas, each privately drags and locks a crosshair no one else can see, the host reveals the scatter plus a Spread %, and crossing the win threshold fires a celebration — with zero leakage of any crosshair before reveal.

## Overview
A cooperative perception party game for 3–6 players sharing one TV and their phones. The room silently agrees on *what the inkblot is* by all touching the same place on it — turning shared pareidolia into a scored, blind, simultaneous convergence.

## Problem
Convergence party games are almost always abstract: match a slider (Simmer), a pitch (Tuning Fork), a beat (Flash Mob). They're clever but dry — nothing to *see*. Meanwhile everyone already knows the delight of "wait, you saw a rabbit too?!" from a Rorschach blot. No party game turns that snap of shared perception into a real, scored, no-talking convergence — and crucially, the moment is spoiled the instant anyone points.

## How it works
The host TV shows one large, symmetric generated inkblot and a countdown. Each phone **privately** shows the *same* blot, full-screen, with a movable crosshair. On "go," each player drags to the single spot where they most see *something* — a face, a beak, a dancer — and locks in. No player ever sees anyone else's crosshair. When all lock (or the timer ends), the host reveals a heatmap: every tap blooms at once, and a convergence score = 100 × (1 − normalized mean pairwise distance). A tight cluster triggers a celebratory reveal ("The room saw a rabbit"); a scatter fizzles. Best-of-3 blots, cumulative, beat a threshold to win.

**Private (phone):** the blot + only *your* crosshair. **Shared (host):** the blot before reveal (no taps), then the aggregated heatmap after — never labeled by player.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{id, phase, blotId, players:{id,name,tap?:{x,y},locked}}`. The blot is a seeded SVG/PNG served identically to host and phones; taps are normalized to 0..1 of the blot's bounding box so a 6" phone and a TV map 1:1. The genuinely hard part isn't latency (one message per player per round) — it's **fair coordinate normalization across wildly different aspect ratios and letterboxing**, plus guaranteeing no leak: the server withholds every tap until `phase=reveal` (all locked or timeout), then broadcasts the full set to the host only and computes convergence server-side.

## v1 scope
- One hard-coded blot image
- 3 players, single round
- Tap → lock → simultaneous heatmap reveal + numeric score
- No accounts, no persistence

## Out of scope
- Procedural blot variety
- Naming/guessing *what* it is
- Multi-round leaderboards, elaborate animations

## Risks & unknowns
Is one tap enough signal, or does it need a label to feel meaningful? Symmetric blots invite lazy center-clustering (mitigate with strong off-center features). Pareidolia may simply not converge, making low scores feel bad — threshold tuning needed. Coordinate-mapping bugs would silently wreck fairness.

## Done means
Three phones join, all render the identical blot, each taps once; within 500ms of the last lock the host shows a bloom heatmap plus a numeric convergence score, and taps are provably hidden from every client until the reveal.

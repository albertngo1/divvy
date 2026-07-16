## Overview
Sign is a cooperative convergence game for 3 players built around the Android-style unlock gesture. Each player privately swipes a connect-the-dots pattern on their phone's 3×3 grid, all silently trying to converge on the *same* secret sign. Nobody is told what pattern to draw — the room has to invent and agree on one gesture through pure Schelling-point intuition.

## Problem
Convergence games usually live in continuous spaces — sliders, colors, timing. A gesture is discrete, embodied, and shockingly personal: the pattern *you'd* obviously draw (a Z, a box, an S, your initial) feels universal until you discover your friends drew three different 'obvious' shapes. The itch is that a swipe feels like a signature — and the game asks a signature to become a shared one, silently.

## How it works
Each PHONE privately shows a 3×3 dot grid. You drag through dots to form a connected path (min 4 dots, standard unlock rules — a line through an unused dot captures it). Your own trace glows on your screen; you can clear and redraw freely, then SUBMIT. You never see anyone else's gesture.

Host TV shows only: how many *distinct* patterns currently exist in the room (3 → 2 → 1) rendered as anonymous ghost-blobs of the right count but NOT their actual shapes, plus a 'lock' ring that fills as submissions come in. So the room learns 'we're split into two camps' without learning what either camp drew — you have to guess which of your instincts to abandon. After all three submit, if the paths aren't identical, the host flashes 'MISMATCH', clears everything, and they redraw. When all three traces match dot-for-dot and direction, the host animates the three swipes merging into one glowing sign and unlocks.

Per-phone is load-bearing: the gesture is drawn privately and simultaneously on each device. A single passed phone would reveal the pattern and collapse the entire secret-convergence premise instantly.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Player { id, path: number[]|null, submitted }` where path is an ordered list of dot indices 0–8. Sync strategy: on submit, phone sends the ordered index array; the server canonicalizes (order + direction matter, so [0,4,8] ≠ [8,4,0]) and computes the count of distinct paths, broadcasting ONLY that integer + submit count to the host — never the paths themselves until unanimous. The genuinely hard part isn't real-time sync (submissions are discrete) but the *information design*: leaking exactly enough (how many camps exist) to make convergence solvable without leaking the shapes, which would trivialize it. Tuning that single revealed number is the whole game's balance.

## v1 scope
- Exactly 3 players, one round, one shared grid size (3×3).
- Host = distinct-pattern count + submit ring + unlock animation. Phone = grid + draw + submit.
- Standard unlock connection rules; direction-sensitive matching.
- Redraw-until-unanimous, no timer, no scoring.

## Out of scope
- 4×4 grids, timers, rounds, scoring, leaderboards.
- Showing partial hints of others' shapes.
- 4+ players, matchmaking, saved 'house signs'.

## Risks & unknowns
- Might converge too fast (everyone draws the same boring square) or never (three stubborn signatures) — the revealed camp-count is the only tuning knob.
- Whether 'N distinct patterns' is enough signal to steer convergence, or too little, is untested.
- Direction-sensitivity may frustrate (two people drew the same shape backwards).

## Done means
Three phones join, each privately draws a 3×3 unlock gesture and submits; the host shows only the count of distinct patterns and the submit ring; when all three ordered paths are byte-identical the host plays the merge-and-unlock animation, otherwise it flashes mismatch, clears, and loops.

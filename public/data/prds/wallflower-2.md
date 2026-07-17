## Overview
Wallflower is a 3–6 player party game that inverts every other party game: instead of standing out, you win by blending in. Everyone privately answers the same battery of slider questions, aiming to be as median as possible. The host TV plots the group as unlabeled dots around a centroid "hearth" — a keepsake constellation poster of the group's collective personality — and you win by being the person nobody can pick out of the cloud.

## Problem
Party games reward the loud, the clever, the extreme. There's no game about the quiet pleasure of being unremarkable — and group "who are we" snapshots (the shared artifact people actually want to keep) rarely survive the night. Wallflower makes self-erasure the goal and prints the proof.

## How it works
The host TV shows six anonymous slider prompts ("how much chaos do you like: none ↔ total", "how spicy is too spicy", etc.). Each phone PRIVATELY drags six sliders, blind to everyone else, trying to guess the room's median and land on it — you can't see others' answers, so hitting "typical" is a genuine read of the room. Each phone also shows a private **Blend Meter** hinting only at your own extremity after you lock (never others' values). The host shows only a growing constellation of unlabeled dots plus a centroid star — the keepsake poster forming live.
Once all lock, a private phase: each phone secretly marks which dot it believes is ITSELF, and (v1.1) attributes one named rival to a dot. Reveal — no points scoreboard: **The Wallflower** is the player nearest the centroid (blended in perfectly); the **Unseen** are any players nobody correctly placed. The poster exports as a PNG dated and titled with the group's name.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `room { prompts[6], answers{ playerId:[6] }, guesses{ playerId:{ selfDot, rivalGuess } }, phase }`. On an all-locked barrier the server computes the mean vector (centroid), pairwise distances, and projects the 6-D answers to 2-D via classical MDS (trivial at this scale, pure server-side JS). Dot layout is deterministic; the host renders it to a canvas and exports PNG. Sync is a simple lock/barrier plus private guess collection — the tech is deliberately light; the real risk is design (making blind median-guessing feel tense), not engineering.

## v1 scope
- 3 players, six fixed prompts, blend-in mode only.
- Live anonymized dot constellation + centroid star on the TV.
- One private guess (self-dot only).
- Reveal of the Wallflower; exportable constellation PNG.

## Out of scope
- Named-rival attribution, honest-mode, custom prompts, multiple rounds, avatar reveal animations, richer projections.

## Risks & unknowns
- With only 3 players the centroid is noisy and dots may cluster meaninglessly (MDS of 3 points is near-trivial) — may need 4–5 for real separation.
- Sliders can feel dry / Wavelength-adjacent; prompt quality carries the fun.
- Balancing enough prompts for separation without tedium.

## Done means
Three phones privately lock six sliders; the TV renders an anonymized constellation with a centroid star; each phone privately guesses its own dot; the app reveals the Wallflower and offers a poster PNG download.

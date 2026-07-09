## Overview
Tic is a kinesthetic convergence game where each player holds their own phone and performs a small, repeating motion — a bounce, a swirl, a shake, a figure-8. With no talking, the room tries to converge on ONE identical gesture, everyone twitching in the same shape and rhythm. For 3-4 people who want a silly, physical, almost hypnotic sync game.

## Problem
Sync/convergence games so far live on sliders, canvases, and taps — abstract thumbs. Nothing uses the fact that a phone is a motion sensor you're already gripping. The itch: can a room *entrain* into one shared movement, the way clapping crowds fall into rhythm, but where the target gesture itself is emergent and unspoken?

## How it works
Each phone reads its accelerometer + gyroscope and shows, PRIVATELY, its own live motion trace — a scrolling squiggle of the player's current gesture, plus a tiny 'you're too still / too wild' nudge. That's all you see of yourself.

The shared HOST SCREEN shows the emergent cloud: every player's normalized motion trace overlaid as translucent ghost-lines on one shared timeline, anonymized (you can't tell which is yours), plus a big Sync % meter. As players move, a dense band forms where traces agree in *shape and phase*; stray lines wander outside it. Reading only that overlay, each player silently nudges their own motion toward the thickening band — matching the swirl, the tempo, the beat. The server aligns traces (per-phase, using cross-correlation / DTW on the motion-magnitude + dominant-axis signals) and scores tightness. Win when all traces stay inside the band, in-phase, for 4 continuous cycles.

Private-per-phone is load-bearing and literal: each phone is being physically waved by a different body at the same instant. One shared phone passed around cannot sense three people moving simultaneously, and the private 'only-you-see-your-own-trace' split is what forces silent, guess-the-room convergence.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Phones sample DeviceMotion at ~50Hz, downsample, and stream a compact motion feature vector (magnitude envelope + dominant-axis sign) at ~10Hz. Data model: `Player { id, traceBuffer, phaseOffset, inBand }`; server keeps a rolling ~3s window per player. Sync strategy: normalize amplitude, estimate each player's dominant period, phase-align via cross-correlation, and compute pairwise trace distance (DTW on the aligned window); Sync % = 1 − normalized mean distance. The genuinely hard part is real-time phase alignment: people gesture at slightly different tempos and offsets, so the server must continuously re-estimate phase and only reward *shape+phase* agreement, tolerant enough to feel achievable but strict enough that random flailing never scores.

## v1 scope
- 3 players, one round, no timer
- Live private motion trace on each phone + still/wild nudge
- Host shows anonymized overlaid ghost-traces + Sync %
- Win = all inside the band, in-phase, 4 cycles
- Room-code join, ~45s target

## Out of scope
- Prescribed gesture library or scoring across rounds
- Handedness / phone-orientation calibration beyond auto-normalize
- Leaderboards, replays

## Risks & unknowns
- DTW/phase alignment on noisy consumer IMUs may feel unfair or laggy; tuning tolerance is the whole ballgame.
- DeviceMotion permission prompts (iOS requires a user gesture) add friction.
- Very slow or micro gestures may be indistinguishable from noise.

## Done means
Three phones join, each shows its own live motion squiggle, the host shows an overlaid ghost-cloud with a Sync meter, and three people — swirling their phones in silence — can push that meter to a win by falling into one shared motion, verified by a bystander seeing them all move alike.

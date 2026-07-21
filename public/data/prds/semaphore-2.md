## Overview
Semaphore is a 3-6 player party game where each phone is a motion wand. Everyone performs a hand-wave gesture simultaneously; the host TV renders every gesture as an anonymized glowing ribbon (a long-exposure "signal painting"). The win condition is anonymity: you succeed if no one can pick your ribbon out of the crowd. The composite ribbon-wall is a saveable keepsake. For groups who like a little physical silliness and no scoreboard.

## Problem
Drawing games attribute you by handwriting or style; text games attribute you by voice. Almost nothing lets a whole room *move* at once and then hide in the blur. Passing one phone around kills it — the magic is that everyone gestures in the same three seconds and nobody sees anyone else until the reveal.

## How it works
A countdown syncs on the host TV. On "go," every phone captures ~3 seconds of accelerometer + gyro while the player waves it. PRIVATE on each phone: a secret required MOTIF card ("a sharp zigzag," "a slow clockwise circle," "a figure-eight") the player must physically express — so nobody can cheat by holding still — plus a live "you're moving" meter. The player never sees others' gestures. SHARED on the TV after capture: all ribbons fade in at once as anonymous colored traces, animating along their recorded path, then settling into one overlaid light-painting. Then an anonymity round: each phone privately drags labels onto ribbons to guess who did which. You win by staying un-attributed by a majority. The host exports the composite PNG as the keepsake, credits hidden.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{phase, seed}; Player{id, motifId, trace:[{t,ax,ay,az,gx,gy,gz}], guesses:{ribbonId->playerId}}. Sync: server owns the phase clock and countdown; phones buffer sensor samples locally at ~60Hz and upload the full trace on capture-end (not streamed), so latency is irrelevant to fairness. The genuinely hard part is turning noisy IMU data into a *legible* 2D ribbon — raw double-integration of acceleration drifts badly. Mitigation: reconstruct the path from gyro-derived orientation change (angular sweep is far more stable than positional integration) and treat the gesture as a 2D projection of pointing direction, smoothed with a one-euro filter. Ribbons are stylized, not accurate — charm over fidelity.

## v1 scope
- 3-4 players, one round, one motif each
- Fixed 3-second capture window
- Gyro-only path reconstruction + smoothing
- Anonymous ribbon reveal + one guess pass
- Export composite PNG

## Out of scope
- Multiple rounds / scoring history
- Motif verification (trusting players to attempt it)
- Fancy 3D ribbons, audio, replay scrubbing

## Risks & unknowns
- IMU noise may make ribbons look like scribbles rather than distinct gestures (core fun risk)
- iOS requires a user tap to grant DeviceMotion permission — must gate on that
- Devices with no/poor gyro degrade the reconstruction
- Anonymity may be trivially breakable if a player's motif is too distinctive

## Done means
3 phones join over LAN, all grant motion access, gesture simultaneously, and the TV shows 3 visually distinguishable ribbons within 2s of capture; a guess pass runs; and at least sometimes at least one player is genuinely un-attributed and the composite PNG saves.

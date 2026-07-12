## Overview
Powder Keg is a 3-4 player cooperative defusal game for a shared host TV plus per-phone controllers. The room must enter a shared code in the correct order while a sound-sensitive detonator listens to everyone at once. Talking, laughing, or groaning grows the noise meter toward BOOM. It's for groups who like pressure-cooker coordination and the comedy of a whole room clamping their mouths shut.

## Problem
Most 'work together' party games devolve into the loudest person shouting instructions. Powder Keg makes the obvious solution — talking it out — the thing that kills you, forcing a jury-rigged silent sign language under a ticking clock.

## How it works
The host TV shows a bomb with N empty slots (v1: 4), a big collective NOISE meter, and a 90-second fuse. Each PHONE privately shows: (a) one digit the player owns and a single ENTER button, and (b) one ordering clue about the *global* sequence — e.g. 'your digit comes immediately after the red digit' or 'you are not first.' No phone shows the full order; the clues only combine across players. Normally you'd just read your clue aloud — but every phone's mic runs a live WebAudio RMS meter and streams its level to the server, which SUMS the room. If the summed level crosses the threshold for >0.5s, the meter spikes; max = detonation. So players must reconstruct the order by physically showing phones, pointing, and gesturing — in near silence. When a player taps ENTER, the server checks it against the true next-in-order slot: correct advances the bomb; wrong adds a noise penalty and a red flash on the host. Defuse all slots in order, under the noise ceiling, before the fuse ends = win.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { fuseEndsAt, noiseLevel, slots:[{index, correctPlayerId, filled}], players:[{id, digit, clue, micRms}] }`. Each phone posts a smoothed `micRms` every 200ms; the server keeps a rolling sum and integrates it into `noiseLevel` with decay. ENTER events are validated server-side against the next unfilled slot. The genuinely hard part is fair mic aggregation: phones have wildly different mic gains and pick up the same room sound, so the server calibrates each phone with a 3-second 'everyone hush' baseline at round start, subtracts each phone's floor, and clamps per-phone contribution so one hot mic can't dominate — the meter reflects the ROOM getting louder, not one bad sensor.

## v1 scope
- 3 players, one 4-slot bomb, one 90s round
- One digit + one ordering clue per phone; clues guaranteed to have a unique valid order
- Summed mic meter with per-phone baseline calibration
- Host: bomb, noise meter, fuse, win/BOOM screen

## Out of scope
- Multiple rounds, difficulty tiers, wire-cutting minigames
- Scoring/leaderboards; it's win-or-die
- Voice chat, spectators, reconnection polish

## Risks & unknowns
- Mic gain variance could make the meter feel unfair — calibration must be visibly honest
- Silent negotiation may be too hard with only gestures; clue difficulty needs tuning
- Ambient room noise (AC, music) could pin the meter — need a floor-subtract that adapts

## Done means
Three phones join, each shows a distinct digit+clue, a controlled shout provably spikes the summed meter to BOOM, and a silent group that enters all four digits in the clue-implied order before the fuse defuses the bomb.

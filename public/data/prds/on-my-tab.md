## Overview

A five-minute room game for 4–5 people with a TV and a phone each. Every player is secretly assigned one other player as their **Voice**. Your private tank drains in real time, proportional to how loudly *that person* is speaking. You are never told who it is. Meanwhile the room has a talking task it must finish before the clock runs out.

## Problem

"Silence games" usually make silence a currency: talk less, keep more points. That's a budget, and budgets are boring — you just ration. Nobody has ever built the version where **your voice is harmless to you and expensive to someone else**, and the damage graph is hidden. That flips shushing from politeness into an accusation you can't explain.

## How it works

1. **Calibration (20s).** Each player says their name; per-device mic gain and noise floor are fitted.
2. **Setup.** The server draws a derangement over players: `voiceOf[p] = q`, `q ≠ p`. Each player gets a 100-unit tank and two private ordering constraints about six objects shown on the TV ("the kettle is left of the moth").
3. **Round (4 min).** The room must publicly agree on the full left-to-right order of the six objects — solvable only by pooling constraints, i.e. by talking. Continuously, `tank[p] -= k * speechEnergy[voiceOf[p]]`. Tanks refill slowly during *total* room silence, so the room keeps calling unspoken timeouts nobody can justify.
4. **Endgame.** Each phone names who it thinks its Voice was, and whose Voice it thinks it was.

**TV (shared):** the six objects, the clock, room level as one bar, and every player's tank as a public named bar. Public effect, private cause — you can see Dana bleeding, not why.

**Phone (private):** your two constraints, your tank with an instantaneous drain needle, and the guess pad. The needle is the only instrument you own, and it is only readable when exactly one person is talking — so silence isn't merely cheaper, it is *higher resolution*.

The emergent joy: you shush one person hard, which tells them they are your Voice, and now they can extort you — by threatening to talk, which they cannot state aloud, because talking costs *their* creditor.

## Technical approach

Phone PWA: `getUserMedia` with `autoGainControl/noiseSuppression/echoCancellation: false`, AnalyserNode → RMS per 100 ms frame, sent over WebSocket as one float. Host tab is a dumb renderer. Authoritative PartyKit Durable Object (or Socket.IO behind Tailscale Serve) holds `{players, voiceOf, tanks, order}` and ticks at 10 Hz.

**The genuinely hard part is attribution, not sync.** In a small room every mic hears every voice, so raw energy would drain all tanks at once and dissolve the deduction. Per frame: subtract each phone's fitted noise floor, normalize by fitted gain, take a softmax; assign the frame to the argmax only if its share exceeds ~0.55 with 3-frame hysteresis, else assign it to nobody. Overlapping talkers correctly produce *no* attribution — which is exactly the fog the game wants.

## v1 scope

- 4 players, one 4-minute round, one hardcoded six-object puzzle
- Fixed derangement, fixed drain constant, silence refill
- Public tank bars on TV, private needle + constraints on phone
- One end-of-round guess each, scores printed, no lobby polish

## Out of scope

Multiple rounds, puzzle generator, reconnect handling, spectators, speaker diarization by voiceprint, any scoring subtlety beyond tank + guess.

## Risks & unknowns

Attribution may fail in a loud room; needs a real-room test with 4 phones on a table. Refill rate is the whole balance knob — too fast and the room just sits silent. Extortion may stall the puzzle entirely; the clock is the only fix.

## Done means

Four phones, one TV, one live round: at least two players correctly name their Voice, tanks visibly diverge on the TV, and at least one player is caught on video silently shushing another with no explanation.

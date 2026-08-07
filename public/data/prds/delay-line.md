## Overview
A cooperative 3-player, two-minute round for a TV and three phones. Each player's voice is captured on their own phone and released into the room after a *private* delay — 3, 7 or 12 seconds. The TV is the only speaker. The room has to assemble a six-line sentence, in order, out of voices that all arrive late by different amounts.

## Problem
Every turn-taking game punishes interruption in the present, where you can hear yourself doing it. Here the collision happens in the future, invisibly. Speaking now is a bet on a moment 12 seconds away, and the only safe way to coordinate is to stop talking and start pointing.

## How it works
1. Calibration, then each phone is privately assigned a delay and shown it as a countdown ring. Nobody is told anyone else's.
2. The TV shows a timeline scrolling left to right with six 2.5-second SLOT windows. Each phone privately holds two of the six lines and their slot numbers ("you own slot 2 and slot 5").
3. Hold the pad and speak: your phone records locally, and the server releases your audio to the TV at capture-time + your delay. To land line 3 at t=40 s with a 12 s delay you must speak at t=28 — while the 3 s player must stay silent until t=37.5.
4. If two releases overlap, the TV plays them mixed and both are struck as a GARBLE. Audio landing outside any slot window is noise and costs a strike. Every stray "wait, when do I go?" is delayed too, and usually lands on a teammate.
5. Private per phone: your delay, your two lines, and a preview of where your utterance *would* land. Public on the TV: only the past — slots filled, slots garbled — plus the next 3 seconds. In-flight audio is invisible until it lands. That asymmetry is the game.
6. Gesturing, pointing and showing your screen are legal and become the entire communication channel within about 20 seconds.

## Technical approach
Phone PWA records 1-second Opus chunks via MediaRecorder, gated by an AudioWorklet RMS/voicing detector, streamed to the server tagged with `utteranceId` and a synced capture timestamp (5-sample offset handshake, EWMA). Server holds a scheduled release queue and forwards chunks to the host tab at `capture + delay − transportLatency`; host plays through Web Audio with a 500 ms jitter buffer.

Model: `Room{t0, slots:[{index, windowStart, windowEnd, state}], strikes}`, `Player{delayMs, lines[], floorDb}`, `Utterance{id, playerId, releaseAt, durMs, chunks[]}`. Overlap is decided server-side on release intervals, quantized to a 250 ms grid.

Hard part: the audio path itself. Perceived delay must match the assigned delay within ~200 ms or the puzzle is unfair, so the jitter buffer and clock sync carry the whole design. Second hard part: bleed — a neighbour's voice caught by your mic would be delayed twice; only the loudest phone above its own floor is allowed to open a capture.

## v1 scope
- 3 players, fixed delays 3/7/12 s, six slots, one hardcoded sentence, 120 s
- Host output is mono playback plus a slot timeline; score is "slots landed / garbles"
- No ASR, no reconnect, no lobby, no round two

## Out of scope
4+ players, delays that change mid-round, a competitive sabotage mode, saving the final garbled recording as a shareable artifact (obvious v2), spectator view.

## Risks & unknowns
Wi-Fi jitter could make releases feel arbitrary; fallback is a wider 3.5 s slot window. Whisper-planning under the voicing gate is a real loophole — either drop the gate threshold or penalize sub-threshold murmur. TV speakers feeding back into phone mics can re-trigger capture; v1 just asks people not to sit on the speaker. Two lines each may still be too hard for a first round; one line each is the escape hatch.

## Done means
Three phones and a host on one LAN complete a round where the TV plays back a timeline with at least four of six slots landed in order from their correct owners, garbles marked — and playtesters are observed gesturing frantically at each other rather than speaking.

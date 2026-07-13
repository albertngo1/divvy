## Overview
A 3–4 player cooperative pressure-cooker for one shared TV (the submarine + the sea above it) and one phone per player (a private control station). The whole game is played in enforced near-total silence: the mic is the antagonist. It's for groups who like tense co-op like Keep Talking and Nobody Explodes — except here talking is exactly what kills you.

## Problem
Party games beg you to shout. The delicious inversion — a room of friends physically straining NOT to make a sound while urgently needing to coordinate — is almost never built, because it only works if talking is *mechanically* punished, not politely discouraged. A referee can't catch a whispered word; a phone's mic can.

## How it works
The host TV shows the ocean: a slowly-sweeping enemy sonar ping approaching, a shared depth gauge, and one big **Noise Meter**. Each phone privately shows ONE station — Ballast, Reactor, Helm, Sonar — and a private task queue only that player can read ("vent tank 2 to 40%", "cut reactor to silent-running before the ping"). Crucially, executing your task at the *right moment* depends on a reading only *another* player's phone shows. So you must coordinate — but every phone runs a live mic listener on its own owner. Words (via on-device SpeechRecognition), coughs, or volume spikes above a whisper floor each pump the shared Noise Meter on the TV. Speak a full sentence and the destroyer gets a bearing. Fill the meter before the sweep passes = depth charges = you lose. Players communicate by pointing at the TV, tapping visible station lights, and frantic gesture. Survive the sweep (≈75s) in silence = you slip away.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room {sweepPhase, noiseLevel, depth}`, `player {station, taskQueue[], done[]}`. Each phone runs Web Audio `AnalyserNode` for RMS and the Web Speech API for word detection locally, emitting only lightweight `noise:{delta, kind}` events — raw audio never leaves the device (privacy + bandwidth). Server integrates deltas into one authoritative `noiseLevel` broadcast at ~10Hz to the host. Genuinely hard part: cross-device mic calibration (a 3s ambient-floor sample per phone at lobby) and debouncing so one laugh doesn't instantly end the game, while still feeling punishing. Speech detection latency (~1–2s) is fine — it models the destroyer taking a bearing.

## v1 scope
- 3 players, 4 fixed stations (one player double-hats), ONE 75s sweep.
- Three hand-authored interdependent tasks total.
- Noise Meter + win/lose screen. No campaign, no difficulty tiers.

## Out of scope
- Multiple sweeps / branching depth mechanics.
- Directional "they heard you from the left" audio.
- Reconnect mid-dive, spectators.

## Risks & unknowns
- Whisper floor tuning: too strict = unplayable, too loose = no tension.
- SpeechRecognition support/consistency across iOS Safari vs Android.
- Is silent gesture-coordination *legible* enough, or just frustrating? Needs playtest.

## Done means
Three phones lobby in, calibrate ambient floor, receive distinct private stations. A spoken sentence visibly spikes the shared TV meter within 2s; a run completed in silence resolves the interdependent tasks and shows an escape; a run where players talk fills the meter and shows depth charges.

# Tuning Fork

## Overview
Cooperative pitch-matching game. Every phone plays a random low tone; each player hums along, and each phone's mic detects the singer's pitch via FFT autocorrelation. The group's goal is to make all phones converge on the SAME pitch by ear alone. Success = all pitches within a ±20 Hz tolerance for 3 continuous seconds. It's a coordination game where the coordination channel is sound, and the phone is both listener (mic pitch detect) and reference (playing the seed tone). Per-phone is load-bearing because each phone must independently listen to its own player's voice.

## Problem
Nobody has built a browser party game that uses pitch as the coordination channel. Group singing games (SingStar, Karaoke) score individual accuracy against a track. Silent coordination games ignore audio. This creates a genuinely social feeling: the whole room is humming together, phones vibrate when pitches align, someone's phone goes green when their voice locks with the group. It's meditative and slightly ridiculous — perfect for a warmup or wind-down round at a party.

## How it works
Room code join, 3-6 players. Setup: each phone plays a low reference tone (~200 Hz sine, 3-second sample). Players open mics and hum. Each phone runs a pitch-detection loop (autocorrelation on the mic input, ~10 Hz refresh) and displays their current detected pitch as a colored bar. Server aggregates each player's detected pitch and computes cluster tightness: standard deviation of the group's pitches. When std dev is under 20 Hz for 3 seconds, phones vibrate + turn green ("locked!"). Session = 3 rounds, each with a different reference tone; scored by how quickly the group locks each round.

## Technical approach
PartyKit / Durable Objects. Room state = `{reference_tone, current_pitches: {player_id: hz}, lock_status, round}`. Client uses `getUserMedia` + Web Audio API `AnalyserNode` at ~10Hz for FFT autocorrelation; extracts fundamental frequency from mic input. Emits `pitch_update` at 5Hz. Server computes std dev across all reported pitches, broadcasts `locked` event when threshold met + sustained. No LLM needed. Reference tone synthesized client-side via `OscillatorNode`.

## v1 scope
3 rounds, 4-6 players, single reference tone per round (200 Hz sine), 20 Hz cluster tolerance, 3-second sustain requirement. Score = seconds-to-lock per round (lower is better). No difficulty tiers, no pitch-history graph, no per-player voice recording, no melodic patterns beyond a single tone.

## Out of scope
Melodic patterns (moving reference tone), harmonies (chord matching), individual pitch scoring, waveform display, voice recording playback, choir mode with prescribed parts, adjustable tolerance, ambient noise auto-calibration.

## Risks & unknowns
Pitch detection on a phone with ambient party noise is genuinely hard — the reference tone playing IN the room may bleed into other phones' mics and confuse detection. May need noise-cancelling voice-detection or a pre-round calibration to establish each mic's noise floor. Some players (non-singers) may struggle to hum a specific pitch and never hit the target; this could feel exclusionary. Test question: is "we all hummed together" satisfying, or does it feel arbitrary? The vibration when phones lock is critical — needs to feel like reward, not just a state change. iOS mic permission is a hurdle; needs join gesture prompt.

## Done means
4 friends open the room, grant mic permission, and successfully hum together to lock at least one round out of three. If the group finds themselves laughing while humming (they will), v1 shipped.

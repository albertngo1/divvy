## Overview
A 3-player cooperative listening game. The TV plays three layered sounds at barely-audible level. Each phone is a private ear tuned to a different slice of the spectrum, rendered as a live scrolling spectrogram. No slice identifies anything alone. Talking is the only way to combine them — and talking is what wrecks your slice.

## Problem
Every silence game so far punishes speech by rule: a counter ticks down, a light goes red. The punishment is arbitrary and players feel policed. This one makes the punishment *physical*. Nobody deducts anything when you talk; your voice simply floods your own passband and you go blind while you speak. The mic constraint stops being a rule and becomes a law of the room.

## How it works
Host TV: a 90-second timer, three unlabeled answer boxes, a 20-word candidate bank (kettle, zipper, coin drop, cat, wind-up toy…), and a room-level noise meter. It never shows anyone's spectrogram.

Each phone privately shows: a live spectrogram strip of what *its own* mic hears, band-limited to that phone's assigned range (P1: 150–600 Hz, P2: 600–2.2 kHz, P3: 2.2–8 kHz), plus a private three-word guess pad. Bands are disjoint, so the same event looks completely different on each phone: a coin drop is a bright top-band tick and nearly nothing at 200 Hz.

The consequence is structural. To share "I get a repeating burst every two seconds," you must speak — and voiced speech saturates 150 Hz–4 kHz, whiting out most of any band. The speaker is deaf for the duration; the listeners keep gathering. The room converges on: look, memorize, then talk while blind, and take turns being the blind one. Locking all three guesses correctly before 90s wins. Guesses lock privately and simultaneously, so nobody can just parrot the loudest voice.

## Technical approach
PartyKit Durable Object as authority. State: `{stimulusId, bands: {playerId: [lo, hi]}, guesses: {playerId: [w,w,w]}, lockedAt, floorDb}`. Phones open `getUserMedia({echoCancellation:false, noiseSuppression:false, autoGainControl:false})`, run an `AnalyserNode` at 2048 FFT, and draw only their assigned bins — audio stays on-device; only a 4 Hz band-energy scalar goes to the server for the TV's room meter and post-round replay.

Hard part is signal, not sync. Mobile browsers aggressively noise-gate anything near the floor, and iOS Safari re-enables processing on some route changes. Mitigation: a 5-second pre-round floor calibration per phone, per-phone gain normalization so all three strips look comparably lively, and stimulus mastering at roughly 10 dB above the measured floor — near-inaudible to the ear, clearly visible on a spectrogram.

## v1 scope
- Exactly 3 players, one 90-second round, one hand-mastered 3-layer stimulus
- Three fixed disjoint bands, assigned by join order
- Per-phone floor calibration; private guess pad; simultaneous lock
- TV shows timer, candidate bank, three answer boxes

## Out of scope
More rounds or stimuli, 4+ players, adaptive band assignment, headphone mode, scoring beyond win/lose, reconnects.

## Risks & unknowns
Mobile noise suppression may kill the stimulus outright — the single biggest failure mode. Room reverb and phone placement vary wildly. Reading a spectrogram may be too abstract for a party; a mel-scaled, smoothed "heat ribbon" is the fallback rendering.

## Done means
Three phones, one TV, one room: all three players see visibly different strips of the same faint sound, a player who talks watches their own strip white out in real time, and the room names all three sources within 90 seconds.

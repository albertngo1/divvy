## Overview

A 3-player co-op game for one living room with one decent speaker. The host tab drones three steady sine tones simultaneously. Each phone is secretly assigned one tone and becomes a meter for that tone only. Every player must physically walk their body to a spot in the room where *their* tone sits inside *their* private target band — and hold it. All three must be locked at the same instant.

## Problem

Sensor party games collapse the second the mechanic is monotonic: "walk toward the speaker" is solved in five seconds and then it's just a walking simulator. Real rooms are not monotonic. At low-mid frequencies a small room has standing waves — a null at 180 Hz can be a peak at 330 Hz, forty centimeters apart, and the loudest spot for one tone can be in the far corner. That map is free, physically real, stable for the whole round, and completely invisible. Nobody has used it as a board.

## How it works

Host TV plays 180 / 247 / 330 Hz continuously at a firm level and shows: three lamps (one per player, colored), a 90-second clock, and "2 of 3 locked." It never shows levels, targets, or positions.

Each phone privately shows: one vertical bar (its assigned tone's level), a shaded target band, and a ring that fills over 3 seconds while in-band and empties instantly when out. Crucially, some players are assigned a *null* target (get quiet) and some a *peak* target (get loud), and the target type is private. So watching someone settle into a corner tells you nothing.

The comedy is the cross-talk: "it's louder by the bookshelf!" is true for 180 Hz and meaningless at 330 Hz. Bodies absorb too, so crowding a neighbor moves their reading — success requires spreading out and shutting up.

## Technical approach

Host tab: three `OscillatorNode`s through one gain, plus the game view. Phones: PWA, `getUserMedia` with `echoCancellation:false, noiseSuppression:false, autoGainControl:false`, 4096-point `AnalyserNode`, read the assigned bin ±2, smooth over 300 ms.

Data model in a Durable Object: `{roomId, phase, tones:[{playerId, freq, targetType, band, baseline}], locks:{playerId: msInBand}}`. Phones push `{level, ts}` at 10 Hz; the DO is authoritative for lock state and pushes room state to the host at 10 Hz. Phones never see each other's data.

The hard part is not clock sync — it's gain. Mic sensitivity varies 10+ dB across handsets, and mobile Safari quietly ignores `autoGainControl:false`. Fix: score **assigned-bin energy ÷ broadband RMS**, a ratio that survives AGC because AGC scales both. Then a 6-second calibration — everyone stands mid-room — sets each device's personal 0 dB reference, and all bands are relative to that.

## v1 scope

- Exactly 3 players, one 90-second round, no scoring beyond win/lose
- Fixed tone triple, fixed bands, one null target and two peak targets
- 6-second mid-room calibration, then go
- Host TV: three lamps + clock. Nothing else
- Room code join, no accounts, no reconnect handling

## Out of scope

Multiple rounds, difficulty ramps, tone sweeps mid-round, headphone/mono fallback, room-map visualization, spectator view, score history.

## Risks & unknowns

Many phone mics roll off hard below 150 Hz — 180 Hz is the floor, and it may need to rise to 220 Hz. Small or heavily furnished rooms may have too little modal contrast (<6 dB), which kills the game; needs a one-room-per-week reality check. Bluetooth speakers add latency (irrelevant) but also bass rolloff (very relevant). Neighbors will hate you.

## Done means

Three phones join by code, calibrate, and each shows a live bar. Two testers stand still in different corners while a third walks the room; the walker's bar swings ≥8 dB between two spots one meter apart, and the other two bars stay stable. All three achieve simultaneous 3-second lock at least once in a 90-second round, and the host TV lights all three lamps and declares a win.

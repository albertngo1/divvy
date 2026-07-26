## Overview

A 4-player, one-round listening game for a living room: a shared host screen plus four phone PWAs. Each phone whispers **one fragment** of a shared 4-digit vault code to its owner alone, at a gain calibrated to that specific person's hearing threshold. Any human sound in the room destroys somebody's fragment. Three players want the code; one, secretly, does not.

## Problem

Every "don't talk" party game punishes talking with an arbitrary buzzer. Because the punishment is a rule, it feels like a rule, and the room negotiates around it. We want the punishment to be **physics**: you made a sound, therefore the information is gone, and nobody had to adjudicate anything. Masking does the refereeing.

## How it works

1. **Calibrate (~20s).** Room goes quiet; each phone measures its own dBFS noise floor. Then each phone runs a 6-step audiometry staircase — *"tap YES if you can hear this"* — halving gain until it finds the owner's personal threshold. Playback locks at threshold + ~2 dB: audible at 30 cm, inaudible across a couch.
2. **Deal.** Server picks a 4-digit code. **Privately, each phone** shows one digit *slot* it is responsible for and a role: three COURIERS, one STATIC. **The host TV** shows only four blank slots, a live room-level bar, and a 60s clock.
3. **Silence phase (60s).** Four 4-second playback windows are scheduled at random times. **Your phone shows only your own countdown ring** — you never learn when anyone else's window is, so the only safe policy is total silence for a minute. At your window your phone whispers "third… seven". Once. Never again.
4. **Burial.** Your window is judged by the **other three phones' microphones**, not your own (yours is deaf behind its own speaker). If any of them peaks >12 dB above its calibrated floor during your window, your fragment is consumed and your phone privately reports: *you heard nothing.*
5. **Talk phase (45s).** Mics stop mattering. Pool digits aloud, fill the blanks, any phone submits the code.
6. **Reveal.** Couriers win on an exact code; STATIC wins if it's wrong — their only weapon was deniable noise. The TV then replays an acoustic timeline: every spike, attributed to the loudest phone, laid over each player's window. That timeline *is* the deduction evidence.

## Technical approach

Host tab + phone PWAs + one PartyKit Durable Object. Phones open `getUserMedia` with `echoCancellation`/`autoGainControl`/`noiseSuppression` all **false** (required for an honest floor), run an AnalyserNode, and stream 20 Hz RMS. DO state: `Room {phase, code, schedule[], noiseLog[]}`, `Player {id, digit, slot, role, floorDb, gainDb, heard}`. The DO is the sole authority on burial.

Hard parts: (1) **cross-device attribution** — every phone hears every cough, so "who" is loudest-with-margin *relative to each phone's own floor*, or a phone in a pocket wins by being hot; (2) **clock sync** for 4s windows — ping/pong offset estimation against DO time, ±50 ms; (3) iOS audio unlock — the calibration tap must be the gesture that creates the AudioContext, plus a silent looping buffer and WakeLock to survive 60 s.

## v1 scope

- Exactly 4 players, one round, one 4-digit code, one hidden STATIC.
- 20s calibration, 60s silence phase, four 4s windows, 45s talk phase.
- Code entry from any phone; single win/lose screen; post-round noise timeline.
- TTS whisper via SpeechSynthesis through a calibrated GainNode.

## Out of scope

Multiple rounds, cumulative scoring, >1 STATIC, reconnect handling, avatars, spectators, Bluetooth speakers, any lobby beyond a room code.

## Risks & unknowns

- A genuinely loud room leaves no gap between floor and threshold — needs an explicit "too loud to play" refusal.
- Speaker leakage to neighbours could defeat privacy; may need a per-phone leak check.
- STATIC may be trivially obvious; the timeline must also surface innocent spikes.
- Burial may read as unfair rather than funny.

## Done means

Four phones, one room. When a player deliberately speaks a sentence during someone's window, that owner's phone reports *buried* within 200 ms of window close, the other three report their digits normally, and the TV timeline names the loudest phone at that instant. A silent room banks all four digits and wins.

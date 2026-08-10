## Overview
A 4–5 player game where the phones stop being controllers and become **microphones you deploy**. Each round begins with a placement phase: you walk your phone somewhere — the coffee table, the arm of the couch next to Dana, face-down on the kitchen counter — and leave it. Then the room performs a shared talking task on the TV for three minutes. Your phone scores you against a **secret acoustic objective** only you saw: *"pay me for every second my phone hears near-silence"*, *"pay me only while exactly one voice is audible near me"*, *"pay me for seconds where my phone is the QUIETEST phone in the room."* Most objectives reward silence *in your corner*, so the game is steering the conversation away from your own bug.

## Problem
Every mic party game measures one number for the whole room. But a room is not one acoustic space — it's five, and each phone genuinely hears a different one. That asymmetry is free, physical, unfakeable, and nobody has built on it. It also makes silence *spatial* rather than binary: you don't want quiet, you want quiet **here**.

## How it works
1. **Placement (30s).** Host TV counts down. Phones show only: your secret objective card and a live dB bar so you can audition a spot. You may not hold your phone once the round starts — an accelerometer check flags anyone who picks it up and freezes their scoring for 10s.
2. **The task (3 min).** The TV runs a plain talking prompt that genuinely requires the group to converse and reach one answer — v1: rank six items the room must agree on out loud. Nobody can just sit silent; the room loses shared points if the task is unfinished.
3. **Scoring, continuously.** Every phone streams a 4 Hz level summary (RMS dB + a crude one-voice/many-voice flag from short-time energy variance) to the server. The server evaluates each player's private objective per tick and banks points. **Phones show privately:** your objective and your running total. **The TV shows:** five anonymous bars rising at different rates, plus a heat-shaped room diagram — you can see *someone* is winning near the kitchen, which sends everyone drifting toward the kitchen to poison it.
4. **The tell.** Placement is public and permanent. If your phone is beside Marcus and your bar is climbing, Marcus is being too quiet, and now everyone knows to go talk at him.

## Technical approach
Socket.IO server over Tailscale Serve; host browser tab is a pure display. Data model: `Room {phase, tick, taskPrompt}`, `Player {id, objectiveId, bankedPoints, frozenUntil}`, `Tick {t, levels:{playerId→dB}}` kept in a 720-entry ring buffer (3 min × 4 Hz).

Each phone computes level locally in an `AudioWorklet` and posts `{t, dB, voiceFlag}` — ~50 bytes at 4 Hz, trivial bandwidth. The server timestamps on arrival and buckets into 250ms slots; objectives that compare across phones ("quietest phone") only resolve on full slots.

The genuinely hard part is **calibration, not sync**. Phone mics differ by 10+ dB and iOS applies automatic gain control that fights you. v1 does a 5-second room-tone calibration per phone and scores only *relative to each phone's own baseline*, never in absolute dB, and disables AGC via `getUserMedia({audio:{autoGainControl:false, echoCancellation:false, noiseSuppression:false}})` — which Safari honors inconsistently. Objectives are written to be robust to a sloppy 3 dB.

## v1 scope
- One 3-minute round, 4 players, three hand-written objective types.
- One fixed task prompt (rank six items aloud).
- Anonymous bars on the TV, no room diagram, no heat map.
- Accelerometer pick-up check: freeze scoring, no other penalty.

## Out of scope
Multiple rounds, drafting or trading objectives, real voice-activity detection or speaker ID, phone relocation mid-round, the room diagram, audio recording of any kind (levels only, never samples).

## Risks & unknowns
Biggest: phones on the same table may all hear roughly the same thing, collapsing the asymmetry — needs playtesting in a real living room, and may require a rule that phones must be at least two metres apart. Screen-lock kills the AudioWorklet on iOS; PWA needs a wake lock and a face-up placement rule, which conflicts with hiding your bar. Backgrounded Safari tabs throttle timers.

## Done means
Four phones placed in four spots, each calibrated to its own noise floor, streaming levels for three minutes; one player talking loudly in one corner visibly moves exactly the bars near that corner and not the others; final screen reveals each objective and the room can point at which placement won it.

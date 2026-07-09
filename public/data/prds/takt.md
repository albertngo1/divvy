## Overview
Takt is a cooperative rhythm-and-voice party game for 3–6 players on a shared host screen. The room becomes a factory line: a widget scrolls across the host screen at a fixed tempo, passing each player's 'station' in turn. When it reaches you, you must call out your station's operation — a single loud word — on the beat, and the *next* player depends on hearing you to know what they do. It's a work-song made of frantic verbal handoffs, in the Spaceteam / Devils-and-the-Details lineage. For groups who want escalating chaos and a shared chant.

## Problem
Rhythm party games are usually solo-with-a-scoreboard, and coordination games rarely have a *beat*. Takt fuses them: the tempo removes the option to pause and deliberate, and the verbal handoff means one silent worker breaks the whole line — you can't just watch your own phone.

## How it works
The **host screen (shared)** shows a conveyor with N station markers (one per player) and a widget bead advancing at the current takt (starts ~1 beat/sec). It shows the beat pulse and a defect counter — but NOT anyone's operation.

Each **phone (private)** shows: your station's current operation word for *this* widget (e.g. 'TORQUE', 'SEAL', 'PAINT'), and a listening cue for the operation you must *hear from the player upstream* before yours becomes valid. The twist that makes it coordination, not parallel play: your correct operation **depends on what the upstream player announced** — the widget carries state. If upstream shouts 'TORQUE', your phone resolves your op to 'SEAL'; if they fumbled or went silent, your phone shows 'ABORT' and you must shout that instead. Each phone verifies your callout with on-device speech recognition and reports pass/fail on the beat.

Miss your beat, say the wrong word, or fail to react to a botched handoff → a defect ships and the host counter ticks. The tempo ramps every few widgets. The room ends up chanting a call-and-response shanty under pressure.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{ taktMs, widgetIndex, stationOrder[], defects }`, `Widget{ id, stateFromUpstream }`, `Player{ station, currentOp, heardUpstream:bool }`. The server is the metronome: it emits authoritative beat ticks and advances the widget so all clients share one clock. Each phone runs the Web Speech API locally to match its expected word and sends `{playerId, beat, hit:bool}`. Hard part: a single trusted tempo clock with sub-100ms alignment across phones despite jitter (server timestamps + client-side interpolation), plus speech recognition being fast and forgiving enough to fire within one beat in a loud room — fall back to a big tap-the-word button if ASR is unreliable.

## v1 scope
- One line, 3 players, one round of ~12 widgets, fixed→slightly-ramping tempo.
- 3 operation words + one 'ABORT' handoff rule.
- Host conveyor + beat pulse + defect count.
- ASR match with tap-button fallback.

## Out of scope
- Branching lines, multiple products, scoring leaderboards, difficulty tiers.
- Cosmetics, station-swapping between rounds.

## Risks & unknowns
- Web Speech API latency/accuracy in a noisy room may force the tap fallback, weakening the 'voice' claim.
- Cross-phone clock drift could make 'on the beat' feel unfair.
- Handoff dependency may be too subtle to read at speed.

## Done means
3 players on 3 phones can run one full line where a widget's operation at each station is correctly gated by the upstream callout, missed/botched handoffs register as defects on the shared screen, and a live playtest produces an audible call-and-response chant that speeds up. Verified in one real session.

## Overview

A single 4-minute round for 4 players plus a host screen. Everyone works a shared seating-chart puzzle that genuinely requires discussion. Everyone also holds a secret quota on how loud the room is allowed to get. Half the table is quietly filibustering; half is quietly trying to end the conversation.

## Problem

Games that punish talking usually just make players sit still, which is boring. This one makes speech both the only tool and the tracked resource, so the tension is inside every sentence you decide to say — and the natural counter-move, "can everyone stop rambling," is itself a violation.

## How it works

**Shared host screen:** eight guests around a table, draggable into eight seats. Two public gauges: QUIET CLOCK (seconds accumulated while the room sits below threshold) and NOISE TOTAL (running integral of decibels above it). Both only ever go up.

**Private, per phone:**

1. Two puzzle constraints, precise and textual — "Dana refuses to sit opposite Wren," "the two chemists must be adjacent." All eight constraints are needed; each is held by exactly one player and can only leave their head as speech.
2. Your Ordinance: a window on one gauge only. Either "QUIET CLOCK must finish between 90 and 130s" or "NOISE TOTAL must exceed 260." You never learn which gauge anyone else is watching.
3. Your own decibel share — the percentage of room noise attributed to you. Yours alone; you can only estimate others by ear.

At time, the room's seating is scored, then every phone privately labels each other player QUIET or LOUD. Points: ordinance window hit (3), each correct read (1), puzzle solved (2 for everyone), loudest single contributor revealed at the end (−2). That last penalty is the engine: the loud faction cannot just monologue, it has to launder noise through other people. Asking a question is the weapon.

## Technical approach

Socket.IO on a Node server behind Tailscale Serve, or a PartyKit Durable Object. Phones compute RMS locally at 10 Hz via `AnalyserNode` and emit a smoothed dBFS scalar — no audio ever leaves the device.

Data model: `Room {code, phase, gauges:{quietMs, noiseTotal}, players:[{id, name, constraints[2], ordinance, micFloor, gain, creditedFrames}], puzzle:{seats[8], placements[]}}`. The server is authoritative on both gauges and on all placements.

The hard part is attribution, not sync. Four phones in one room hear the same speaker, so room level must be the max across phones and each 100ms frame is credited to the argmax phone. Naive argmax flickers between equidistant players, so the current holder keeps the frame unless another exceeds it by 3 dB for 200ms. Calibration is 5 seconds of silence plus each player saying their name once, which sets per-phone floor and gain.

## v1 scope

- Exactly 4 players, one hardcoded 8-guest puzzle, 8 constraints, 2 each
- Two ordinance types only, one window each
- 4-minute hard cap, then a single private QUIET/LOUD ballot
- One results screen: gauges, per-player noise bars, window hit or missed

## Out of scope

Puzzle variety, more ordinance types, transcription or word detection, reconnects, more than four players, whisper-vs-shout gradations.

## Risks & unknowns

The round can collapse into total silence and a failed puzzle — puzzle points may need to outweigh a missed window. Ambient TV audio and pocketed phones corrupt attribution. Players may discover they can gesture constraints; keeping constraints long and relational is the mitigation, and if it fails the fix is timed constraint reveals rather than upfront ones.

## Done means

Four phones and one host tab complete a 4-minute round; the results screen shows per-player decibel share that matches what the room actually heard, at least one player's secret window lands, and at least one player is misread as QUIET while having driven a third of the noise.

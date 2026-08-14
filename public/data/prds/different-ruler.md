## Overview

A 4-player, one-window party game where the *entire game object* is a single boolean timeline of the room — sound / no sound — and each player is scored on a different summary statistic of it. For groups who like games that turn a physical constraint (shut up) into a strategy space. One 90-second round, then a reveal and an argument.

## Problem

Silence games almost always score one thing everyone shares: a talk budget, a dB ceiling, a quiet streak. Everyone wants the same silence, so the game collapses into "don't be the idiot who coughs." The itch: make silence *contested* without letting anyone say what they want, because saying it is the very act that damages it.

## How it works

The server maintains one canonical trace: 40 ms frames, SOUND or SILENT, unioned across all phones' mics. The host TV renders it live as a scrolling ribbon (black bars = sound, blank = silence) plus four bare, unlabeled payout bars that update in real time.

Each phone privately holds:
- **Your ruler** — one metric, in plain English. Longest unbroken silence (1 pt/sec). Number of distinct silences ≥ 1.5 s (4 pts each). Total silent seconds (1 pt/sec). Your *shortest* silence over 0.5 s (8 pts × its length).
- **Your line** — one short phrase you must say aloud once, or take −25.

Those rulers fight. The gap-counter needs interruptions. The longest-run holder needs a clean stretch. The shortest-gap holder is ruined by one quick breath between two utterances. Your mandatory line is your only actuator *and* your only tax: when you spend it decides everything.

The TV shows bars, never metric names. Watching someone's bar jump on a 3-second lull tells you what they hold — but probing costs, because your probe is a cut in the timeline everyone is scored on.

## Technical approach

Host tab + phone PWAs + PartyKit Durable Object. Phones run an AudioWorklet computing per-frame RMS and a zero-crossing voicing gate; raw audio never leaves the device. Each phone streams a 25 Hz packed bitmask of frame states with a device-local monotonic timestamp.

Data model: `Room{traceFrames: Uint8Array, players: {id, metric, line, lineSpoken, score}}`. The server owns the trace; clients only render it.

Hard part: one canonical trace from four unsynchronized, differently-sensitive mics. Lobby calibration captures each device's noise floor and sets a per-device threshold at floor + 9 dB. A host-emitted 1 kHz chirp at round start estimates each device's clock offset. Frames are unioned with a 200 ms hangover so breath pauses inside a sentence don't chatter into fake silences — that hangover constant *is* the game's balance knob.

## v1 scope

- Exactly 4 players, one 90-second round, no lobby chat
- 4 fixed rulers, dealt at random, one per phone
- One mandatory line per phone, fuzzy-matched on-device via Web Speech
- TV: ribbon + 4 unlabeled bars + countdown. That's it
- Reveal screen: rulers shown, final scores, no rematch button

## Out of scope

More than 4 players, multi-round scoring, speaker attribution (the trace is a union — nobody is blamed), custom rulers, spectator mode, any audio recording or playback.

## Risks & unknowns

Rulers may be unreadable from a bar, killing the deduction layer — mitigate by making payouts step, not creep. A dead-quiet room makes three of four rulers tie at max; the mandatory lines exist to prevent that, but four lines may not be enough friction. Phone-in-pocket muffling breaks the union.

## Done means

Four phones in one living room complete a 90 s round; the server trace matches a reference recording within 200 ms on ≥90% of transitions; at the reveal, at least two of four players correctly name another player's ruler.

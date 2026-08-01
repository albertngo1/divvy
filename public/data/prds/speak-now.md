## Overview

A 90-second cooperative interlock game for 3 players, host TV plus phones. A machine on the TV needs eight actuators fired in some workable order. You own two of them. You also privately hold two safety rules about actuators you cannot touch — and nobody can act without saying it aloud first, in time for a veto.

## Problem

The Spaceteam lineage is built on *shouting instructions*: I have information, you have the button. That loop is well mined. The inverse — I have the button, you have the objection — is barely touched, and it produces a totally different voice texture: not barked commands but announce-and-wait, the industrial "clear on three?" cadence of people who can hurt each other by accident.

## How it works

Each phone shows PRIVATELY:
- **Your two actuators** — big physical-feeling buttons, only you can fire them.
- **Your two interlocks** — plain-language rules about *other people's* actuators: "PUMP 2 must not fire while VALVE 6 is open." You cannot see the state your rule references; you only know the rule.
- A **HOLD** indicator that lights when the server's speech recogniser has heard an actuator name.

To fire, you say the actuator's name aloud. The server keyword-spots it across all three mics, opens a **1.2-second veto window**, and lights that name on every phone. Anyone whose private interlock is threatened must say "HOLD" inside the window. If they do, the actuator locks for 5 seconds and the room has to talk about why. If they don't — or if you fire *without* announcing — and an interlock is actually violated, the machine trips and you lose 15 seconds of clock.

The host TV shows the machine: eight actuators, current open/closed state, the progress meter, and the trip counter. It never shows any interlock rule. Rules only exist in three separate pockets, and the only way to combine them is out loud.

## Technical approach

Cloudflare Durable Object as authority; phone PWAs stream mic over WebSocket. Speech uses on-device `SpeechRecognition` where available with a **constrained keyword list** (eight actuator names chosen to be phonetically distant — AMBER, PUMP TWO, VALVE SIX — plus "HOLD"), falling back to a small server-side keyword-spotting model. Client sends `{keyword, clientTs, confidence}`; server normalises `clientTs` against measured RTT before opening or closing a veto window.

State: `actuators[{id, open, lockedUntil}]`, `players[{id, ownedActuators[], interlocks[{subject, condition}]}]`, `pendingAnnouncements[{actuatorId, openedAt, vetoedBy}]`.

The hard part is cross-talk: three open mics in one room means one person saying "HOLD" is heard by all three recognisers. The server dedupes by taking the earliest RTT-normalised hit within a 250 ms cluster and attributes it to the mic with the highest own-baseline-normalised energy — the same trick used for near-field attribution elsewhere. False HOLDs from bleed are the most likely thing to feel unfair.

## v1 scope

- 3 players, one 90-second round.
- 6 actuators (2 each), 3 interlock rules total, one fixed hand-authored puzzle.
- Fixed keyword list, no free speech understanding.
- Win = machine reaches 100%. Lose = clock or 3 trips.

## Out of scope

Procedural puzzle generation, difficulty tiers, more than 3 players, reconnects, rule rotation mid-round, scoring.

## Risks & unknowns

1.2 s may be far too tight for a human to parse a rule and object — needs playtesting, possibly 2 s. Keyword spotting under three-way shouting is the whole game and may simply not be accurate enough. Players may discover that announcing everything slowly and never firing simultaneously is safe but boring; the clock has to punish that hard enough.

## Done means

Three players finish one round in which at least one HOLD was correctly called during a real veto window and blocked a genuine interlock violation, with the vetoer attributed to the right mic.

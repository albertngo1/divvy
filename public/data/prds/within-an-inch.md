## Overview

A 90-second standing party game for four people in one room. Each phone is simultaneously a magnet (its speaker) and a magnetometer, so two phones brought within ~5-8cm of each other both register a sharp field disturbance. That mutual spike is the tag. Every player privately holds one person they must touch and one person they must never touch — and those are different people. The room becomes a churning, wordless chase around the furniture. For groups who want a sensor game that gets them off the couch without needing any position tracking, beacons, or camera.

## Problem

Room-as-board games usually need to know where people *are*, which means compass zeroing, seat indices, or acoustic ranging — all fragile setup before any fun happens. Meanwhile the strongest short-range signal a phone has is sitting unused: another phone's speaker magnet dominates the magnetometer at close range and falls off roughly as 1/r³, giving an almost binary "we are touching" event with zero infrastructure. Nobody plays with it.

## How it works

1. **Calibrate (5s).** Each player stands alone, holds still. The phone records its own baseline |B| and σ. Per-device sensitivity varies 3-5×, so everything downstream is in units of that phone's own σ.
2. **Assign.** Server builds a 4-cycle: A→B→C→D→A are TARGETs. Your TABOO is the player two steps away. So you hunt one person, are hunted by another, and must dodge a third.
3. **PRIVATE on your phone:** your target's name, your taboo's name, your own score, and a buzz whenever *any* contact registers on your device — never who caused it. That's the whole screen. Two names and a haptic.
4. **PUBLIC on the host TV:** a countdown, and an anonymous contact ticker (`CONTACT · 2s ago`, `SCRAMBLED`). No names, no scores, no arrows until the reveal.
5. **Play.** Reach your phone toward your target's phone. +3 for a target contact, −2 for a taboo contact. Because you feel every contact but can't attribute it, getting bumped from behind is genuinely alarming.
6. **Reveal.** Host draws the full contact graph and the cycle.

## Technical approach

Phone PWA + host browser tab + authoritative PartyKit / Durable Object room.

- **Sensing:** Generic Sensor API `Magnetometer` at 20-30Hz, raw µT vector. Rolling |B|; a contact candidate is `|Δ|B|| > 6σ` sustained ≥120ms with a 700ms refractory period.
- **iOS fallback:** no raw magnetometer. Use `DeviceOrientationEvent.webkitCompassHeading` — a neighbouring speaker magnet slews heading by tens of degrees, so detect heading *jerk* instead of field magnitude. Lower fidelity; v1 skips it.
- **Data model:** `Player {id, name, targetId, tabooId, score}`, `Spike {playerId, tServer, magnitude}`, `Contact {a, b, tServer}`.
- **Sync:** phones stream spike *events* only, never raw sensor data. Clock offset per phone estimated NTP-style via WS ping/pong at join. Server confirms a contact when exactly two players' spike windows overlap within ±250ms; three-way overlap is ambiguous and is discarded as `SCRAMBLED`.
- **The hard part:** false positives. A fridge, a laptop, a steel chair leg all spike a passing phone. The two-phone correlation requirement *is* the defence — a static anomaly only ever spikes one device. Tuning the σ threshold so the range is 5-8cm (intimate but not a collision) is the second hard part, and it varies by phone model.

## v1 scope

- 4 players, exactly one 90-second round
- Android Chrome only
- Fixed 4-cycle target/taboo assignment, names typed at join
- Host screen: timer, anonymous ticker, end reveal
- No sound, no lobby art, no rematch button

## Out of scope

iOS, 5+ players, multiple rounds, any anti-cheat for pocketing two phones, persistent scores, spectator view.

## Risks & unknowns

Magnet strength varies wildly across phone models (MagSafe arrays vs. weak budget speakers), so range may be asymmetric between two players. Threshold may land so tight that people clack phones together, which is both boring and expensive. Four people lunging at each other in a living room is a real physical safety note. iOS support may be unrecoverable.

## Done means

In a real living room with four Android phones: at least one target contact and one taboo contact are correctly attributed to the right pair by the server within 1 second, the host ticker shows them anonymously, the reveal names them correctly, and at least one playtester is observed physically backing away from someone without being told to.

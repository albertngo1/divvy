## Overview

**Through the Table** is a 3-minute deduction game for 4 people whose board is the actual furniture in the room. Phones lie face-down on tables, counters, couch cushions, shelves. When one phone buzzes, only the phones sharing a rigid surface with it feel the vibration through the wood. Each phone privately reports what *it* felt. Nobody can verify anyone else's. Then everyone gets one move.

## Problem

Hidden-information games invent their hidden information — a card, a role, a secret word. Here the hidden information is a physical property of the host's apartment that nobody, including the designer, knew in advance: which surfaces are mechanically coupled. The room stops being a venue and becomes the deck.

## How it works

**Setup (30s).** Host TV says: put your phone face-down somewhere in this room, not on another phone, at least an arm's length from someone else's. It also runs a 3-second stillness calibration on each device to learn its resting accelerometer noise floor.

**Ping round 1 (~20s).** The TV calls each player by name in turn: "AMY, buzzing." Amy's phone buzzes a 400ms burst. Everyone hears it — *who* buzzed is public. What is private is what each other phone's accelerometer registered. Your phone shows only one line, and only to you: **FELT AMY** / **nothing** / **maybe** (the ambiguous band near threshold, which exists on purpose). You now privately hold one row of a 4×4 adjacency matrix. Nobody holds the matrix.

**Talk + one move (60s).** Everyone reveals their secret objective to no one. Objectives conflict:

- *"Finish coupled to Ben, and NOT coupled to Casey."*
- *"Finish coupled to nobody."*
- *"Finish coupled to at least two people."*

You may say anything. You may claim you felt Casey when you didn't. You may move your own phone exactly once, whenever you like, and everyone watches you do it — but they don't know what you're trying to achieve, so the move is a public act with a private meaning. The comedy is entirely in the sentence "I definitely did not feel that" said by a person whose phone is nine inches from yours on the same slab of oak.

**Ping round 2 (~20s).** Same protocol, final positions. The server scores objectives against round-2 data only, and the TV reveals both matrices side by side — including every gap between what people claimed and what the wood actually did.

Passing one phone around cannot produce this: the whole game is four simultaneous, physically distinct, mutually unverifiable sensor views of one shared event.

## Technical approach

Host tab + phone PWA + authoritative WS server (Socket.IO over Tailscale Serve is fine — everyone's on the same LAN anyway).

- Sense: `DeviceMotionEvent` at ~60Hz (iOS needs `requestPermission()` behind a tap in the lobby). A 400ms buzz aliases badly at 60Hz, so don't try to detect frequency — detect *envelope*. Compute rolling variance of acceleration magnitude over 100ms windows; a hit is `var > k × calibratedFloor` sustained ≥150ms inside the slot.
- Actuate: `navigator.vibrate(400)` on Android. **iOS Safari does not support the Vibration API** — fallback is a 90Hz sine at full output through the speaker while face-down, which couples into the surface acceptably on hard tables and poorly on cushions (which is, conveniently, the signal we want).
- Sync: slots are 1500ms, server-scheduled, ±100ms tolerance — far looser than any TDOA game, so plain WS timestamps with a one-time offset estimate suffice. This is the easy part.
- Data model: `Room{players[], surfaceGuesses, objectives[], pings:[{slot, emitter, reports:{pid:{peak, verdict}}}]}`. Phones send raw peak variance, not a boolean; the server owns thresholding so it can widen the *maybe* band per device.
- Hard part: threshold portability. A flagship on a glass coffee table and a three-year-old budget phone on plywood produce wildly different numbers. Per-device noise-floor calibration plus a deliberately generous ambiguous band turns that flakiness into the game's bluffing surface instead of a bug.

## v1 scope

- Exactly 4 players, one room, one game: setup → ping → talk+move → ping → reveal.
- Three objective types, dealt at random.
- Android-first; iOS uses the 90Hz speaker fallback.
- Host TV shows: whose slot it is, a countdown, and the final two matrices. No scores across games.

## Out of scope

More than 4 players, multiple moves, phones stacked or held, inferring surface identity by name, any persistence between sessions, spectator view.

## Risks & unknowns

- A room with only one usable hard surface produces a fully-connected graph and no game. Mitigation: setup step refuses to start unless round-0 shows ≥2 disconnected clusters.
- Footsteps, someone's leg against the table, and a passing truck all read as hits. Mitigation: only count energy inside the 400ms slot, and discard slots where ≥3 phones spike simultaneously with no emitter.
- iOS speaker fallback may be too weak, making iPhone users permanently "uncoupled."
- 60Hz motion sampling is throttled in some mobile browsers when not in an active gesture.

## Done means

In a real living room with 4 phones on ≥2 surfaces, ping round 1 produces an adjacency matrix that matches ground truth (verified by hand: phones on the same table register, phones across the room don't) on ≥80% of the 12 directed pairs, a player can move their phone and visibly flip at least one edge in round 2, and objectives resolve automatically on the TV without anyone tallying anything.

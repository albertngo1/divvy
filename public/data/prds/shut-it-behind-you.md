## Overview

A cooperative 4-player game for a real apartment with real doors. The house is the input device: closing a door is a keypress, and the group has one round to enter a 5-event combination that satisfies four private rules nobody may see. For people who own a hallway and a bad idea.

## Problem

Every phone party game treats the room as a place to sit. But a house already has a dozen physical actuators — bedroom door, bathroom door, cupboard, fridge — each producing a distinct acoustic thump that phones can detect. Nobody has made the building itself the controller, and nobody has built a party game on the one thing distributed systems find hardest and drunk people find funniest: not doing two things at the same time.

## How it works

**Calibration (30 s):** everyone stands in the living room; the host calls three practice closes so each phone learns its noise floor and the amplitude range of a big door versus a cupboard.

**Your phone (private):** one rule you must not read aloud verbatim — e.g. *"event 3 must be a small door,"* *"no player makes two events in a row,"* *"at least 10 seconds between every event,"* *"exactly one event must happen while you are the only person out of the living room."* Below it, **your own event log** — the thumps *your* phone heard, with amplitudes.

**The TV (shared):** five empty slots, filling in as the host server commits events, plus a fault light.

The twist is that the logs disagree, honestly and physically. Standing in the bathroom, your phone hears the bathroom door as a wall-shaking event and the front door as nothing. So the group's shared picture of what just happened has to be spoken into existence by four people in four rooms shouting through walls — and while you are away making a move, you cannot see the TV. **Acting blinds you.**

Two closes within 3 seconds merge into one unreadable smear: the slot burns and the fault light comes on. Three faults and the round is lost. So the real game is distributed mutual exclusion, run by yelling "GOING" down a hallway and hoping nobody yelled at the same instant.

## Technical approach

Host tab + phone PWAs + authoritative room object (PartyKit / Durable Object, or Socket.IO over Tailscale Serve on a home box). Each phone opens `getUserMedia`, runs a 60–180 Hz bandpass and an envelope follower in an AudioWorklet, and emits `{thump, t_client, peak_db}` on a threshold crossing with a 1.5 s refractory window. Clocks are synced with a Cristian-style ping loop at join (±20 ms is plenty). The server clusters reports within a 250 ms window into one canonical event, classifies size by the *maximum* amplitude across phones, appends to the log, and broadcasts only the committed sequence.

Data model: `Room{ rules[], targetSpec, events[], faults }`, `Player{ id, rule, localLog[] }`.

The hard part is detection, not sync. A door thump, a dropped shoe and a laugh are all broadband transients; false positives destroy the round. The barometer would be far cleaner — a closing door produces a genuine 0.1–0.5 hPa pressure step — but no browser exposes a pressure sensor, so v1 uses the mic and a native shell stays a stretch goal.

## v1 scope

- 4 players, one round, 5 slots, one rule each drawn from a fixed set of 6
- Two door sizes only: big (room door) / small (cupboard)
- Fixed 3 s collision window, 3 faults and you lose
- TV shows slots and faults; phone shows rule and own log
- Win screen, no scoring, no rematch

## Out of scope

Identifying *which* door. Attributing an event to a player. Barometer path. Rooms with no interior doors. Rule authoring.

## Risks & unknowns

Open-plan homes may lack usable doors. Mic false-positive rate on laughter and footsteps is the make-or-break number — measure before designing anything else. Neighbours. Whether four rules is too many to satisfy blind in one round (likely tune to three).

## Done means

Four phones in a real two-bedroom flat: five door closes are committed to the TV in order, two deliberate simultaneous slams register as exactly one fault, one player reports a thump that a player two rooms away never saw, and the group wins or loses on whether all four private rules held.

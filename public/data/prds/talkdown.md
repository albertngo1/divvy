## Overview
Talkdown is a 4-player cooperative voice game: one Pilot is flying blind, and three Controllers each hold a different fragment of the approach chart. The Pilot must land the plane in a handful of discrete legs using nothing but the Controllers' spoken instructions.

## Problem
Spaceteam's joy is shouting instructions that live on someone else's panel. Talkdown adds asymmetry and a single-attention bottleneck: the Pilot can only act on ONE clear instruction at a time, so the Controllers — who each know only part of the answer — have to self-organize their voices under a moving clock, not just yell everything at once.

## How it works
The host screen shows a simple 2D approach corridor with the plane sitting at the start of a leg and a soft per-leg timer. Each leg needs three values: a HEADING, an ALTITUDE step, and a HAZARD check ("clear" or "go-around").

Privately, per phone:
- **Pilot's phone**: a wobbly artificial horizon + altimeter that reads plausibly but gives NO chart data, plus one big EXECUTE button. The Pilot has zero access to the correct values.
- **Controller 1**: the heading table for each leg. **Controller 2**: the altitude profile. **Controller 3**: the hazard map (which legs are no-go).

No single controller can talk the plane down; the correct heading, altitude, and hazard call live on three different phones. The Pilot must gather all three by voice, read them back, and hit EXECUTE. Correct + complete → the plane advances a leg on the host screen. Missing a value, a wrong readback, or executing on a no-go leg → the plane drifts off-corridor (red flash); three drifts = missed approach, reset. Because the Pilot can only process one voice cleanly, Controllers who all talk at once cause a garbled leg (the host screen shows STATIC and no value registers), teaching them to take turns.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Leg{heading, altitude, hazard}[]`; `Player{role, chartFragment}`; `Game{currentLeg, drifts, phase}`. Chart fragments are generated server-side per game and pushed privately to each Controller; the Pilot never receives them. The Pilot's readback is confirmed manually (Pilot taps the value they heard from a small multiple-choice built from nearby distractors) so v1 needs no speech recognition — voice stays human-to-human, the server just arbitrates the EXECUTE. The genuinely hard part is the single-attention model: detecting "too many talking at once" without mics. v1 fakes it cheaply with a per-leg soft timer + requiring the Pilot to enter all three values before EXECUTE, so overlap naturally causes mistakes; a later version could add hold-to-talk floor control with server collision detection.

## v1 scope
- 4 players fixed (1 Pilot, 3 Controllers), 4 legs, one corridor.
- Pilot confirms each value via 3-option tap (no ASR).
- Drift-on-error, 3 drifts = reset, land = win screen.

## Out of scope
- Speech recognition, hold-to-talk floor control, collision audio.
- Continuous flight physics, multiple approaches, difficulty tiers.
- Role rotation, scoring, reconnection.

## Risks & unknowns
- Without mic-based collision, does the "one voice at a time" tension actually emerge, or do people just narrate calmly?
- Chart-fragment content must be readable-aloud and unambiguous (heading homophones like "two-fifty" vs "two-sixty").
- Pilot's tap-to-confirm could feel like a quiz rather than flying.

## Done means
Four phones join into distinct roles, the three chart fragments are provably private (Pilot's phone shows none), and one session lands the plane across four legs on the host screen driven entirely by spoken instructions, with a wrong readback visibly drifting the plane.

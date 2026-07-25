## Overview

Hard Iron is a 3–4 player room-scale hunt for a *location*. One player secretly "assays" a spot in the real room; the others hunt it using nothing but their own phone's compass error at that spot. It's for a living room with a TV, four people willing to stand up, and a house that contains a refrigerator.

## Problem

Sensor party games use the compass as a pointer — aim at a thing, claim a sector. But a phone compass's most interesting property is that it *lies*, and it lies differently in every square foot of a real building: steel studs, a fridge, a subwoofer magnet, a laptop, a radiator. That magnetic texture is free, unauthored level design that differs per house. Nobody plays it. Also, most "room as board" games secretly need indoor positioning, which doesn't exist; this one needs none.

## How it works

**Zero (20s).** Everyone crowds by the couch, points their phone at the TV, taps ZERO. The server stores each device's heading at that shared reference point. This is per-device — absolute headings are never compared.

**Assay (15s).** One player walks anywhere in the room, faces the TV, holds still 3s. Their phone samples heading and computes deviation from its own couch reference. **Privately** their phone shows: "ASSAY LOCKED — 7.2° left, steady." The host screen shows only a lock light and the phrase "the assay is sealed." They return to the couch and say nothing.

**Seek (90s).** Three seekers sweep the room simultaneously. Each phone **privately** shows only a five-rung warmth ladder — COLD / COOL / WARM / HOT / BURNING — computed from |my deviation − assay|, plus a "face the TV and hold still" nag that forces the comically legible ritual of stopping, squaring up to the television, and squinting. The host screen shows three anonymous sweep dots pulsing when a phone is sampling, and nothing about warmth.

One scalar per seeker is not enough: several spots in any room match a given deviation. So seekers talk — "I'm burning by the bookshelf, someone check the fridge, is yours hotter than mine?" — and split the floor between them. That negotiation is the game.

**Claim.** A seeker taps CLAIM and stands still. The Assayer walks over and taps YES or NO on their own phone: the human is the ground truth, so no positioning system is required. The host screen replays both deviation traces side by side.

## Technical approach

Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve for a home LAN).

Sensing: `DeviceOrientationEvent` — `webkitCompassHeading` on iOS (needs an HTTPS origin and a tap-gated `requestPermission`), `alpha` with `absolute: true` on Android. Sample 10 Hz; gate readings on a stillness test from `DeviceMotionEvent` variance; median-filter over a 1.5s window.

Data model: `Room { phase, players[{id, name, refHeading, lastDeviation, still}], assay{playerId, deviationDeg, sigma}, claim }`. Phones send 5 Hz `{deviation, still}` deltas; the server owns phase transitions and fans out only what each surface is allowed to see — warmth to the owning phone, aggregates to the host.

The genuinely hard part is cross-device comparability. Two phones at the same spot report different absolute headings because of hard-iron offsets, differing calibration state, case magnets, and different tilt-compensation. Mitigations: compare only each device's delta from its own zero; add a pregame **witness spot** (everyone samples one shared second location) so the server can fit a per-device scale factor and reject a device whose delta disagrees wildly; and run a 10s room survey that measures deviation spread and warns "this room is magnetically boring — try starting near the kitchen."

## v1 scope

- 4 players, exactly one round, one assay, one claim
- Three phases: zero → assay → seek; hard 90s timer
- Warmth as 5 discrete rungs, never a number
- Host screen: phase banner, lock light, anonymous sweep pulses, reveal
- Win/lose only, no scoring
- One room, one host tab, no reconnect handling

## Out of scope

Raw µT magnitude, multiple rounds and scoring, teams, floor plans or maps, a decoy-planting saboteur role, spectators, cross-session persistence, Bluetooth/UWB ranging.

## Risks & unknowns

A wood-frame room with no appliances may show <2° of spread, which kills the round — the survey must gate this. iOS compass heading can lag or need a figure-8 wiggle. Tilting the phone changes tilt-compensated heading, so the stillness gate has to be strict enough to be fair without being annoying. Compass drift over 90s could shift the assay reference.

## Done means

Four phones on one LAN. Two phones standing on the same spot report warmth rungs within one rung of each other, ten trials out of ten. Three seekers who cannot see each other's screens verbally converge and claim within arm's reach of the true spot in at least 2 of 3 playtests, and the Assayer's YES/NO tap ends the round cleanly every time.

## Overview

A 4-player surveying game for people standing in a real, slightly crooked room. Phones are spirit levels plus compasses; the TV assembles their readings into a contour map of a room nobody knew had a shape. For groups who like the moment a party game tells them something true about the building they're in.

## Problem

Accelerometer party games are wave-the-phone dexterity tests. None of them ask the phone to *measure a fact about the room*. Meanwhile every floor, shelf, and IKEA table in the house is off level by 0.3–2°, which is invisible to the eye and trivially detectable by a $200 phone. Second itch: measurement games have no drama unless two measurements can disagree — and disagreement requires two devices.

## How it works

Setup (30s): the host types 6 station names into the TV — "coffee table", "floor by the window", "kitchen counter", "top of the bookshelf". They appear as labeled pins on a crude top-down room grid the host drags into rough position.

Calibration (10s): every phone is laid, in turn, on the *same* reference surface (the TV stand). The server stores each device's accelerometer zero-offset. Residual disagreement after this is real, and it's the game.

**Survey (90s, all four at once):** each phone privately shows **3 of the 6 stations** — its own assignment, nobody else's. Exactly one station is secretly dealt to two different phones. At a station you lay the phone flat, screen up, and hold still for 2s. The phone captures the low-passed gravity vector from `devicemotion` and the heading from absolute `deviceorientation`, and privately renders a card: *"Coffee table — 0.8° downhill, toward the TV."* Only you ever see your arrows.

**The TV stays deliberately dumb during the survey:** anonymous pips filling in, a countdown, nothing else. No values, no arrows, no names. So the talking is people describing readings out loud, badly.

**Bet (30s, private):** each phone picks one grid cell — where a marble released at room center would come to rest — and names one station it thinks was mis-measured.

**Reveal:** the TV interpolates all 12 readings into an arrow/contour field, animates a marble rolling downhill, then spotlights the contested station showing both readings side by side as **A** and **B**, unattributed. Points for the correct resting cell, bonus for fingering the contested station, and the two contesting players split a penalty scaled by how far apart their readings were.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object. Model: `Room {code, phase, stations[{id, label, xy}], assignments{playerId→stationIds[]}, offsets{playerId→vec3}, readings[{playerId, stationId, tiltDeg, headingDeg, tMs}], bets{}}`.

Sync is easy on purpose: phones stream nothing. A reading is one committed message on the 2s hold; the DO broadcasts only pip-count deltas. The hard part is **sensor trust**. iOS needs `DeviceMotionEvent.requestPermission()` behind a user gesture on HTTPS; Android axis conventions and `alpha` reference frames differ across vendors; magnetometers drift badly near speakers and fridge motors, which corrupts *direction* even when *magnitude* is fine. Mitigation: the shared-surface calibration above, a heading sanity check ("point the top edge at the TV") per phone, and discarding any reading whose gravity magnitude strays from 9.81 by >0.3 (i.e., you didn't actually hold still).

## v1 scope

- 4 players, 1 round, 6 host-typed stations, 3 per phone, 1 contested
- Marble sim = naive steepest descent over a 6-point RBF interpolation
- One bet per player, no lobby persistence, no saved maps

## Out of scope

>4 players, camera/AR overlays, true room geometry, multi-round, phone-in-hand readings, automatic station detection.

## Risks & unknowns

A genuinely level room is boring — mitigate by rendering tilt at 5× with an honest "exaggerated" label. iOS permission friction burns the first 20 seconds. Players will hold the phone in their hand instead of laying it down; the gravity-magnitude gate has to reject that loudly and legibly.

## Done means

Four phones, six stations, all twelve readings committed inside 90 seconds; the TV renders a contour field and a marble path within 2 seconds of the last reading; the two contested readings differ by an amount visible on screen; and one playtest group spends real time arguing about whose phone lied.

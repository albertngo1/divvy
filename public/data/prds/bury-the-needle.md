## Overview

A 4-player hidden-role game for any room with a fridge, a radiator, a TV, or a laptop in it. Three players are Prospectors sweeping the room for magnetic anomalies; one is the Salter, carrying a concealed fridge magnet and manufacturing fake ones. The board is the building's actual ferrous skeleton, which nobody can see and everybody can measure.

## Problem

Compass games all do the same thing: point at a heading. But the compass's *failure* is far more interesting than its success — near steel it reads confidently wrong, and every room has an invisible geography of dead spots nobody has ever looked at. Meanwhile social deduction almost always runs on words. The itch: a deduction game where the evidence is physical and the liar's tell is that his evidence won't sit still.

## How it works

1. **Sweep:** stand at a spot, hold the phone flat, rotate your body ~90 degrees over 2 seconds. The phone compares compass heading delta against gyro-integrated rotation (`rotationRate.alpha`). If gyro says 90 and compass says 130, there is steel next to you. That disagreement, in degrees, is the **distortion score**.
2. **Private view:** your own live needle and distortion score; your assay card ("log 2 anomalies above 25 degrees"); a Log button that pins the anomaly to a named landmark you pick from a list the group agreed on (FRIDGE / TV / SOFA / DOOR / WINDOW / KITCHEN).
3. **The Salter's private view:** the same needle, plus a hidden proximity meter showing how hard their pocketed magnet is currently hitting the *nearest other phone*, plus their objective: get 3 fake anomalies onto the board.
4. **Host TV:** the landmark list with anonymous pins as they're logged, strength shown, logger hidden. Plus a live room-wide distortion bar. Nobody learns who logged what until reveal.
5. **Re-assay:** each Prospector may spend one re-assay on someone else's pin — go stand there and sweep. Real steel reads the same strength forever. A carried magnet is gone, and the pin turns red on the TV.
6. **Vote:** 90 seconds, then one vote.

## Technical approach

PartyKit Durable Object, authoritative. Model: `Room {code, landmarks[], pins[], phase}`, `Pin {landmarkId, strength, loggerId(secret), reassays[]}`, `Player {id, role, assayCard, distortion}`. Phone PWA reads `webkitCompassHeading` (iOS) or `deviceorientationabsolute.alpha` (Android) for heading, and `devicemotion.rotationRate` for the gyro reference. Sweep detection runs entirely client-side: integrate |rotationRate.alpha| dt, integrate unwrapped heading delta, ratio them. Only the resulting scalar plus a landmark id goes over the wire — 4 messages per sweep, not a stream, so sync is trivially easy here.

The genuinely hard part is not networking, it's signal: heading noise varies hugely by device, and a fast sweep aliases badly. Mitigations — enforce a 1.5-3.0s sweep duration window (reject and re-prompt otherwise), require 60-120 degrees of gyro rotation, and take the median of three sub-sweeps. Calibrate per-device on an agreed "clean" spot (middle of the room, arms out) and report distortion relative to that baseline, never absolute.

## v1 scope

- 4 players (3 Prospectors, 1 Salter), one 90s round, one vote
- 6 hardcoded landmark names, group picks which physical objects they map to
- One re-assay per Prospector
- Host: pin board, room distortion bar, reveal screen
- Salter supplies their own fridge magnet; setup screen says so

## Out of scope

Multiple rounds, scoring across games, more than one Salter, a real 2D room map, automatic landmark discovery, anything involving the magnetometer's raw µT magnitude.

## Risks & unknowns

Biggest unknown: whether a typical living room has enough ferrous variation to produce a legible signal, or whether every spot reads 8 degrees of noise. Needs a 20-minute probe with two phones before writing any game code. iOS exposes no raw magnetometer, which is exactly why this uses heading-vs-gyro disagreement — but that also means Android and iOS may need different noise baselines. A strong enough magnet held right against a phone can wreck the reading entirely rather than shift it; cap distortion display at 90 degrees so the Salter can't just blow the meter out.

## Done means

Four real phones, one kitchen-adjacent living room: the TV shows at least 4 logged pins, the fridge and the TV both reproduce their strength across two different players' sweeps, at least one Salter-carried pin fails re-assay and turns red, and the group votes out the Salter for a reason they can point at.

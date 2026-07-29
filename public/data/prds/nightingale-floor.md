## Overview

Nightingale Floor turns a living room into the chirping floors of Nijō Castle. Four players each plant their phone somewhere in the room as an acoustic tripwire, then all move at once for ninety seconds, each completing a private errand while the sensor grid listens. Named after floorboards designed to sing under an intruder's weight. One round, about five minutes including the argument afterward.

## Problem

Phone party games have players sitting on a couch staring at a screen; the room is scenery. And enforced-silence games are enforced by a human shushing, which is nagging, not a rule. A microphone is an indifferent, unbribeable referee — and once phones are planted rather than held, the room's furniture, floor type, and geometry become real game state.

## How it works

**Plant (30 s).** Each phone privately shows its owner a THRESHOLD drawn from a range — tight, medium, or loose — and the instruction to place the phone screen-down on a hard surface at least two meters from where they're sitting. Everyone plants simultaneously. You can see where the other phones physically ended up; you cannot see how touchy they are. You planted yours knowing.

**Errands (private).** Each phone, before planting, showed its owner three micro-tasks: "take the middle book off the shelf," "get a spoon from the kitchen drawer," "sit in a chair nobody has sat in." One task per player is deliberately noisy — open a crinkling bag, drag a chair.

**Round (90 s).** The host screen shows four numbered nodes and a floor-level trace, nothing else. Any planted phone detecting a transient above its private threshold blooms its node on the TV — but the TV never says whose sensor it is or who tripped it. Sustained voicing over 400 ms is a hard alarm worth five trips; whispering is genuinely viable, conversation is ruinous. At T+45 s the host plays a five-second cover surge with a visible countdown, and all four players predictably lunge at once, which is the funniest part.

**Score.** Team: errands completed (self-declared, group-confirmed aloud after time) minus one per trip. No in-round attribution. Afterward each phone privately shows *only its own* sensor log, so the post-round argument runs on asymmetric evidence.

## Technical approach

PartyKit Durable Object; host tab plus phone PWAs. On-device detection in an AudioWorklet: 20 ms hop, short-term energy over long-term average (spectral-flux onset detector); voicing via band energy 200–3500 Hz plus an autocorrelation peak above 0.4 sustained 400 ms. Phones send only `{t, magnitude, kind}` events plus a 2 Hz floor summary. Model: `Room{phase, t0, coverWindow, trips[]}`, `Player{id, threshold, errands[3], planted}`.

The hard part is two-fold. Clock sync: blooms must render on the TV within ~150 ms of the real sound, so each phone estimates offset by round-trip probes at join and re-probes every 15 s. And correlated detection: one thump on a shared coffee table trips all four phones, which would look like four trips. The server clusters events within a 120 ms window into a single trip, but the window has to survive phones on different surfaces with different propagation and buffer latencies.

## v1 scope

- 4 players, one 90-second round, one hardcoded errand deck of 12 tasks
- Plant flow, onset + voicing detection, TV bloom nodes, one cover surge, team score, private per-phone log reveal

## Out of scope

- Multiple rounds, per-player attribution, difficulty tiers, errand verification, rejoin, phones held in hand

## Risks & unknowns

- Threshold ranges may not transfer between a carpeted apartment and a tiled kitchen
- Screen-down on soft furniture could deafen a sensor and break the grid
- Clustering may over-merge two genuinely separate players' noises

## Done means

Four phones planted around one real room; a player crosses it, opens a drawer, and exactly one bloom appears on the TV within a beat of the sound — while a second player's whispered question produces nothing and their spoken sentence instantly costs five.

## Overview

A one-round bidding game for 3 players sitting around one table with a tablecloth on it. On GO, everyone simultaneously spins their own phone flat on the table. The gyroscope privately counts your revolutions — that's your bid. The compass records where the phone comes to rest — and only a bid that lands inside your own secret arc of the room counts.

## Problem

Bidding games make you commit a number in the abstract. Here the number is something you physically produce with your wrist, and producing a big one destroys your control over the other half of the outcome. The tension is mechanical, not arithmetical: a gentle spin lands where you want and bids nothing; a hard spin bids big and lands anywhere. And because three phones spin on one table, they collide — you can wreck a rival's landing at the cost of your own.

## How it works

1. Phones lie face-up on the cloth. Each phone PRIVATELY shows one secret target arc, described in room terms: "come to rest pointing toward the TV," "toward the kitchen doorway," "toward the window." Nobody else learns your arc.
2. Host TV counts 3-2-1-GO. All three spin at once.
3. During the spin each phone PRIVATELY shows a live turn counter climbing — 2.1, 4.8, 7.3 — visible only to its owner, and unreadable to anyone else in the clatter.
4. When a phone rests, the host TV PUBLICLY draws its arrow on a top-down table diagram. Everyone can see where each phone points; nobody can see the arcs or the turn counts.
5. Brief table talk ("I nailed mine"), then reveal: arcs light up, invalid landings grey out, and the highest turn count among valid landings wins the round.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object; Socket.IO over Tailscale Serve works equally well.

- Sensing: `DeviceMotionEvent.rotationRate.alpha` (vertical axis for a flat phone), integrated over the spin for total degrees; rest detected when |rotationRate| < 5°/s for 400 ms; final bearing from `webkitCompassHeading` / absolute alpha sampled 1 s after rest so a neighbouring phone's speaker magnet has stopped skewing it.
- Server state: `{round, phase, players: {id, arc:[lo,hi], turnsRaw, deviceScale, finalHeading, valid, restAt}}`. Phones stream compact motion summaries at 20 Hz; the server is authoritative on rest detection and validity so a phone can't claim a spin it didn't do.
- The genuinely hard part is that spin counts are not comparable across devices. Sample rates differ (30 vs 60 Hz), and MEMS gyros clip near 2000°/s — a hard table spin exceeds that, so the integral silently under-reports on some phones. Mitigation: one calibration spin per phone at join to fit `deviceScale`, plus scoring in coarse bands (1–3 / 4–6 / 7+ turns) so hardware never decides the winner; ties break on validity margin.
- iOS needs a tap-gated `DeviceMotionEvent.requestPermission()` during the lobby.

## v1 scope

- 3 players, one spin, one winner. No rounds, no running score.
- Three fixed arcs entered once by the host ("TV / kitchen / window") at setup.
- Host TV: table diagram, three arrows, reveal screen.

## Out of scope

Multiple rounds, sabotage scoring for collisions, 4+ players, replays, arc auto-detection, reconnect mid-spin.

## Risks & unknowns

- **Phones sliding off the table.** The single biggest adoption blocker; v1 hard-gates on a "put a cloth or towel down" confirmation screen and refuses to start without it.
- Collisions may read as chaos rather than strategy at 3 players; may need a bigger table or a spin-in-your-own-quadrant rule.
- Cheating by hand-turning slowly: server flags any spin whose peak rate never exceeded 300°/s, and any "rest" followed by fresh motion within 2 s.

## Done means

Three phones on a covered table spin on GO; within 2 s of the last one stopping the TV shows three arrows matching reality to the naked eye, the reveal names exactly one winner, and a replay of recorded motion traces reproduces the same winner.

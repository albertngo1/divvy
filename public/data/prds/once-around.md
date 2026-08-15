## Overview

A 3-minute, get-off-the-couch party game for 4–6 people in one real living room. Every player's phone privately assigns them a Mark — one other player — and the only way to score is to physically walk a full circle around that person. The TV is the scoreboard and the courtroom; your phone is a gyroscope, a secret order, and a bluff button.

## Problem

Phone party games are seated. The few that get people up use the room as scenery, not as a board. Meanwhile every phone contains a gyroscope that can measure the one thing a body does in a room that nothing else captures: *going around something*. Encirclement is a real, legible, funny physical act, and no party game scores it.

## How it works

Marks are dealt as a single hidden cycle, so everyone hunts and is hunted, and nobody knows their hunter.

**Your phone (private):** your Mark's name; a live arc dial showing accumulated heading (0°→360°) that resets to zero if you stand still for 3 seconds; a CLAIM button that lights up the instant your phone registers a closed loop.

**The TV (shared):** names, scores, a round clock, and an anonymous ticker — "SOMEONE CLOSED A LOOP" — with no name attached.

When your phone detects a closed walking loop, you tap CLAIM and privately name who you think you enclosed. Claims are stockpiled silently. At the buzzer the TV replays each claim aloud — "Priya claims she went around Dev" — and the room votes. Confirmed claim: 3 points. Voted-down claim: −2.

The game's engine is that **witnessing is scarce**: everyone is busy walking their own orbit, so nobody actually watched. Fake loops are cheap and often survive. The counter-play is architectural: stand with your back to a wall, wedge into a corner, sit behind the sofa. Now you cannot be circled, and a claim against you is obviously false — but a parked player cannot close their own loop either. Corners are safe and worthless. The room's furniture becomes the terrain.

## Technical approach

Host browser tab + phone PWAs + one authoritative room object (PartyKit / Cloudflare Durable Object) over WebSocket. Phones read `DeviceMotionEvent.rotationRate.alpha` at ~60 Hz (iOS needs `requestPermission()` behind a tap on the join screen) and integrate yaw locally. Steps come from a bandpass + peak detector on `accelerationIncludingGravity`. Loop detection fires when |∫yaw| ≥ 330° within a continuous walking window of ≥8 steps and ≥5 s — the step gate is what separates a real orbit from spinning on the spot.

Only events cross the wire: `{join}`, `{loop_closed, t}`, `{claim, targetId}`, `{vote}`. No raw sensor streaming, so bandwidth is trivial.

The genuinely hard part is not sync — it's **honest loop detection on cheap gyros**. Yaw drifts 1–3°/s on some Android devices, enough to manufacture phantom loops in 2 minutes. Mitigations: reset the integrator on every stillness gap, high-pass the drift estimate during known-still windows, and cap claims to one per detected loop so drift buys nothing.

## v1 scope

- 4 players, one 3-minute round, one Mark each
- Phone: Mark name, arc dial, CLAIM button
- TV: scores, clock, anonymous loop ticker, end-of-round claim replay
- Voting by show of hands, tallied on phones
- No accounts, no rematch, no audio

## Out of scope

Automatic verification of who was enclosed. Indoor positioning. Teams. Multi-round tournaments. Any attempt to draw the room's map.

## Risks & unknowns

Gyro drift by device (measure across 6 phones before building UI). Whether people will actually walk — needs a floor with a walkable loop. Whether false claims are too easy; the −2 penalty may need to be −4. Small rooms may make every orbit look like every other orbit.

## Done means

Four phones, one living room, one round: a player walks a lap around a friend, their phone fires CLAIM within 1 second of completing the circle, the TV shows an unnamed loop event, and at the buzzer the room votes the claim up while a spun-in-place fake never fires at all.

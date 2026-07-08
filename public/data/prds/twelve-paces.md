## Overview
Twelve Paces is a 2-player duel (with a spectating crowd on the TV) built on the phone's most underused trick: dead reckoning from the pedometer and compass. Two duelists stand back-to-back in the middle of the room. On the count they each walk a *secret* number of paces in a direction of their choosing, turn, and "fire" by aiming their phone back at where they believe the opponent now stands. Closest aim wins. It's for a group that wants a tense, physical, single-elimination bit — a bracket of duels.

## Problem
Every motion game measures *your own* movement and shows it back to you. Nobody weaponizes the fact that a phone can estimate its position blind — and that YOU can't see the other phone's estimate. The fun is the accumulating error and the bluff: you're aiming at a memory, not a target.

## How it works
Host screen (shared): a crowd view showing only "PACING… / FIRE!" states and, at the reveal, a slow-motion top-down replay of both true dead-reckoned paths and each player's aim ray. Each phone (private): during the pacing phase it shows ONLY your own live step count and a "turn & lock" button — never the opponent's steps, direction, or position. You choose your heading by physically facing that way (compass), you walk (pedometer counts strides), then you spin to aim and tap FIRE; the phone captures your current compass bearing. The server, which has been integrating each phone's own `(stepVector)` into an estimated x,y, computes the true bearing from you to your opponent and scores your aim error in degrees. Lowest error wins the duel. Because each phone privately tracks only its own walk, a single passed-around phone literally cannot follow two people walking apart at once — the asymmetry is the whole game.

## Technical approach
Host tab + two phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). On-device: DeviceMotion for step-peak detection (accel magnitude band-pass → stride events, ~0.7m each after a per-player calibration walk) and DeviceOrientation `alpha` for heading, zeroed by both players pointing at the TV at start (shared reference frame — critical, since raw compass drifts). Phone streams `{stepEvents, heading}`; server reconstructs each path as a sum of stride vectors → position, then at FIRE computes `atan2` bearing difference. Data model: `Duel { refHeading, players: {id, pos, aimBearing, locked} }`. Hard part: keeping the two phones in the *same* coordinate frame despite magnetometer offset and stride-length variance — solved by the shared TV-pointing zero and a 4-step calibration walk that measures each player's stride.

## v1 scope
- Exactly 2 players, ONE duel, fixed 5 paces (no secret count yet — just walk 5).
- TV-point calibration + 4-step stride calibration per phone.
- FIRE captures bearing; winner = smaller aim error.
- Reveal = static top-down of both paths and aim rays.

## Out of scope
- Brackets, secret variable pace counts, animated bullets, >2 players, rematch scoring, obstacle avoidance.

## Risks & unknowns
- Compass drift/interference could desync frames; the shared zero may not be enough.
- Stride estimation is noisy — error might be *too* large to feel fair vs. luck.
- iOS DeviceMotion/Orientation permission gates behind a gesture over HTTPS.

## Done means
Two phones calibrate to the same TV-pointed zero, both players walk five paces in chosen directions and lock an aim, and the host replay shows two distinct dead-reckoned paths with each aim ray — and the phone that walked and turned closest to the true opponent bearing is declared the winner, with the result reproducibly different when players choose different directions.

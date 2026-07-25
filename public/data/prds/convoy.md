## Overview
Convoy is a 3-player wordless synchrony game for a living room with a TV and three phones. Each player drives one car in a closed loop. The room wins by cruising at the same steady speed together — but no player is ever told what speed they're going. The only instrument on your phone is the distance to the car in front of you, whose driver you don't know. It's a party game that accidentally reproduces the phantom traffic jam.

## Problem
Most "match each other" games converge on a *named* value: a number, a word, a note. Naming makes the target findable and the game a guessing contest. Convoy removes the vocabulary entirely — there is no unit, no readout, no anchor. The group must invent a shared equilibrium out of nothing but relative motion, which is exactly the felt experience of merging into traffic, rowing in a boat, or walking in step. And it does so with a physical intuition everyone already owns: don't hit the car in front.

## How it works
The server places three cars evenly on a ring track. Each phone shows PRIVATELY: one large gap indicator (a shrinking/growing bar plus a "tailgating / drifting back" state) and a vertical throttle pad. No speed number. No positions. No identities. Crucially, each phone's view is a *different* number, because each player watches a different car — the private asymmetric state is the entire game.

The host TV shows NO positions during play. It shows a scrolling "ride quality" ribbon — a band that goes glassy-smooth when gap variance is low and shudders visibly when the convoy bunches — plus a 60-second clock and a lock-in meter. When all three speeds sit within tolerance for 3 continuous seconds, the room wins and the TV finally reveals a top-down replay of the ring, showing the stop-and-go wave the players created and then killed. That replay is the payoff shot.

The drama is overshoot: you close a gap, so you lift off, so the driver behind you lifts off harder, and a braking wave circles the ring back into you. Damping is the skill.

## Technical approach
Authoritative server (PartyKit / Durable Object) runs a 30Hz sim: `speed += (throttle - speed) * k * dt`, `pos = (pos + speed*dt) mod 1`. State: `room{phase, tick, winTimer}`, `player{id, seat, throttle, pos, speed}`. Ring order is fixed at start; `gap_i = (pos[ahead] - pos[i]) mod 1`. Phones send throttle intents at ~20Hz; the server sends each phone only its own scalar gap. Host receives only derived aggregates (gap variance, speed spread).

Hard part: the gap must *feel* analog. Since a phone can't predict others, render the server gap through a ~100ms interpolation buffer and lerp between ticks; any jitter reads as phantom braking and poisons the mechanic. Also measure per-phone RTT at join and refuse a start if one player is 150ms+ worse — latency asymmetry is unfairness here, not lag.

## v1 scope
- Exactly 3 players, fixed ring order, QR join
- One 60s round, one win condition (pairwise speed delta < 3% held 3s)
- Phone UI: gap bar + throttle pad. Nothing else
- Host: ride-quality ribbon, clock, win banner, ring replay

## Out of scope
- Requiring *equal* gaps as well as equal speeds
- 4+ players, crashes, collisions, scoring, multiple rounds, sound

## Risks & unknowns
- Tolerance tuning: too tight and it never resolves, too loose and it wins accidentally in 10s
- Players may find a degenerate solution (everyone pins throttle to max); cap throttle response so the ceiling is reachable and boring-looking
- Without a speedometer, some players will feel blind rather than intrigued in the first 15s — the tailgating state label carries that onboarding

## Done means
Three phones join by QR, each shows a live gap that visibly responds to its own throttle within 150ms, the host ribbon shudders when the pack bunches, a win fires only when all three speeds hold within tolerance for 3s, and the post-round replay shows a recognizable traffic wave.

## Overview
Looks Clear is a 60-second avoidance game for 3–5 people in one room. Each player controls one bead inside a shared invisible cube. Each phone shows that cube flattened along a different secret axis. The cube shrinks over the round. Any two beads that come within touching distance in true 3D are both eliminated. The game is for groups who like loud, panicky physical games such as Spaceteam but want something new to shout about.

## Problem
Most collision party games use one shared view, so the room can solve them by talking: "I'll go left." Here, talking makes things worse. "Top left" refers to a different place on every phone, and two beads that overlap on your screen are often far apart in depth. The room keeps trying to agree on positions, and agreeing is exactly how the beads end up colliding.

## How it works
- **Private (phone):** a square showing every bead as a dot, flattened along your secret projection axis. Your own dot is bright and the others are grey and unlabeled. You drag to move your bead, but only within your own screen plane. Your depth axis is invisible to you, and other players' moves push beads along it.
- **Private (phone):** a proximity buzzer. Haptics and a red rim fire when any bead is within 2× the collision radius in true 3D. It does not say which bead or in which direction.
- **Host screen:** the cube's shrinking wall shown only as a countdown and a volume number, the list of beads still alive by player color, and a large flash naming both players whenever a collision happens. The TV never shows the real 3D positions until the round ends.
- **End:** the TV replays the round in true 3D on a slowly rotating camera. Each collision is shown from the angle where it was obvious, and each player sees the angle where it looked safe on their own phone.
- **Scoring:** the last bead alive wins. Survival seconds break ties.

## Technical approach
- The server is authoritative, using a Durable Object or a Socket.IO room. State is `beads[id] = {x,y,z}` plus `axes[id] = orthonormal basis (u,v,w)`. Each player's axes are dealt randomly from rotations that are at least 35° apart, so no two players share a usable view.
- A phone sends drag deltas `(du,dv)` at 30 Hz. The server applies `p += du·u + dv·v`, clamps the result to the shrinking cube, checks all pairs for collisions (n ≤ 5, so this is trivial), and broadcasts the positions.
- Each phone receives the full position array and projects it locally. Leaking the positions is acceptable in v1 because nobody is reading devtools mid-round.
- **Hard part:** latency fairness at the moment of collision. Collisions are decided only on the server tick (20 Hz), and the client renders 80 ms behind with interpolation. A secondary hard part is tuning the shrink rate so collisions are likely but not instant.

## v1 scope (humiliatingly small)
- One 60-second round, 3–5 players
- Fixed collision radius and a linear cube shrink
- Drag control only, plus the haptic proximity buzz
- TV shows survivors and collision flashes, then one 3D replay (three.js) at the end
- No accounts, no rematch flow, room code only

## Out of scope (for now)
Power-ups, teams, gyroscope steering, spectators, multiple rounds, and cosmetic beads.

## Risks & unknowns
- The game may read as random rather than skillful. Test whether players learn to read the buzzer together with the motion of grey dots.
- Talking may collapse into "everyone freeze." Mitigation: the shrinking walls push idle beads inward.
- Mobile drag precision and haptic support vary. iOS Safari has no vibration API, so a screen flash is the fallback.

## Done means
Five phones on Tailscale join one room. Each phone verifiably renders a different projection, tested by placing two beads that overlap on phone A and are far apart on phone B. A server-detected collision eliminates both players within 100 ms on every client. The end-of-round replay shows the true 3D paths. In a playtest, at least one collision should provoke someone saying "it looked clear."

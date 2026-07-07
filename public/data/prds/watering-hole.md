## Overview
Watering Hole is a 3-6 player cooperative rendezvous game. Each round, every player privately picks one of several identical, unlabeled doors, and the only thing they learn is how many people ended up in THEIR door. Over a few rounds the room must silently herd itself into a single door. It's for groups who like the delicious frustration of coordinating with no words and almost no information — a herd converging on the one water source, sensed only by how crowded it feels around you.

## Problem
Rendezvous/Schelling games tend to break in one of two ways: leak too much (show global counts) and convergence is trivial; leak nothing and it's random luck. The sweet spot is PRIVATE, LOCAL crowd-sense — you feel your own cluster but not the map. That only works when each phone holds a different simultaneous secret; a single passed phone collapses the whole tension.

## How it works
Each round the host TV shows N identical, unlabeled doors (v1: 4). Every phone PRIVATELY taps one door. When all have picked (or a timer fires), the server resolves and tells each phone ONLY the size of the cluster it landed in — 'you + 2 others here' — never which door won, never the other clusters. A new round opens; players silently migrate, chasing the crowd they can only infer. An anchor rule stabilizes convergence: once your cluster reaches half the room, your phone LOCKS to 'HOLD,' forming a nucleus while everyone else feels the vacuum and drifts toward it. The room WINS when everyone is in one door. The host screen shows anonymized cluster bars growing round by round — the audience sees the drama unfold; the players never get door identities.

## Technical approach
Authoritative Durable Object / PartyKit room over Tailscale Serve. Data model: `round{picks:{playerId:doorIdx}}` plus round history. Rounds are lockstep — resolve on all-picked or timeout. On close, the server computes cluster sizes and sends each player ONLY their own count plus hold state. The hard part is information design, not plumbing: feedback rich enough to converge but sparse enough to stay a puzzle, and anti-oscillation (the whole room swapping doors forever). The anchor/lock rule plus persistent door identity between rounds damps that oscillation; door-count-vs-player-count is the key tuning knob.

## v1 scope
- 4 players, 4 doors
- 6 rounds max
- Private per-round cluster-size feedback
- Anchor lock at cluster size >= 3
- Host anonymized cluster bars + round counter

## Out of scope
- Labeled/themed doors, betting, per-player scores
- Multi-round matches or difficulty ramps
- Reconnection grace, spectator modes

## Risks & unknowns
- Endless oscillation if the anchor rule is too weak
- Feedback too weak (feels random) or too strong (trivial) — needs live tuning of doors vs players
- Small-N majority math is noisy at 3-4 players

## Done means
On a LAN, 4 phones join, each round every phone shows ONLY its own cluster size and correct hold state (verified by inspection), the host bars visibly converge, and in a real playthrough all four players land in one door with a WIN detected within 6 rounds.

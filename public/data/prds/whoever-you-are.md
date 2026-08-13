## Overview
A 100-second cooperative spatial puzzle for exactly 4 people standing in a cleared room. Phones range each other with ultrasonic chirps. Each player is secretly assigned one *anonymous* partner and a target distance to them. Satisfying your own constraint moves someone else's, and nobody knows the graph, so the room has to talk its way into a shape it cannot draw.

## Problem
Every "walk until your phone says so" game measures distance from one fixed source — a speaker, the TV — which makes the room radial and solvable alone. Peer-to-peer distance is a different board: the constraint graph is a cycle, every player is simultaneously a chaser and a target, and hiding *whose* edge is whose turns a physics problem into a negotiation.

## How it works
1. Server secretly builds a 4-cycle A→B→C→D→A and assigns each edge a target: 0.5m, 2.0m, 1.2m, 3.0m.
2. **Phone shows privately:** one enormous live number — metres to *your* partner, refreshing ~3Hz — a target band, and your remaining walk budget. That is the entire UI. No name, no arrow, no hot/cold hint.
3. **Host TV shows publicly:** four unlabeled tension bars (distance-from-target per edge), reshuffled every tick so you cannot track which bar is whose, plus one global "closed" meter.
4. **Walk budget:** each player gets 25 seconds of accumulated walking, step-detected from the accelerometer. Burn it and you become a permanent anchor — which is itself information the others must infer from you standing still.
5. Win: all four constraints within ±25cm simultaneously for 3 continuous seconds.
6. The emergent play is verbal traffic control — "everyone freeze, only Dana moves" — because uncoordinated chasing is a limit cycle that eats every budget.

## Technical approach
Host tab + phone PWAs + one authoritative Durable Object (PartyKit) over WSS.

Ranging uses **two-way ultrasonic time-of-flight**, which sidesteps cross-device clock sync entirely: A emits a 20ms 18–20kHz linear chirp at local sample-clock time t1; B cross-correlates its 48kHz mic stream against the known template, then re-emits exactly Δ=100ms later on *its own* AudioContext clock; A correlates the reply at t4. Distance = ((t4−t1)−Δ)/2 × 343 m/s. Both intervals are measured within a single device's clock, so no NTP-style offset estimation is needed. The server runs a TDMA schedule so only one chirp is airborne at a time; 6 pairs → a full graph refresh at ~3Hz.

Critical gotcha: `getUserMedia` must be opened with `echoCancellation:false, autoGainControl:false, noiseSuppression:false`, or the browser's voice pipeline silently deletes the chirps. Bluetooth audio routing breaks the timing budget and must be refused at join.

Data model: `Room { players[], edges:[{from,to,targetM}], ranges: Map<pairKey,{m,ts}>, budgets: Map<id,ms>, holdStartedAt }`. Server owns all ranges, computes satisfaction, and fans out asymmetrically: each phone gets one scalar (its own edge) plus its budget; the host gets shuffled bars.

De-risk path: if correlation-based ToF is too noisy on the actual test phones, degrade to amplitude-based ranging calibrated at 1m in the lobby, quantized to three bands. The game still works, coarser.

## v1 scope
- Exactly 4 players, one 4-edge cycle, one 100-second round
- 25s walk budget each, ±25cm tolerance, 3s hold to win
- Lobby calibration: hold phones 1m apart, one chirp exchange
- TV = four shuffled bars + closed meter. No replay, no scoring history

## Out of scope
Repel/max-distance constraints, 5+ players (slot schedule blows up), a saboteur role, furniture/obstacle modelling, absolute positioning or a room map, multiple rounds.

## Risks & unknowns
Human bodies attenuate 18kHz hard, so a blocked line-of-sight can throw a range by 0.5m — hence the loose tolerance. Multipath in a hard-surfaced room favours first-peak-above-threshold detection over peak-max. Speaker response above 19kHz varies wildly across handsets and some older phones simply cannot emit usefully. Ultrasound is inaudible to most adults but not to everyone, and not to dogs.

## Done means
Four phones in a 4×4m room hold a ≥2Hz full-graph refresh with median pairwise error <30cm and p90 <60cm across a 2-minute static test against a tape measure. One live round reaches the 3s all-satisfied lock with no player ever having seen the graph. A log audit confirms each phone received exactly one edge distance and the TV bar order was reshuffled every tick.

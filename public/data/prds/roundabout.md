## Overview
Roundabout is a cooperative spatial-coordination game for 3-4 players standing in a ring around a host TV. Each phone points at exactly one other player; the group wins when everyone's aim forms a single closed loop that includes all of them (one Hamiltonian cycle). You solve it by turning your body, not tapping a screen. For party groups who like puzzles where their own bodies are the pieces.

## Problem
Graph puzzles — permutations, cycles, who-points-at-whom — are abstract on paper. Roundabout makes YOUR body the pointer and the ROOM the graph, using the compass, a sensor that otherwise just spins map apps. And it's fundamentally impossible with one passed-around phone: a ring of simultaneous, private pointers is the whole game.

## How it works
**Calibration:** each phone registers a bearing to every other player ('Point at BLUE and tap').

**Play:** you silently rotate your body to aim your phone at a chosen teammate. PRIVATELY, your phone shows ONLY an arrow with the color of whoever you're currently aimed at, plus a status light: GREEN if you're the sole person aiming at that target, AMBER if you're colliding (someone else aims there too), GRAY if you're pointed at empty space. The host TV shows only an ANONYMIZED abstract graph — dots and the arrows currently between them — and one 'LOOP?' indicator that lights green when the aim-graph is exactly one cycle covering everyone. No names, no positions on TV.

Because you see only your own out-edge and your own collision status, nobody can see the whole graph. The group reasons aloud: 'If I point at Sam and Sam points at me, that's a dead-end 2-loop — break it.' You renegotiate purely by turning. **Win:** hold a valid single cycle for 3 seconds.

**Private vs shared:** phone = your target color + solo/collision/empty status. Host = anonymized edge graph + cycle validity + timer. The privacy is load-bearing: no single phone holds the ring's state, so the room must talk and turn to converge.

## Technical approach
Host browser + phone PWA + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `players[]`, per-phone calibrated bearing maps, `currentTarget[playerId] = targetId` (server computes from each phone's heading vs its calibrated bearings — nearest within ±15°, else null). Server checks whether the target map is a bijection forming a single n-cycle, and runs a 3s hold timer. Phones stream heading at ~15Hz; server maps heading→person, then broadcasts to each phone ONLY its own status and to the host the anonymized adjacency. The hard part: robust heading→person mapping under compass drift and close spacing, hysteresis so targets don't flicker between adjacent people, and correctly distinguishing one big cycle from disjoint sub-cycles / shared-target collisions in real time.

## v1 scope
- 3 players (the only wins are the two 3-cycles — nice and legible)
- Talking allowed, one round, 3-second hold
- Tap-to-calibrate bearings; one motion-permission prompt

## Out of scope
- 4-5 players, silent hard mode, scoring/history
- Reconnection, automatic drift recalibration

## Risks & unknowns
Compass drift makes targets flicker between people standing close — mitigated by a spacing prompt and heading hysteresis. Three players has only two valid solutions, so it may be too easy — acceptable for a v1 fun-proof. iOS needs a gesture for DeviceOrientation.

## Done means
Three calibrated phones; when players stand in a triangle and each points at their left neighbor, the TV LOOP indicator goes green and after 3s shows a win; two people pointing at one person shows amber privately and a non-cycle on TV — all reflecting within ~200ms of turning.

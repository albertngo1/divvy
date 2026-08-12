## Overview

A three-player railroad game for people who love 18xx and hate the forty minutes per turn spent tracing a route with a finger and adding up city values by hand. The map is public. The *ownership* of the track is not. Ten minutes, three runs, one map.

## Problem

Route-running is the canonical tedious tabletop mechanic: enumerate every legal path your train can take, sum the revenue, have someone check your arithmetic, discover you missed a better route. Meanwhile track ownership is stuck being public information, because ownership in a physical game means a colored token sitting on the board. The one thing a computer should do (the arithmetic) is done by humans, and the one thing that would be interesting to hide (who owns what) can't be hidden.

## How it works

The TV shows a fixed seven-city, twelve-edge map with revenue numbers on each city. Every player knows the map exactly.

Each phone privately shows the same map with **your three owned edges glowing**, plus one secret contract city you must touch at least once across the three runs for a bonus. Ownership is disjoint and hidden; nine of twelve edges belong to someone, three to nobody.

A run: each player privately builds a path by tapping cities — up to four edges, no edge reused, legality highlighted live. All three commit simultaneously; the TV shows only "locked" badges.

Resolution animates all three routes at once on the TV. You earn the revenue of every city your path touches. For each edge you used that you don't own, you pay a 10-point toll to its owner — and the TV shows **who paid whom, but never which edge**. That's the leak: after run one you know Blue owns something on your route, not what. Run two, you probe. Run three, you either reroute around them or eat the toll because the revenue is worth it.

Three runs, then the highest bank wins. The phone never tells you your rivals' revenue mid-game — only the TV's running balances, which move for reasons you have to reconstruct.

## Technical approach

Cloudflare Durable Object per room, host tab plus phone PWAs over WebSocket. Data model: `{graph: {nodes, edges}, owner: {edgeId: playerId|null}, contracts: {playerId: nodeId}, runs: [{playerId: edgeId[]}], bank: {playerId: int}}`. State is masked per socket: each client receives ownership only for its own edges, and — the part that's easy to get wrong — a *reconnecting* client must be re-hydrated through the same mask, not handed the room snapshot. Path legality is validated client-side for responsiveness and re-validated authoritatively on commit; a mismatch drops the route to zero revenue rather than erroring. Sync is easy (three commits per run). The hard parts are the phone path-builder on a 390px screen (tap-to-extend, tap-again-to-backtrack, no dragging) and tuning the toll reveal — attribute the payee and ownership collapses by run two; anonymize it and nothing is ever learned.

## v1 scope

- Exactly 3 players, one hand-drawn map, three runs
- Fixed edge ownership dealt from a seeded shuffle
- Flat 10-point toll, 4-edge train limit, one contract city each
- 60-second commit window per run, auto-submit the shortest legal path on timeout
- No lobby, no persistence, no rematch

## Out of scope

Building track, buying trains, share ownership, stock rounds, multiple maps, 4+ players, spectator view.

## Risks & unknowns

The map may be small enough that ownership is fully solved after run one, which kills runs two and three. Twelve edges over three owners may need to be sixteen. Route-building on a phone could be fiddly enough to burn the whole commit window. Unclear whether the toll reveal reads as a clue or as noise without an on-TV ledger of past payments.

## Done means

Three phones and a TV complete three runs in under ten minutes, and the server log shows at least one player's run-three path deliberately avoiding an edge they paid a toll on in run one — the inference actually happened, without anyone doing arithmetic.

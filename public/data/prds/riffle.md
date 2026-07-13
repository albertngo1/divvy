## Overview
Riffle is a concurrent-room party game for 3-6 players about converging on a shared *ordering* with no talking. Everyone holds the same five tiles; the room silently drifts toward one identical permutation. It's for groups who've done the slider/rhythm convergence games and want a dimension that isn't 1D.

## Problem
Convergence party games mostly live on a line (drag a slider) or a beat (tap in time). Ordering — where the disagreement is combinatorial but the state is still legible — is unexplored. There's no correct order; the only goal is to *agree*, which makes every reshuffle a silent negotiation.

## How it works
The host TV shows five face-up cards (e.g. five snacks) with the framing "get everyone's ranking to match — there is no right answer." Each phone PRIVATELY shows those same five tiles in a draggable vertical list, each phone seeded with a *different* random start order. Players drag continuously to reorder. Every ~250ms each phone streams its current permutation. The server computes mean pairwise Kendall-tau distance and pushes to the HOST ONLY: a single Agreement ring (0-100%) plus a faint per-boundary "tension" heat between adjacent slots (how much the room disputes that particular cut) — never any player's actual order. Win when all permutations are bit-identical for 3 continuous seconds; the host then flips to reveal the unanimous order with a flourish.

Private (phone): your secret working order + your own dragging. Shared (host): only the aggregate Agreement ring and boundary-tension heat.

## Technical approach
PartyKit / Cloudflare Durable Object per room. Data model: `player -> permutation:int[5]`, server keeps latest snapshot per player. Sync: 4Hz permutation snapshots; server recomputes mean pairwise Kendall-tau plus a per-slot disagreement vector and broadcasts the scalar + vector to the host channel only. The genuinely hard part is giving *useful* convergence feedback without leaking anyone's order — the per-boundary tension signal is the design crux: it must nudge the room toward its Schelling ordering without dictating it. Secondary: debounce mid-drag transient permutations so a finger in flight doesn't spike/collapse the meter.

## v1 scope
- 3 players, one fixed 5-item set, single round.
- Win when all three orders match for 3s, else timeout at 90s.
- Host Agreement ring + boundary heat; phone drag-list only.

## Out of scope
- Content packs, multi-round scoring, larger sets, reconnection, spectators.

## Risks & unknowns
- May collapse to a trivial Schelling order in 5 seconds (boring) OR never converge (frustrating); 5 items is chosen to sit in the sweet spot, but tuning the tension hint is make-or-break.
- With no talking, a stubborn player can deadlock the room — needs a graceful timeout reveal.

## Done means
Three phones reorder five tiles live; the host Agreement ring climbs as orders align, hits 100% when all three lists are identical, holds 3 seconds, and the reveal animation fires.

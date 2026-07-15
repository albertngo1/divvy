## Overview
Overbook is a blind-simultaneous scheduling game for 3-4 players sharing a TV, each on their phone. Everyone is an assistant double-booking a single shared conference room; the room wins only if every meeting lands without overlapping another.

## Problem
Coordination games where everyone can see everyone's plan devolve into one bossy planner tessellating for the table. Overbook hides each player's obligations, so the failure mode is the exact thing offices dread — the double-book — and it can only be avoided by inference, not negotiation.

## How it works
Each phone PRIVATELY shows YOUR meeting cards — 2-3 blocks of different lengths (30 / 60 / 90 min) — plus your personal availability window (some players can only book mornings, others afternoons; asymmetric constraints dealt from a vetted, solvable-but-tight instance). The shared TV shows an empty 9am-5pm timeline for the one room and a countdown. Simultaneously and blind, each player drags their meetings onto the timeline and locks. On reveal, the TV animates every meeting dropping in; any minute claimed by two or more meetings flashes red and ALL overlapping meetings get bounced (lost). Win = zero collisions, every meeting placed.

Because instances are tight (near-exact packing), everyone reaching for the obvious mid-morning slot guarantees a pileup. You must reason from your own availability to deduce where the OTHER players probably can't reach — and deliberately take the awkward edges yourself.

Private vs shared: you see only your cards + your window; the TV shows only the anonymized final occupancy. You never see others' obligations, so you can't co-plan — you infer.

## Technical approach
Host tab + phone PWAs + authoritative WS server. Turn-based, so sync is trivial: server holds Instance{roomSlots, perPlayer{meetings[], availability}}, collects each player's locked placement, computes overlaps, and broadcasts the anonymized result. Per-player cards are never sent to other clients. The genuinely hard part is INSTANCE GENERATION: producing asymmetric availability + meeting-length sets whose only non-overlapping packing is unique-ish — tight enough to punish greedy play, loose enough to solve by deduction. Precompute a small bank offline with a constraint solver; ship as JSON and hand-verify.

## v1 scope
- 3 players, one room, one 9-5 day
- Each player has exactly 2 meetings, fixed length set
- Single blind lock, single reveal, win/lose
- One handcrafted, human-verified instance

## Out of scope
- Iterative re-placement / negotiation rounds
- Runtime procedural instance generation
- Multiple rooms, scoring, difficulty tiers

## Risks & unknowns
- Is one blind shot satisfying, or too luck-driven? May need a single peek/hint
- Instance tuning: too loose = trivial, too tight = feels like a coin flip
- Deduction with zero info about others may be too opaque for casual players

## Done means
3 phones each display a DIFFERENT private meeting set and availability, all lock blind, and the server bounces exactly the overlapping meetings. A non-overlapping solution yields a green win screen; any collision yields the correct red bounces — reproducibly.

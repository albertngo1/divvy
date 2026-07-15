## Overview
Parcel is a 3–5 player concurrent-room game built on 'I cut, you choose' fair division — the oldest divvy mechanic there is. One player privately splits a shared hoard into bundles; everyone else simultaneously and secretly grabs. It's for groups who love the squirmy fairness math of dividing loot without the table-arguing.

## Problem
Splitting spoils fairly at a real table is agonizing: someone physically makes piles while everyone hovers, accusations fly, and 'okay everyone point at once — no, you moved' never actually happens simultaneously. The elegant envy-free tension collapses into bickering because humans can't cut in private or choose in unison.

## How it works
The host TV shows a hoard of ~9 item cards, each with a public point value. One player is the **Cutter** (rotates; v1 just picks one). On the Cutter's phone ONLY, they drag the 9 items into N bundles (N = number of choosers) — hidden from everyone until locked. The Cutter wants balanced bundles, because they take whatever bundle is left last.

Once locked, the bundles appear face-up on the TV. Now every **Chooser** simultaneously and secretly taps the bundle they want on their own phone, plus spends a one-time secret **priority token** (a hidden number 1–5 each holds) as a tiebreaker. Reveal: if choosers picked distinct bundles, they get them. Collisions are resolved by highest priority token; the loser is bumped to remaining bundles. The Cutter is stuck with the last unclaimed bundle. Scores tally on the TV; highest wins.

Private (phone): the Cutter's in-progress partition, each Chooser's pick and priority token. Shared (TV): the hoard, the locked bundles, the final reveal.

## Technical approach
Host + phone PWAs + authoritative WebSocket server (PartyKit / Durable Objects or Socket.IO over Tailscale Serve). Model: `Room{ items[], bundles[][], phase }`, `Player{ id, role, pick, priority(1-5 used?), score }`. The Cutter's drag state streams only to their own client + server; the server broadcasts bundles to the TV solely after lock. Choosers' picks are server-held until a reveal barrier. Hard part: the simultaneous-secret-choose plus collision resolution must be atomic on the server — no chooser may learn another's pick before the barrier, or the whole fairness illusion dies. Server computes bump chains deterministically.

## v1 scope
- 3 players (1 Cutter, 2 Choosers), 6 items, 2 bundles.
- One round, one Cutter, no rotation.
- Priority token as simple hidden 1–5, used once.
- TV shows hoard → locked bundles → reveal → scores.

## Out of scope
- Rotating Cutter / multi-round campaign.
- Envy-free guarantees beyond cut-and-choose; no moving-knife math.
- Item art beyond value labels.
- Reconnect / late join.

## Risks & unknowns
- With 2 choosers the collision case may be rare; needs tuning of bundle count vs. players.
- Does the Cutter role feel like a burden or a power? Playtest which is more fun.
- Priority tokens might overcomplicate v1 — fallback is random tiebreak.

## Done means
Three phones join, the Cutter partitions six items in private, both bundles reveal on the TV only after lock, choosers pick simultaneously with no leak, the server resolves any collision via priority correctly, and the TV shows a correct final score with the Cutter holding the leftover bundle.

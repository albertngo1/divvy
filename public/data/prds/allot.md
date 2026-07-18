## Overview
Allot is a 3-player cooperative convergence game (TV host + phones) about distributing a fixed pool of chips across labeled categories to match everyone else's split — with no talking. It's a Schelling game over allocations: given four jars like 'Sleep / Work / Play / Panic', how does a group 'obviously' divide ten chips?

## Problem
Convergence games usually ask you to match a single choice (a word, a point, a moment). Matching a whole DISTRIBUTION is a richer, underexplored itch — you're not agreeing on one thing but on proportions, priorities, a shared sense of balance. And it's easy to accidentally make it a memory/position game instead of a meaning game; the design has to force people to reason about the labels.

## How it works
The host TV names the four jars and the pool size (10 chips), and shows only an AGGREGATE fill: each jar rendered at the summed height across all players, so you can read the room's rough shape without seeing who put what. Privately on each phone: the same four jars — but shuffled into a different left-to-right order per player — plus your ten chips to drag in, a running 'chips left' counter, and a LOCK button. Because positions differ, you cannot converge on 'I'll load the second jar'; you must converge on 'Sleep should be heaviest.'

Server withholds individual splits; the aggregate on the TV updates live as chips move (summed, so no single player's split is recoverable from it with 3 players... mostly — see risks). On lock-in, the server compares the three chip vectors. Win = all three vectors identical. On win, the host fans out the three splits side by side; the reveal of 'we all put 5 in Sleep' is the payoff. On mismatch, it shows the aggregate and a 'spread' hint per jar (range only) and reopens for another pass.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { round, jars:[label], pool:10, players[{id, perm:[jar indices], split:[int x4], locked}] }. The per-phone permutation is assigned server-side at join and never sent to other clients. Sync: phones send split deltas; server maintains authoritative per-player vectors, broadcasts only element-wise SUM to the host. The hard part is the leak surface: with only 3 players, aggregate deltas can partially deanonymize live edits, so v1 debounces host updates (only refresh aggregate every ~2s and only when ≥2 players have moved since last refresh) to blur attribution. Win check is exact vector equality, server-side.

## v1 scope
- 3 players, one fixed jar-set, pool of 10, one round to a win.
- Per-phone shuffled jar order.
- Host: aggregate fill + debounced updates + side-by-side reveal.
- Exact-match win detection.

## Out of scope
- Multiple jar-sets / content packs, scoring, near-match partial credit.
- >3 players, rejoin handling.
- Fancy anti-deanonymization (differential-privacy noise, etc.).

## Risks & unknowns
- Exact-vector match may be too punishing; a tolerance ('within 1 chip per jar') might be the real fun — needs playtest.
- Live aggregate could leak who's doing what even debounced.
- Four jars × 10 chips may be too large a space to ever converge in one round.

## Done means
Three phones join, each sees the four jars in its own order and distributes exactly ten chips; the host shows a debounced aggregate that never reveals an individual; on all three locking, the server declares win iff the three chip vectors are identical and fans out the splits.

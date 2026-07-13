## Overview
A cooperative convergence game for 3–5 players on one TV plus phones. Each player secretly divides a fake inheritance among four named heirs; the room wins only if every player's split comes out *exactly the same*. It's Schelling-point convergence over a multi-dimensional allocation instead of a single slider.

## Problem
One-dimensional convergence (drag a slider until the heat meter glows) is solved and a little dry. Convergence over a **discrete multi-way allocation** — where you must guess the room's split across several buckets at once — is unexplored and far harder. Wrapping it in "write Grandma's will" makes an abstract earth-mover problem legible and funny: the comedy of everyone independently, silently agreeing the cat gets everything.

## How it works
The host TV shows the estate — "$100 = 10 chips" — and four heirs with empty jars: The Cat, Cousin Doug, The Church, Yourself. Each phone **privately** shows the same four jars and 10 chips; you tap to drop chips into any split (7/1/1/1, 4/3/2/1, whatever) and lock. Nobody sees anyone else's will. On lock/timeout the server checks for an exact match. If all allocations are identical → the will is "notarized," confetti. If not, the host shows only a **Consensus meter** plus anonymized per-jar totals (a faint hint), and the room replays for another beat (best-of-3, convergence must improve). Four degrees of freedom means you're genuinely reading the room, not sliding to a midpoint.

**Private (phone):** your editable allocation. **Shared (host):** the consensus meter + anonymized per-jar totals only — never any individual's split.

## Technical approach
Host + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{phase, heirs:[names], chips:10, players:{id, alloc:[c0,c1,c2,c3], locked}}`. Phones send `alloc` on lock; the server withholds all until everyone locks, then computes `identical?` (exact vector match) and `dispersion` = mean pairwise L1 distance. It broadcasts `{consensus, perJarTotals}` to the host and `{converged?, hint}` to phones. Latency is trivial (one message per player per beat). The genuinely hard part is **designing feedback that nudges convergence without revealing any individual** — with only 3 players, per-jar totals can leak; mitigate by showing totals only *after* a beat and never per-player.

## v1 scope
- One estate, 4 heirs, 10 chips
- 3 players, single beat: allocate → lock → win/lose reveal with consensus meter
- No multi-beat loop, no accounts

## Out of scope
- Multiple estates, weighted heirs
- The multi-beat hint/replay loop (add later)
- Talking/negotiation, leaderboards

## Risks & unknowns
With 3 players and one obviously-funny heir, it may converge trivially — needs enough heirs/chips to stay non-trivial. Anonymized totals still leak with few players. Is exact-match too punishing? A "within-1-chip" tolerance may be kinder and should be tested.

## Done means
Three phones each privately allocate 10 chips across 4 jars, lock, and within 500ms the host shows a consensus meter and declares a win only when all three allocations are exactly equal — with no individual's split ever displayed.

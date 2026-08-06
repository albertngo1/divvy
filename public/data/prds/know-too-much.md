## Overview

*Know Too Much* is a silent cooperative sorting game for 3 players. Everyone sees the same six unlabeled images. Everyone drags them into an order on their own phone. The room wins only if all three orders are identical. The catch: each phone privately overlays a *different* extra data layer on the tiles, and the more you know, the more likely you are to break the room.

## Problem

Asymmetric-information party games almost always make extra knowledge a *prize* — the informed player wins, the ignorant one flails. That's a well-worn shape. The itch here is the inversion: information as a liability. There is exactly one order all three players can independently derive, and it is the dumbest one — the one available to the player who was told nothing. The fun is watching yourself resist a fact you can't unsee.

## How it works

Six abstract image tiles (procedurally drawn creatures — varying in size, darkness, spikiness, number of legs). No names, ever.

**Privately on each phone**, the same six tiles appear in a drag-to-reorder column, but with a different annotation layer:

- Player A: a price in dollars under each tile.
- Player B: a year under each tile.
- Player C: nothing at all.

Nobody is told what the others got, or that anyone got nothing. The price and year rankings are deliberately generated to *conflict* with each other and with every obvious visual ordering, so they are pure temptation.

**On the shared TV:** never anyone's order. Only a single horizontal *spread* bar — the mean pairwise Kendall-tau distance between the three current orders, updating live as people drag. It falls as the room converges and jumps when someone re-sorts. That's the entire channel: one number, no attribution, no names. Silence plus a twitching bar is the whole texture of the game.

Any player may hit LOCK. When all three lock, the TV reveals the three orders side by side. Identical = win, and the TV then shows what each phone had been privately displaying — the reveal of the price and year columns is the punchline, because they explain every stupid swap the bar recorded.

The informed players' real job is theory-of-mind: guess which visual affordance the blank-slate player will latch onto (size? darkness?) and commit to it while their own screen keeps insisting the answer is $14 → $91.

## Technical approach

Host tab + phone PWAs + an authoritative PartyKit / Durable Object room. State: `{seed, tiles: [{id, shapeParams, price, year}], layers: {playerId: 'price'|'year'|'none'}, orders: {playerId: id[]}, locks: Set, phase}`. Tiles are rendered client-side from `shapeParams` via a shared 60-line canvas drawer, so there are no image assets.

Sync strategy: phones emit a throttled `reorder` (max 5/s, full permutation, last-write-wins per player) — permutations of six items are tiny, so no diffing is needed. The server recomputes the Kendall-tau spread and broadcasts **only the scalar** to the host. Phones receive nothing about other players except a lock count. The genuinely hard part isn't throughput, it's *leak discipline*: the naive implementation broadcasts room state to everyone and the whole game dies. The server keeps two serializers — `toHost(state)` (spread + lock count) and `toPlayer(state, id)` (your tiles, your layer, your order) — and there is no code path that sends raw `orders` or `layers` to a client before `phase === 'reveal'`. That invariant deserves a test.

## v1 scope

- Exactly 3 players, one round, one seeded tile set.
- Three hardcoded layers: price, year, none.
- Drag-to-reorder list of six, LOCK button, no undo after lock.
- TV: spread bar, lock count, reveal screen showing all three orders and all three private layers.

## Out of scope

Scoring across rounds; 4+ players; any text labels on tiles; hints; a timer; letting players choose their layer; real-world image sets.

## Risks & unknowns

- The blank-slate player may find *no* salient visual ordering and pick randomly, making the game unwinnable — tile generation must guarantee one dominant visual axis (probably size) that reads at a glance.
- Conversely, if size is too dominant, the informed players ignore their layer instantly and the tension evaporates. The price/year layers need to be *plausible enough to hurt*.
- The spread bar may be too coarse to act on with only 3 players and 6 items (few distinct tau values).
- Drag-reorder on small screens with fat thumbs is a UX tarpit; may need tap-to-swap instead.

## Done means

Three phones join, each renders the identical six tiles with a demonstrably different annotation layer, the TV's spread bar responds to reordering within 300ms without ever exposing an order, and the reveal screen correctly declares a win only on three byte-identical permutations — confirmed by a scripted win run and a one-swap-off loss run.

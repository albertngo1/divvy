## Overview
A no-talk cooperative convergence game for 3 players (v1). Everyone privately carves the same nine ambiguous tiles into three unlabeled groups, and the room wins only when all three groupings are identical. It's for friends who like the 'are we on the same page?' thrill of matching games but want something with more mental surface than a single word or tap.

## Problem
Convergence games almost always make you match ONE choice — a word, a moment, a dot. But *how you carve a fuzzy set of things into clusters* exposes a whole mental model, and matching that silently is a deeper read of the room. No existing Divvy game converges on a **partition** of items: Pair Off fixes exact pairs; this is free-form clustering with no correct answer, where the fun is that CROWN, LEMON and TAXI could group by color, by category, or by shape — and you have to feel which split everyone else will feel.

## How it works
The host TV shows nine tiles (words/tiny icons) chosen for genuine multi-way ambiguity, e.g. CROWN, LEMON, SUN, TAXI, DUCK, BEE, SCHOOL BUS, BANANA, GOLD. Each phone privately shows the same nine tiles **shuffled into a different order** plus three empty bins, and the player drags tiles into bins. Bins are unlabeled — only *which tiles share a bin* matters, never bin order or name.

The host shows ONLY a co-membership heat map: for each tile-pair, how many players put that pair together (0–3), drawn as edge thickness on a nine-node ring — never who chose what, never a full grouping. Players silently re-drag to chase consensus. The room wins when all three partitions are label-agnostically identical; the reveal snaps the agreed grouping together.

Per-phone is load-bearing: shuffled private boards defeat screen-mirroring, three full partitions are committed simultaneously, and one passed phone can't hold three divergent boards.

## Technical approach
Host tab + phone PWAs + an authoritative WS server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room {tiles[9], seed}`; per-player `{partition: tileId→binIndex, locked}`. Canonicalize each partition to a sorted set-of-sets ignoring bin labels; equality = identical canonical forms. Heat = for each unordered pair, count players with `sameBin(a,b)`. On every drag-commit the phone sends its partition; the server recomputes heat + win and broadcasts heat to the host only. The hard part isn't latency (tiny state) — it's the label-agnostic equality/heat math and authoring tile sets with real, competing groupings so convergence is nontrivial but reachable.

## v1 scope
- 3 players, one fixed nine-tile round
- Exactly three bins, all tiles must be placed
- Host pair-heat ring; live, host-only
- Win-detect on identical partitions + reveal overlay
- Single room, no accounts

## Out of scope
Scoring/streaks, variable bin counts, image tiles, tile-set editor, >3-player tuning, hint system.

## Risks & unknowns
Too obvious a split → trivial win; too ambiguous → never converges (mitigate: after 90s the host highlights the single pair blocking consensus). The heat map could leak enough to feel like backchannel talking — tune granularity.

## Done means
Three phones each drag nine shuffled tiles into three bins; the host shows only pair-heat; when all three partitions are label-agnostically identical the host fires a win + overlay, and any mismatched set never triggers it.

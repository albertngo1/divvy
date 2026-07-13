## Overview
Skein is a 3–4 player concurrent-room craft toy shaped like Jackbox. Each player owns one colored strand of a single virtual friendship bracelet on a shared loom. Row by row, adjacent strands cross at knots, and the group weaves a real, chartable bracelet pattern together. The win is the finished pattern — an exportable knot chart and preview PNG that everyone saves. No score.

## Problem
Collaborative-craft party games barely exist, and the ones that do (shared drawings) let one confident person dominate. Friendship bracelets are intrinsically per-strand: nobody weaves the whole band alone. That structure is begging to be a party game, and the "mistakes become the pattern" ethos removes the sting of losing.

## How it works
The loom is N strands wide (N = players), 16 rows tall. Each row, the loom pairs up adjacent strands into crossings. For each crossing you're part of, YOUR phone privately shows only your strand's current color and position and a single choice: knot **left** (your color moves right over the pair) or **right**. You commit blind — you cannot see your partner's choice.

On the shared TV: the woven rows so far, growing downward like a real bracelet, but the *current* row stays blank until all commits land. When both sides of a crossing pick the same direction, a clean knot forms and colors swap as expected. When they conflict, the loom renders a **snarl** — a distinctive doubled/knotted stitch in a blended color that becomes a permanent feature. Snarls are not failure; they're texture. Over 16 rows the strands migrate across the band, and the group can *see* patterns emerging and start silently steering toward or away from snarls.

At the end the host renders the full chart plus a photoreal bracelet preview; every phone gets a download.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `{ strands: [{playerId, color, col}], rows: [{crossings: [{cols:[a,b], commits:{a:dir,b:dir}, resolved:'clean'|'snarl'}]}] }`. Sync: server opens a row, tells each phone which crossing(s) it participates in, collects the two blind commits per crossing, resolves deterministically, broadcasts the resolved row, advances. The genuinely hard part is the *reveal cadence* — hiding the current row until every commit lands while keeping the loom feeling live (per-phone "partner is choosing…" states, a 15s soft timeout that auto-picks to avoid stalls). Rendering is a deterministic pure function of the commit log, so the export is trivially reproducible.

## v1 scope
- 3 players, 3 strands, 12 rows, one bracelet.
- Fixed 3-color palette, colors auto-assigned.
- Two knot directions only; snarl is a single fixed stitch style.
- One export: a knot-chart PNG.

## Out of scope
- Real DMC-thread color picking, forward/backward knots, chevron presets.
- Any scoring, attribution, or guessing phase.
- Physical printing / PDF instructions.

## Risks & unknowns
- Blind commits might feel arbitrary if players can't see enough to steer — the migrating-strand preview must make intention *possible*.
- Snarl aesthetics: it has to read as charming, not broken.
- 12 rows × blind pairing could drag; needs a brisk 10–15s per row.

## Done means
Three phones each commit a knot direction per row without seeing partners; after 12 rows the host renders one chart, all three phones download the same PNG, and at least one snarl appears as visible texture rather than an error state.

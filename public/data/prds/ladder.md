## Overview
Ladder is a cooperative, no-talking convergence game for 3 players plus a shared host screen. The room is handed five items and must independently sort them into the *same* order. Nobody may speak, gesture, or peek. You win only when all three private orderings are byte-for-byte identical.

## Problem
Most "guess the group" games converge on a single pick (one word, one dot, one tap). Ordering is a far richer convergence space — five items have 120 possible sequences — yet it's almost never used, because on paper it seems to demand discussion. The itch: can a room silently agree on a *whole ranked list*, driven only by shared intuition about the obvious ordering criterion? The satisfaction of three ladders snapping into alignment is bigger than any single-pick match.

## How it works
The host TV shows a prompt that implies an ordering axis, e.g. **"Rank these by how much they'd hurt to step on: LEGO, gravel, wet grass, a plug, sand."** Each phone privately shows the same five item cards — but in a **different scrambled starting order per phone**, so screen-mirroring your neighbor is useless; you must converge on the *item's rank*, not its position. Each player drags cards up/down into a 1–5 ladder, then hits LOCK.

Privately, each phone shows only your own ladder. The host TV shows only a **tightness meter**: a normalized Kendall-tau distance across the three locked orderings, rendered as ladder rungs pulling together or splaying apart — never any player's actual list, never who disagrees. If not all-identical, everyone unlocks and re-sorts; the meter nudges them warmer/colder. Win when all three permutations match exactly; the host then reveals all three ladders sliding into one and names the consensus order.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { promptId, itemIds[], players: { id, scramble[], ladder[]|null, locked } }`. Each phone gets its own `scramble` permutation at join. On lock, phone sends its `ladder` (array of itemIds). Server computes pairwise Kendall-tau over locked ladders and broadcasts only the aggregate tightness scalar to the host — individual ladders never leave the server until the win reveal. The genuinely hard part isn't latency (turns are deliberate) but **designing the heat signal to guide without leaking**: tau-distance must feel warmer as they align yet never expose *which pair* of items is swapped, or the puzzle collapses into a solved oracle.

## v1 scope
- Exactly 3 players, one round, one hardcoded prompt + five items.
- Per-phone scramble, drag-to-reorder, LOCK/unlock.
- Host tightness meter (three states: cold / warm / matched is fine for v1).
- Win detection + overlay reveal of the agreed ladder.

## Out of scope
- Scoring, multiple rounds, prompt packs, 4+ players.
- Partial-credit for near-matches.
- Fancy animated rungs (a simple bar is fine).

## Risks & unknowns
- Tuning heat granularity: too precise = trivially solved, too coarse = frustrating.
- Some prompts have a *too*-obvious canonical order (instant win, no tension); prompt curation is the real design work.
- Kendall-tau may not match players' intuition of "closeness"; may need footrule distance instead.

## Done means
Three phones join, each sees the five cards in a different order, all reorder and lock; the host shows a converging tightness meter that reveals no individual ranking; when all three permutations are identical the host declares a win and overlays the single agreed ladder. Any mismatch keeps the room playing.

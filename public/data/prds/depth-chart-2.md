## Overview
Depth Chart is a 3-player cooperative ranking-convergence game (TV host screen + private phone controllers). The host shows a clear sorting instruction and five items; each player privately arranges the items into a top-to-bottom order. The room wins only if all three orderings are identical. The axis is never ambiguous — the *items* are, so the whole game lives in the borderline pairs where reasonable people disagree and now must silently agree.

## Problem
Convergence games about a single choice (a word, a spot) are one-dimensional. Ranking forces convergence on an entire *structure* of relationships at once — and the delicious pain is the two middle items you genuinely can't decide between, knowing two other people are wrestling the same tie with no way to negotiate.

## How it works
The host TV shows one prompt: a clear axis plus five items, e.g. "Order oldest → newest: cassette, vinyl, CD, 8-track, MiniDisc," or "Heaviest → lightest: fox, raccoon, beaver, badger, otter." The axis is unambiguous; the item order is genuinely contestable.

PRIVATE (each phone): a vertical list of the five items in a *scrambled* start order (different per phone, to defeat screen-mirroring). The player drags to reorder into their best guess of the ranking everyone will settle on, then locks. No player sees another's list.

SHARED (host TV): only an aggregate "consensus tension" display — for each of the five slots, how spread the three players' placements of items currently are (a per-item wobble bar), never any player's actual list. Plus a single overall "agreement" meter. It signals *how close* the room is without revealing who put what where.

On all-lock, the server compares the three orderings. Identical → the TV reveals the agreed ranking with a satisfying snap-into-place and a win. Otherwise it highlights only the *slots* that disagreed (not the culprits) and resets with a fresh prompt.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit). Data model: `Room { prompt:{axis, items[5]}, players:{id, order:[itemId...], locked} }`. Prompt drawn from a small authored deck. Phones send `reorder` deltas; server holds each private order and broadcasts only per-slot spread stats to the host. Sync is easy (no real-time timing). The genuinely hard part is *content design*: authoring prompts whose ambiguity produces exactly one or two hard ties — too easy and it's an instant unanimous win, too ambiguous and it never converges. Also, the host tension display must aggregate without leaking any single ranking (compute per-slot variance across the three orders, quantize coarsely).

## v1 scope
- Exactly 3 players, 1 prompt, 1 round.
- Hand-authored deck of ~8 prompts, each 5 items.
- Private scrambled drag-ranker + lock; identical-order check.
- Host per-slot wobble bars + agreement meter + reveal.

## Out of scope
- Scoring, streaks, multiple rounds, variable player counts.
- Larger item sets or player-submitted items.
- Partial-credit / near-match scoring (v1 is all-or-nothing).

## Risks & unknowns
- Hardest calibration is prompt ambiguity; a bad deck is either trivial or hopeless.
- Three players may converge fast, making rounds feel short — may need 6+ items to bite, but that raises frustration.
- Wobble bars could hint enough to become a copying aid.

## Done means
Three phones join, each privately drags five items (shown in different scrambled starts) into a ranking against a shared axis, and when all three orders match exactly, the host TV snaps the consensus ranking into place and declares the win.

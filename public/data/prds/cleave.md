## Overview
Cleave is a silent, cooperative convergence game for 3–5 players sharing a TV/laptop host screen, each holding a phone as a private controller. The room tries to independently arrive at the *same grouping* of a shared set of items—without a single word.

## Problem
Convergence party bits mostly make you rank a list or pick a number. Nobody has mined *grouping* as a Schelling space, yet it's far richer: you must silently agree on both **how many** buckets exist and **which items belong together**. That double ambiguity is the itch—two people can be 90% aligned and still fight over one homeless tile forever.

## How it works
The host screen shows six word tiles (e.g. OTTER, ANCHOR, VELVET, TRUMPET, GLACIER, DIESEL), an Agreement meter, and exactly one tile pulsing red: the most-contested one. Nothing else.

Each **phone privately** shows the same six tiles in a workspace where you drag them into buckets you create or merge at will. Your partition is live and yours alone—no one ever sees another player's grouping. You just keep re-sorting, watching the shared meter breathe.

The server continuously compares everyone's partitions (averaged pairwise adjusted Rand index) to drive Agreement %. It separately computes, per tile, the entropy of its co-membership across players and flags the highest as the pulsing 'contested' tile—a hint that says *this one is tearing us apart* without revealing who put it where. Win when all private partitions become identical up to bucket relabeling, held 3 seconds; the host then reveals the agreed grouping.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { tokenSet[6], players: [{id, partition: {tokenId -> groupId}}] }`. Each drag ships the player's full 6-entry partition map (tiny). Server recomputes the pairwise ARI matrix (O(n²·items), trivial) and the per-tile entropy on every change, broadcasting only aggregates to the host at ~10Hz. Genuinely hard parts: (1) **relabel-invariant equality**—canonicalize each partition to a sorted set of sorted member-lists and compare, so {A,B}|{C} equals {C}|{B,A}; (2) picking a contested-tile metric that hints usefully without leaking anyone's actual buckets. Individual partitions are never broadcast to clients.

## v1 scope
- One hardcoded set of 6 word tiles
- 3 players, no timer, no scoring beyond time-to-solve
- Free-form buckets (cap at 3)
- Agreement meter + one pulsing contested tile
- Relabel-invariant win detection + reveal

## Out of scope
Multiple rounds, curated decks, difficulty tiers, spectators, reconnection, mobile layout polish, accounts.

## Risks & unknowns
Degenerate collapse (everyone-in-one-bucket or all-singletons) trivializes it—may need to forbid those two extremes. The ARI hint could confuse rather than guide. Is 6 tiles the right size, or does 5 converge faster and 8 stall?

## Done means
Three phones join; each privately sorts six tiles into buckets; the host meter climbs as partitions align; when all three private groupings match (relabel-invariant) for 3 seconds the host flashes WIN and reveals the shared grouping—and at no point does any phone or the host display another player's partition.

## Overview

A 90-second, three-to-five-player scramble over one shared board of numbered tiles. Every phone is a private, fully draggable copy of the table. You may tear apart *anyone's* melds to make room for your own tiles — but so is everyone else, right now, and only the first legal commit survives.

## Problem

Rummikub-style table manipulation is the best mechanic in the box and the worst experience at the table. One player picks up half the board, fiddles for three silent minutes while four people watch, discovers it doesn't work, and then has to reconstruct the table from memory. Turn order exists purely because the physical board is a single mutable object only one pair of hands can touch. The mechanic isn't slow — the *shared physical state* is.

## How it works

**Shared (TV):** the canonical table — melds (runs of one color, or groups of one number) laid out large, plus each player's remaining tile count and a 90-second clock. When someone commits, the TV animates the old board morphing into the new one and flashes who did it.

**Private (phone):** your rack of 4 tiles, and a working copy of the entire table you can drag freely — split runs, steal a tile from a group, rebuild anything. Your phone shows a live legality badge per meld and a big COMMIT button that only unlocks when (a) every meld on your board is legal and (b) at least one tile came from your rack. Nobody sees your working copy. Ever.

Commits are simultaneous and contested. The server accepts the first valid one and immediately **rebases** everybody else: it replays your in-progress rearrangement against the new table, keeps every meld whose tiles are still available, and drops the rest into a shaking "orphaned" tray with a 1.5s highlight so you can see exactly which move ate your work. You do not restart; you salvage.

One twist, and it is the whole social layer: **committing publishes your board**. The arrangement you built is now on the TV, and the way you split that green run tells everyone precisely which tile you are missing. Play fast and you leak; play slow and you get rebased.

First to place two tiles from your rack wins; at 0:00 fewest tiles remaining wins.

## Technical approach

Host tab + phone PWAs against one authoritative Durable Object (PartyKit) per room.

Data model: `Table = Meld[]`, `Meld = TileId[]`; `Rack = {playerId → TileId[]}`; a monotonically increasing `baseVersion`. A commit is `{baseVersion, proposedTable, tilesSpent}` — the whole board, not a diff, because boards are ~30 tiles and whole-board validation is trivially correct.

Server validates: tile multiset conservation (proposed table = old table ∪ tilesSpent, exactly), every meld ≥3 and legal, tilesSpent ⊆ that player's rack. Valid → `baseVersion++`, broadcast. Stale `baseVersion` → reject with the new table attached.

Sync is server-authoritative with optimistic local drag; phones never see each other's sandboxes, so there is no shared-cursor problem at all.

The genuinely hard part is **rebase that feels fair rather than random**. Naively discarding a rejected commit is infuriating. The server returns the new base; the client diffs its sandbox against the *old* base into a set of meld-intents, then greedily re-applies each intent whose tiles are still unclaimed, in the order you built them. Second problem: arbitration under mobile latency — a player on bad wifi can genuinely be first-in-fingers and second-in-packets. v1 arbitrates by server receipt time and shows the losing phone the delta in milliseconds, because a visible "you lost by 240ms" reads as a race and an invisible one reads as a bug.

## v1 scope

- 3 players, 27 tiles (1–9 in three colors), no jokers
- Table seeded with two melds
- 4 tiles per rack, no draw pile
- One 90-second round; first to shed 2 tiles wins
- Rebase salvage + orphan tray; commit publishes your board

## Out of scope

Jokers, drawing, multiple rounds, initial-meld point thresholds, undo, spectators, sound.

## Risks & unknowns

Dragging 30 tiles on a 5-inch screen may be miserable — tap-to-select/tap-to-place is the fallback. Rebase may still feel arbitrary in the 3-way-collision case. Legality checking may be so helpful that the puzzle evaporates; a v1.1 toggle hides the per-meld badge.

## Done means

Three phones, one TV, one round: at least one player is visibly rebased mid-drag, correctly sees which of their melds survived, and the table on the TV is always a legal board that exactly conserves every tile in play.

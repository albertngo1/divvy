## Overview
A 10-minute tile game for 3 players around a TV. The shared board looks like Rummikub mid-game — four melds of numbered, colored tiles. Everyone holds three private tiles and everyone rearranges the whole board *simultaneously*, each in their own private sandbox. Then the server decides whose rearrangement actually survives.

## Problem
Rummikub, Scrabble, and every shared-tableau game have the same defect: the fun part — finding the rearrangement that lets your tile in — happens for exactly one person at a time while two or three others watch their hands hover over the table. The physical board is a mutex. Worse, in person you can undo forever, so a clever player can burn four minutes fiddling and the table can't even see whether they're close.

## How it works
**Host screen (public):** the shared board, four melds, big and color-coded. During the 75-second work phase it shows per player only two things: **tiles staged (0–3)** and a **green/red legality lamp**. So you can see that someone has all three tiles staged and is currently legal — pressure with no information.

**Phone (private):** your three-tile hand, which no one else ever sees, plus a fully draggable copy of the board — your dry fit. Drag existing tiles between melds, insert your own, and a validity strip marks each meld legal or broken as you go. Submit whenever; edit until the buzzer.

A submission is not a board, it's a **diff with preconditions**: "tile 7♦ was at meld 2, index 1 — I moved it to meld 4." At the deadline the server resolves once, deterministically, in **ascending order of tiles touched** (ties by submit time). Each diff applies only if every tile it leaned on is still where you left it. If not, it is **ORPHANED** — you play nothing.

So a one-tile play is nearly safe and goes first; a gorgeous plan that reshuffles seven tiles goes last and probably dies. The read is social: will the careful players disturb the meld I'm depending on? The TV replays the cascade one arrangement at a time, morphing the board and naming the exact tile that got pulled out from under each orphan.

## Technical approach
Socket.IO over Tailscale Serve, or a PartyKit room. Tile model: `{id, color, number, meldId, index}`. A single pure module — `validate(board)` and `applyDiff(board, diff)` — is imported by both phone and server, so a phone's lamp and the server's ruling can never disagree.

The elegant trick is that there is **no real-time sync at all during the work phase**: each phone mutates a local copy, and the server does one deterministic resolution pass at the deadline, emitting an animation script to the host. The hard parts are (1) precondition semantics — defining exactly which tiles a diff *asserts*, so "touched" is unambiguous and orphaning feels lawful; (2) thumb-scale drag UX for 15 tiles; (3) a legible sub-20s cascade animation; (4) dealing a start board where all three hands are individually playable but not jointly, so contention is guaranteed — a tiny setup solver, or hand-authored layouts.

## v1 scope
- 3 players, one round, 75 seconds
- 12 tiles in 4 melds, 3 tiles per hand
- Board dealt from three hand-authored, verified-contentious layouts
- No draw pile, no jokers, no round 2
- Score = tiles landed, +1 for landing all three

## Out of scope
- A full Rummikub game; jokers; drawing tiles; more than 3 players; undo history; reconnect; cross-round scoring; solo practice mode.

## Risks & unknowns
- Heads-down and quiet — the TV lamps are the only thing generating table talk, and they may not be enough.
- Phone drag-and-drop for small tiles is the biggest UX risk; a tap-to-select, tap-to-place fallback may be mandatory.
- Orphaning may read as unfair unless the replay clearly names the culprit tile.
- 75 seconds may be far too short for a genuine rearrangement.

## Done means
Three phones and a TV run one round; at least one submission is orphaned; the TV cascade shows the board morph and names the tile that broke that plan; and across 20 trial submissions the phone's legality lamp matches the server's authoritative ruling every time.

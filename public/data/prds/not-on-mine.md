## Overview

A short cooperative deduction game for 4–6 people, one shared screen and one phone each. The TV shows a grid of twelve images. The room must reach unanimity — everyone taps the same tile — within three silent rounds. The catch: each phone is privately missing two of the twelve tiles, a different two per player, and nobody knows whose is missing what. The only communication permitted, ever, is the anonymous vote tally the TV prints between rounds.

## Problem

Schelling-point party games ("pick the obvious one") die fast because the obvious one really is obvious. The interesting version is when the obvious choice is *unavailable to someone you can't identify* — then convergence stops being a vibe check and becomes an inference about who is constrained. Existing hidden-info party games hand that asymmetry to a traitor; here nobody is a traitor, everyone is partially blind, and the failure is collective.

## How it works

**Host screen (shared):** all twelve tiles, always complete, labelled A1–C4. Between rounds it prints the vote count per tile — `B2: 3, A1: 1, C4: 1` — and nothing else. No names, no reveal of who is blind to what.

**Phone (private):** the same grid, but two tiles are covered by an opaque slab you cannot lift or tap. You see the TV showing a tile you don't have; you know you're blind, you don't know how blind anyone else is. You tap one visible tile. Locked.

The engine: the room generates B2: 3 votes out of 5. Two people didn't vote for the crowd favourite. Are they stubborn, or is B2 blacked out on their phone? Round 2 tells you — if you switch to B2 and it still tops out at 3, someone genuinely cannot reach it, and the group must abandon its own best answer for a lesser tile that everybody can actually see. The satisfying move is voluntarily giving up the obvious choice.

Masks are generated so at least three tiles are visible to all players; the room wins on unanimity by round 3.

## Technical approach

Host tab + phone PWA, Socket.IO or PartyKit; state is trivial and entirely server-authoritative.

- **Data model:** `Room{code, phase: lobby|vote|tally|result, round, tiles[12], players[{id, name, mask:[i,j], vote|null}]}`. Masks are generated server-side at round start and **never** sent to any other client — the phone receives only its own `visibleTiles[10]`.
- **Sync:** no real-time pressure at all. Phones POST a vote over the socket; the server holds all votes until every player has locked, then broadcasts an aggregated `{tileId: count}` to the host and a bare "round over" to phones. Phones must not receive the tally in a form that leaks ordering by player.
- **Hard part:** mask generation, not networking. Masks need a guaranteed non-empty universal intersection, need to actually bite (the most salient tile should be masked for exactly one player often enough to matter), and must survive players dropping mid-round. That's a small constraint solver plus a salience prior over the tile set — hand-tuned in v1.

## v1 scope

- One board of twelve emoji-or-stock-photo tiles, hardcoded.
- 4 players, exactly 2 masked tiles each, 3 rounds, unanimity = win.
- Tally on the TV only. No timer. No scoring beyond win/lose and rounds used.
- Room code join, phones identified by a colour.

## Out of scope

Multiple boards, image packs, variable mask sizes, a traitor role, per-player scoring, chat, reconnect handling, any reveal of who was blind to what.

## Risks & unknowns

- Talking is the failure mode: with no timer, players will narrate. The rules must forbid it and the game is probably better with a 15-second lock timer added in v2.
- Three rounds may be too generous — the tally is high-bandwidth and the room may solve it in two, every time.
- If the tile set has no strong salience gradient, round 1 scatters randomly and the deduction never gets traction.

## Done means

Four phones join, each shows ten of twelve tiles with two slabs, no phone can see another's mask in its network traffic, votes stay hidden until all four lock, the TV prints a per-tile tally, and a seeded test board where the top-salience tile is masked for exactly one player is winnable in three rounds by a group that never speaks.

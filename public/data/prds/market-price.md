## Overview

A real group food order — restaurant table, takeout night, pizza — turned into a blind betting market on the final bill. The menu is the game board. Your dinner is your collateral. For any group of 4 about to order together.

## Problem

Ordering as a group is dead air: five minutes of "what are you getting?" "I dunno, what are *you* getting?" It's the most-consumed shared artifact in a friendship and it generates zero play. Meanwhile the one thing everyone is quietly tracking — how big is this bill going to be — is never spoken aloud.

## How it works

Host loads the menu (v1: paste items and prices, or use the bundled demo menu). The server computes an estimated total and deals each phone a **private line** — "Over/Under $84" — where the number is *different for every player*, plus an assigned side (you are long or short). Nobody knows anyone else's number.

Each phone also privately holds one **Appetite card**: a real constraint on your actual order ("must include something fried", "may not order the cheapest item in a category", "exactly two items").

Then five minutes of table talk, out loud, at the table. This is the whole game. Advocating for the ribeye is telegraphing that you're long. Suddenly announcing you're "not that hungry" is a tell. Everyone is trying to move a total they can't discuss.

Orders lock **simultaneously and blind** on each phone. The TV then reveals them one at a time as a rising bill, slot-machine style, and finally exposes everyone's hidden line — which is the punchline: *"you had SIXTY?"*

- **Private per phone:** your line, your side, your Appetite card, your order until lock.
- **Shared TV:** the menu, the running total, the reveal, the final line dump.

The simultaneity is non-negotiable — a passed phone means later orderers see the running total and the market dies.

## Technical approach

Deliberately light. One Durable Object per room: `room {menu[], estimate, phase, players:{id, line, side, appetiteCardId, order[], locked}}`. Sync is a lock barrier plus a reveal animation — no realtime physics, no reconnection heroics needed for a 12-minute session.

The hard part is not sync, it's the **line generator**. Draw lines naively around a bad estimate and half the table holds a mathematically unwinnable position, which they'll feel within ninety seconds and the game is exposed as theater. The estimate must come from the actual menu distribution (v1: median item price × players × 1.4), with lines drawn so the table's plausible outcomes genuinely straddle every player's number. Second design hazard: with private lines, the longs' dominant strategy is "order the most expensive thing" — defused by a 2-item cap and a 20-second pre-round taste tap where you mark items you wouldn't eat, which then score against you.

## v1 scope

- One hardcoded 20-item demo menu
- Exactly 4 players, one round, no accounts
- Lines = estimate ± {−20%, −8%, +8%, +20%}, shuffled
- Four Appetite cards total
- Host manually confirms the real final bill to resolve
- No persistence between sessions

## Out of scope

OCR from a menu photo, POS/delivery integration, check splitting, multi-round, dietary filters, more than four players.

## Risks & unknowns

Untestable dry — it needs a real meal, so iteration speed is a meal per iteration. Dietary restrictions collide head-on with Appetite cards; that's an accessibility requirement, not a nitpick, and the skip must not void your score. "You have to eat it" can genuinely sour someone's dinner and needs an opt-out that doesn't hollow out the stakes. And table talk may just degenerate into everyone honestly announcing their line — needs playtesting to see whether the reveal-shame is enough to keep people lying.

## Done means

Four people, one table, one real order placed. Someone ordered a thing they did not want because their line demanded it, ate it anyway, and the reveal of the four hidden numbers got a laugh.

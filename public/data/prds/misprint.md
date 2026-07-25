## Overview

A 4-player hidden-role game for a TV plus phones. The room cooperates on one shared puzzle chain. Everyone's phone privately holds the rulebook and, on your turn, greys out every tile your rules forbid. Three rulebooks are identical. One is a misprint — a single clause reversed. Its owner is not told. They will play a perfectly consistent, perfectly baffling game.

## Problem

Hidden-role deduction almost always hides *information*: a word, a card, an identity. Hiding the **rules** is barely explored, and it inverts the social texture. Nobody is lying. Nobody is even trying to deceive. The imposter is the most sincere person at the table — and the deduction becomes "whose behaviour implies a different physics?" The phone is the instrument of the gaslighting: it silently enforces your reality.

## How it works

The host screen shows a 4×4 grid of 16 tiles, each a colored shape (red/blue/green/yellow × circle/square/triangle), plus the **chain** built so far.

Players take turns claiming one tile into the chain. Turn order is fixed; two rounds of four turns = eight tiles.

Each phone privately shows:
- **Your rulebook**: three plain-English clauses, e.g. *(1) never repeat a color twice in a row; (2) the new tile must share a **shape** with the previous tile; (3) corners are only legal on your first claim.*
- On your turn: the grid, with tiles legal *under your book* tappable and everything else dimmed and unresponsive.

The misprint's clause 2 reads **color** instead of **shape**. Same layout, same length, one word different.

The host screen shows the chain and whose turn it is — never anyone's rulebook, never anyone's legal set. Talking is unrestricted and is the whole game: "why would you take the blue triangle, there was a red one right there."

If a player has no legal tile, they must **PASS** — which is a loud, delicious tell.

After eight turns everyone privately votes for the misprint. The misprint scores for staying hidden; others score for a correct vote; the misprint gets a bonus for voting for *themselves*, having reasoned their own book was wrong from how everyone reacted to them. Reveal: TV shows both rulebooks side by side and replays the chain, highlighting the divergence turns.

## Technical approach

Host tab + phone PWAs + authoritative Durable Object (PartyKit) per room.

State: `{ grid: Tile[16], chain: TileId[], turnIdx, books: Map<playerId, Rulebook>, misprintId, votes, phase }`. A `Rulebook` is a small array of predicate descriptors, evaluated server-side. On each turn the server computes the legal set **under the mover's own book** and pushes it to that socket only; a claim is accepted iff it passes that mover's book. Every other client receives only the resulting chain.

The hard part isn't sync (strictly turn-based, one writer at a time) — it's **grid generation**. You need a 16-tile layout plus a rulebook pair where, for all eight turns and any plausible play sequence, both books leave ≥1 legal tile (or a pass is rare and meaningful), *and* the two books diverge often enough that the misprint's play visibly deviates by turn three. That's a constraint solver over a small search space plus rejection sampling on simulated random playouts.

## v1 scope

- 4 players, one grid, one rulebook pair, one 8-turn round
- Three hand-authored clauses; exactly one clause swapped
- 15s soft turn timer, auto-pass on expiry
- One private vote, one reveal screen with side-by-side books

## Out of scope

- Multiple rounds, scoring across games, difficulty tiers
- Two misprints, or a misprint who knows
- Procedural rulebook generation beyond the one authored pair
- Reconnect, spectators, phone rotation/landscape

## Risks & unknowns

- May read as arbitrary rather than deducible — if the honest players can't articulate the rule aloud, they can't spot deviation. Clause wording is load-bearing.
- Pass-frequency tuning: too many passes and the misprint is instantly obvious.
- Eight turns may be too few to accumulate evidence; 12 may be too long for one sitting.

## Done means

Four phones join, each independently enforces its own legal set (verified by a phone that can't tap a tile another phone could), an 8-tile chain completes on the TV, votes resolve, and the reveal replays the divergence — with at least one playtest where an honest player says "that move was insane" about a move that was, from that phone's side, the only sensible one.

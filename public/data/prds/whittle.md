## Overview
Whittle is a silent, iterative Schelling-point game for 3–6 players. Starting from a grid of twelve tiles, the room whittles it down to one over a few tense ticks — and you win as a team only if you all independently ended up protecting the *same* survivor. No talking, no vote counts, just gut-reading the room.

## Problem
One-shot matching games (pick a word, reveal, done) are over in a blink and have no arc. The itch here is the *converging narrative* — a board visibly collapsing tick by tick, with a live protect-vs-predict tension: do you guard the obvious tile, or the one you think everyone *else* will rally to? That drama only exists if the round unfolds in stages and the counts stay hidden.

## How it works
The host TV shows a 12-tile grid (emoji or short words) and an 8-second tick clock. Each tick, every **phone privately** taps ONE tile to 'protect.' When the clock hits zero, the server tallies (secretly) and eliminates the bottom few tiles. The host animates *which* tiles died — but **never the counts or who protected what**. If your protected tile got eliminated, your phone forces you to re-pick from the survivors next tick. Repeat until one tile remains. The room wins if a majority converged on that final survivor.

**Private per-phone:** your current protected tile, your 'your tile survived / your tile died, re-pick!' state. **Shared host:** the shrinking grid, the tick timer, the elimination animation, the final win/lose.

Withholding counts is the whole trick — reveal them and everyone just follows the leader, collapsing the tension. Coarse 'these three died' feedback keeps you guessing at popularity.

## Technical approach
Authoritative WebSocket room (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { tiles: [{ id, alive }], round, picks: { playerId: tileId }, deadline }`. Each tick is a **barrier**: collect all picks, eliminate the lowest-k alive tiles, then mark any player whose pick just died as `mustRepick`.

The hard part is barrier fairness: handling players whose tile dies mid-commit, players who never tapped (auto-hold or auto-drop?), and ties at the elimination boundary. It's small, but the re-pick flow must feel instant on the losers' phones the moment the grid changes, or they'll protect a ghost.

## v1 scope
- 12 hardcoded tiles → whittled to 1.
- 3–5 players, 8-second ticks, ~3–4 ticks total.
- Team win if a majority landed on the survivor.
- Room-code join, LAN only.

## Out of scope
- Per-player scoring or leaderboards.
- A tile/category generator.
- Sophisticated tie-breaks beyond a fixed rule.
- Reconnection, spectators, install polish.

## Risks & unknowns
- Degenerate play: everyone piles on the one obvious tile and it's boring.
- Elimination ties need a rule that doesn't feel arbitrary.
- One stubborn contrarian can force a loss with no counter.

## Done means
Four phones join a room; each tick all players privately protect a tile; the grid shrinks with the correct tiles eliminated; any player whose tile died is instantly forced to re-pick from survivors; the round ends on a single tile with a correct team win/lose verdict.

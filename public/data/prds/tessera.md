## Overview
Tessera is a 3–5 player hidden-role construction game. Players collaboratively rebuild a mosaic on the shared TV by taking turns placing colored tiles, each working from a private "cartoon" (the master pattern) shown only on their phone. Every cartoon is identical except one — the imposter's — which has three tiles recolored. For groups who like Spyfall's "act natural" pressure but want it expressed through actions on a board instead of small talk.

## Problem
Social-deduction sabotage usually happens in conversation, so it lives or dies on verbal bluffing. Tessera moves the tell into *play*: the traitor sabotages by placing tiles, and every placement is a permanent, public, scrutinized artifact. And because no one is told they're the imposter, the core dread is structural — "the board contradicts my blueprint… is everyone else wrong, or am I the corrupted one?"

## How it works
The TV shows an empty 5×5 grid — the shared mosaic, visible to all. Each phone PRIVATELY shows that player's cartoon: a fully-colored 5×5 target. Server secretly designates one imposter and corrupts three cells of ONLY their cartoon.

On your turn you tap one empty cell on your phone and pick a color; the tile appears on the shared TV instantly for everyone. Play proceeds in turn order until the grid fills (25 placements, ~5 each). Whenever a placed tile contradicts YOUR private cartoon, you feel it — but you can't see anyone else's cartoon, so you can't know if the placer is the traitor or if your own blueprint is the bent one. Talking is allowed and encouraged; the imposter must place their three corrupted tiles somewhere while looking like an honest builder (ideally on cells where the corruption is plausible or on tiles someone else already "got wrong").

When the grid fills, every phone privately votes for the suspected imposter. **Group wins** by voting the imposter out. **Imposter wins** by surviving the vote AND getting ≥2 of their 3 corrupted tiles onto the final board. Reveal overlays both cartoons on the finished mosaic.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `Round { cartoon: color[25], imposterId, corruptedCells: {i, color}[], board: (color|null)[25], turnOrder, currentTurn, votes }`. Server holds the canonical cartoon, derives the corrupted variant, and pushes each phone ONLY its own cartoon; board placements broadcast to all. Sync is turn-gated so it's simple — the hard part is **tuning corruption placement** so the imposter has a real chance to hide (three cells too clustered = instant tell; too scattered = unwinnable), plus enforcing strict turn authority server-side so no one can place off-turn or on an occupied cell.

## v1 scope
- Exactly 3 players, 1 round, one fixed 5×5 cartoon + one fixed corruption.
- 4-color palette, turn-based placement, one final vote.
- Reveal = both cartoons overlaid.

## Out of scope
- Multiple rounds/scoring, variable grid sizes, >1 imposter, undo, chat, timers.

## Risks & unknowns
- Balance: does 3 corrupted cells in 25 give the imposter a fair hide? Needs playtest.
- Small grids may resolve too fast to build suspicion; 5×5 is a guess.
- Turn-based pacing could drag for spectators between your turns.

## Done means
Three phones each show their private cartoon (one corrupted); players place tiles in turn onto a shared TV mosaic that updates live; the grid fills, everyone votes, and the reveal correctly shows whether the group identified the imposter and how many corrupted tiles survived — with no phone ever seeing another's cartoon.

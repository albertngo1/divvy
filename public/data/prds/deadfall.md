## Overview
Deadfall is an asymmetric race for 4–5 players. One player is the Warden who secretly seeds a grid with traps — their phone IS the board. Everyone else is a Runner crossing it blind on their own phone, and the twist is social: every trap you discover is private knowledge you can hoard or broadcast. For groups who like Battleship-style deduction with a backstabby edge.

## Problem
Almost every "blind pieces + map-holder" game is purely cooperative — the holder WANTS you to win, so the map is just a bottleneck. The itch: what if the board-holder is your enemy AND your fellow pieces are your rivals, so the information on your phone is a currency to be spent, not just a tool to be used?

## How it works
Warden phone (the board): a 6×6 grid; the Warden privately taps 6 tiles to place deadfalls, then it locks. Host TV shows a blank 6×6 with only Runner pawns on the bottom row. Each Runner phone PRIVATELY shows their own pawn plus a d-pad. Each round every Runner secretly commits one move (up / left / right); the server resolves simultaneously and animates all pawns on the host screen at once. Step on a deadfall → you respawn on the bottom row and your phone PRIVATELY learns that trap's exact tile (only you). Reach the top row to win.

The knife twist: on any turn a Runner may instead BROADCAST one known trap to the whole room (it appears on the host grid forever) rather than moving. Sharing saves the team from wasted deaths but hands rivals a free safe path. The Warden scores a point per deadfall triggered, so the Warden is quietly rooting for hoarders — a three-way tension baked into one action.

Private vs shared: Warden phone = secret trap layout (the true board). Each Runner phone = own pawn + own privately-discovered traps. Host = public pawn positions + only the traps someone chose to broadcast.

## Technical approach
Host + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `traps:Set<tile>` (server-only), `runners[id]→{pos, knownTraps:Set}`, `publicTraps:Set`, `phase`. Sync: simultaneous-commit pattern — buffer each round's moves, resolve on a single server tick, then fan out ROLE-FILTERED state (each Runner receives only their own `knownTraps`; host receives only public state). The hard part: the simultaneous reveal must stay readable when 4 pawns move and 2 die at once, and per-phone state must be strictly filtered server-side so a sniffed socket can't leak the trap map.

## v1 scope
- 1 chase, 6×6 grid, 6 traps, 1 Warden + 3 Runners.
- Moves up/left/right; simultaneous commit; respawn-on-trap.
- Broadcast-a-trap action; first-to-top wins, Warden scores triggers.
- Room-code join.

## Out of scope
- Multiple rounds / best-of, trap types, Warden relocating traps.
- Runner-vs-Runner blocking or power-ups.
- Persistent scores or accounts.

## Risks & unknowns
- Balance: 6 traps on 36 tiles — deadly enough to matter, sparse enough to cross?
- Does the hoard-vs-share dilemma actually bite with only 3 Runners?
- Simultaneous-move readability on the shared screen.

## Done means
The Warden seeds traps only they can see, three Runners cross blind on private phones, discovered traps stay private until someone chooses to broadcast, and a full chase resolves to a winner — with at least one playtest cry of "who told everyone about MY trap?!"

## Overview
Deadfall is a competitive hidden-board game for 3–4 people. One player (the **Trapper**) holds a phone that is the board and secretly plants traps on it. The others (the **Quarry**) each move a token blind across that same board, guided only by a private, ambiguous danger sense on their own phone. Quarry try to cross; the Trapper tries to catch them all.

## Problem
Hidden-movement board games (Scotland Yard, Nuit) need a physical board and a trusted screen. On phones, people just peek. Deadfall makes peeking impossible — the Trapper's plan lives on *their* phone, and each Quarry's warning is *personal*: you know danger is near, but not where. That ambiguity is the whole game, and it only exists with private per-phone state.

## How it works
- **Host TV (shared):** the grid with Quarry tokens visible as dots, traps hidden. Shows who's alive and the goal edge. The Trapper reads the room off this screen.
- **Trapper phone (PRIVATE):** the full grid. Before the round and once per turn, the Trapper taps to arm up to N traps (hidden from everyone else). Sees exact Quarry positions.
- **Quarry phones (PRIVATE):** a 4-way pad, terrain blank, plus one 'danger sense' light. On your turn, if ANY of your 4 neighboring tiles holds a trap, the light glows amber — but not which direction. You commit a move; step on a trap and you're out (host TV flashes it).
- All Quarry move simultaneously each turn. The vague warning breeds paranoia: freeze and lose tempo, or gamble a direction. The Trapper bluffs by leaving gaps and clustering pits.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object, or Socket.IO over Tailscale Serve). Data model: `{ grid:[[cell]], traps:Set<tileId>, quarry:[{id,pos,alive}], turn }`. Trapper emits `armTrap(tileId)`; Quarry emit `move(dir)` on a turn timer; server resolves moves, computes each Quarry's *private* adjacency-to-trap boolean, and broadcasts role-redacted state — Quarry never receive trap positions, only own danger bit. Hard part: keeping trap data server-side-authoritative so a network sniff can't reveal it, and tuning the danger radius so warnings are useful but ambiguous (4-neighbor, direction-hidden feels right).

## v1 scope
- 1 Trapper + 2 Quarry.
- One fixed 5×5 grid; Quarry start bottom row, goal top row.
- Trapper pre-arms 3 traps, may re-arm 1 per turn.
- One round; Trapper wins if both Quarry are caught, Quarry win if either reaches the top.

## Out of scope
- More traps, trap types, moving traps.
- Multiple rounds / role rotation / scoring.
- Reconnect, spectator view, animations.

## Risks & unknowns
- Danger sense too precise = trivial; too vague = coin-flip.
- Trapper may feel passive between arms — may need a 'bait' action.
- Balance for 2 vs 3 Quarry untested.

## Done means
Three phones join; the Trapper arms traps only they can see; each Quarry gets a private amber warning with no direction; simultaneous blind moves resolve; a caught Quarry drops on the host TV; the round ends with a clear Trapper-or-Quarry win.

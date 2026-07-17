## Overview
Feeler is a 4-player asymmetric game: one **Warden** secretly builds a wall-maze visible only on their phone; three **Feelers** grope across the same grid, blind, and must reach the far edge before the move budget runs out. The novel lever: each Feeler only learns the walls *their own* token has personally bumped, so the true map lives in three private, partial memories that must be spoken aloud to combine.

## Problem
Hidden-maze games (Labyrinth, 'Séance') either give everyone the same reveal or reduce to one person doing the deducing. The itch: make the discovery *distributed and private*, so the game is three people frantically reconciling contradictory partial maps—'wait, there's a wall NORTH of B3? I went through there.'

## How it works
- **Warden's phone (the map/board):** a 5×5 grid where the Warden taps edges to place ~8 interior walls before the round, plus a fixed start edge and exit edge. This is the ONLY complete view of the maze. During play the Warden silently confirms bumps—they cannot give directions, only adjudicate.
- **Host TV:** shows the bare 5×5 grid with three token dots and the move counter. No walls, ever. It's the shared public position tracker.
- **Each Feeler's phone (private):** their own token, four move buttons (N/E/S/W), and a personal notebook grid that fills in ONLY the wall segments they have personally hit. Attempting to move into a wall: the server pings the Warden, the move is refused, that Feeler's token stays put, a move is spent, and that one wall inks onto *only that Feeler's* private notebook.

Since each Feeler remembers a different subset of walls, and tokens share the same physical maze, the table has to talk: merging three partial maps is the whole game. Win = all three tokens reach the exit edge within 20 total moves (shared budget). Warden wins otherwise, and scores on moves-remaining-denied—giving maze design real teeth.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). **Data model:** `maze{walls:Set<edgeId>, exitEdge}` (Warden-private), `tokens:[{id,cell}]` (public), `known:{feelerId->Set<edgeId>}` (per-Feeler private), `movesLeft`. **Sync strategy:** server is authoritative on the maze and validates every move against `walls`; it broadcasts token cells + counter to the host, and pushes newly-revealed edges only to the Feeler who hit them. Warden gets a bump event to acknowledge. **Genuinely hard part:** trust and consistency, not latency—the server must be the single source of maze truth so the Warden literally *cannot* cheat mid-round (walls locked at round start, hashed and shown as a commit count on the TV so Feelers know it's fixed).

## v1 scope
- 1 Warden + 3 Feelers, one 5×5 maze, 20-move shared budget.
- Bump-to-reveal, per-Feeler private notebooks, single exit edge.
- Win/lose splash; no rematch, no scoring beyond win/lose.

## Out of scope
- Warden moving walls mid-round; multiple mazes; larger grids.
- Traps, keys, fog beyond wall-memory.
- Reconnection of the Warden mid-round (locked maze only).

## Risks & unknowns
- 20 moves may be too tight or too loose; needs tuning against maze density.
- Feelers may just ignore private notebooks and brute-force—tune budget so pooling is mandatory.
- Warden could be passive/bored; commit-hash + schadenfreude may be enough for v1, or add one 'seal a door' action later.

## Done means
Four phones join, the Warden places walls that never appear on the TV, three Feelers each accumulate a *different* private wall-map by bumping, and a table can win or lose one 5×5 round governed entirely by the server's locked maze in a playtest.

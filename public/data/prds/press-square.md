## Overview
Press Square is a 4-6 player cooperative party game. One player is the Operator and holds the map on their phone. Everyone else is a Piece who sees no map at all. Each Piece is a grey dot on a grid and has a secret color matching one exit. The Operator sees every dot and every exit, but the dots carry no labels. The Pieces know their own color, but each one's controls are scrambled differently. The game is aimed at groups who like Spaceteam's shouting and want to solve a puzzle by thinking out loud together.

## Problem
In most map-holder games the person with the map knows everything and the pieces just follow orders. That turns the map-holder into a narrator. In Press Square the Operator has a large view but doesn't know how anything is wired. They have to run experiments: probe the system, watch which dot moves, and narrow down the possibilities. Every probe costs moves from a budget the whole team shares.

## How it works
- **Operator phone (private):** an 8x8 grid with walls, four colored exits, N grey dots, and a move counter starting at 30. There is no identity information anywhere.
- **Piece phones (private):** four big buttons ● ▲ ■ ◆, plus your secret color shown as a swatch. Each phone maps the shapes to N/E/S/W using a different random permutation. Nobody, including you, knows your mapping.
- **Host TV (shared):** the move counter, a log of commands like "ALL: ■" or "Sam: ▲", and a lit/unlit indicator per player. It never shows the grid.
- The Operator talks out loud. They can give a **broadcast** ("everyone press square"), where every Piece taps that shape at the same moment and it costs 1 move. Or they can give a **targeted** command ("Sam, press triangle"), which also costs 1 move.
- Broadcasts are cheap but anonymous: four dots slide in four directions, and the Operator only sees the result. Targeted commands reveal who someone is, but they burn the budget much faster. That trade-off is the whole game.
- Pieces may say their color out loud, but the Operator still doesn't know which dot is theirs.
- A dot that hits a wall doesn't move. That is information too.
- Win: every dot is on its own colored exit before the budget hits 0.

## Technical approach
The host tab and the PWAs connect to a PartyKit room. State: `{grid, exits[color]→cell, pieces[id]→{cell,color,perm[4]}, budget, phase, pending}`. The Operator taps a command chip (ALL or a player name, plus a shape) to arm it. The server then waits up to 4s for the addressed phones to press that shape and resolves all the moves together, processing them in id order so collisions behave the same every time. Phones send only `press(shape)`, and the server ignores presses of the wrong shape. Only the Operator receives cell positions, and dot ids are shuffled for each client so they can't be read out of the payload. **Hard part:** making a broadcast feel simultaneous. Animate all dots together after the server resolves them, and don't optimistically move any single dot.

## v1 scope (humiliatingly small)
- One round, 1 Operator + 3 Pieces
- One hand-made 8x8 map, budget of 30
- Permutations re-rolled every game; no pieces block each other (dots can share a cell)
- Win/lose screen showing each Piece's true mapping

## Out of scope (for now)
Multiple rounds, procedurally generated maps, mappings that drift mid-game, competitive teams, sound.

## Risks & unknowns
- A sharp Operator might solve it the same way every time: one targeted press per Piece per shape. Fix: tune the budget so that strategy loses.
- With 5+ Pieces, broadcasts may become unreadable.
- Pieces may feel passive. Possible fix: give each Piece one "peek at your own row" token.

## Done means
Four phones join with a room code. The Operator sees the grid and the other three don't. A broadcast moves all dots in one resolved tick. The budget decrements. A playtest group either wins or loses, and at least one round has someone shout "wait, then YOU'RE the one in the corner!"

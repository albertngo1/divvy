## Overview
Lockstep is a 4-player cooperative escape puzzle for a living room. One player is the Navigator, whose phone privately shows a small hazard grid; the other three are Pieces, whose phones show only a d-pad and their own status. The room's shared host screen shows a fog-covered board and a survivor count. It's for groups who like tense, talky coordination puzzles — Keep Talking and Nobody Explodes energy, but everyone moves at once.

## Problem
Most 'one person has the map' games collapse into the map-holder narrating a solution turn by turn while everyone waits. The itch: make the map-holder genuinely unable to see the consequences of their own instructions, so the blind pieces have information the sighted navigator lacks.

## How it works
All three Pieces occupy different starting cells on the same 6x6 grid, dotted with pits. The Navigator calls a single direction out loud — 'NORTH!' — and taps it on their phone. Every Piece moves one cell in that direction simultaneously (true lockstep). A Piece that walks into a pit is out; a Piece that walks into a wall stays put.

PRIVATELY, per phone:
- **Navigator's phone:** the full grid with pit locations and the target exit — but Piece positions are shown only as last-known-good, NOT live (see below), and it never shows who is alive.
- **Each Piece's phone:** a d-pad-free status card that flashes green (moved), amber (blocked by wall), or a hard red buzz + haptic when THAT player just fell. It never shows the map.

Because the Navigator can't see who died, Pieces must SHOUT their fate ('I'm out!', 'I hit a wall!') and the Navigator must rebuild their mental model from voice. The single move that saves one Piece may kill another, so the puzzle is finding a direction sequence that threads all survivors to the exit. Win = at least two Pieces reach the exit cell.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `{grid: cell[36], pieces: {id, pos, alive}[], exit}`. On each Navigator command the server resolves all Piece moves atomically, computes collisions/pits, and pushes each Piece a private `outcome` event (moved/blocked/fell) plus a haptic flag — but pushes the Navigator only an aggregate `survivorCount`, deliberately withholding per-Piece positions after step one. Sync is trivial (turn-based, one authoritative resolve per command). The genuinely hard part is tuning information starvation: enough that voice matters, not so much the Navigator is flying totally blind. Haptic timing on iOS PWAs (vibration gated by user gesture) is the fiddly bit.

## v1 scope
- 1 Navigator + exactly 3 Pieces
- One fixed 6x6 grid, hand-authored to be solvable
- Four commands only: N/E/S/W
- Host screen: fog board + survivor count, nothing else
- Win/lose banner, then reset

## Out of scope
- Multiple levels, level editor, procedural grids
- Piece-specific abilities, diagonal moves
- Scoring, timers, multi-round campaigns

## Risks & unknowns
- Does hiding live positions from the Navigator frustrate or delight? Needs playtest.
- Voice chaos with 3 people shouting fates at once may overwhelm the Navigator (feature or bug?).
- Lockstep can create unsolvable states from bad calls — need a graceful 'everyone dead' reset.

## Done means
Four phones + a TV: the Navigator issues N/E/S/W calls, all three Pieces move in unison, each faller's phone buzzes red privately, the Navigator sees only a survivor count, and a hand-authored grid is winnable within ~10 commands using voice coordination alone.

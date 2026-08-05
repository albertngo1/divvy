## Overview
A 4-player cooperative navigation game where exactly one phone is the board. The Sergeant's phone shows a 6×6 hazard grid, an exit, and three unlabeled dots. The other three players *are* those dots and see none of it. The Sergeant can only issue one public direction per turn — heard by all three at once — and each dot secretly warps that command differently.

## Problem
Blind-maze games collapse into one person dictating and everyone else typing. The itch: give the guide *incomplete* information too, so the pieces are worth talking to. Here the Sergeant can see the terrain but cannot tell the pieces apart, and cannot address them individually. Authority without addressability.

## How it works
Setup: 3 pieces spawn on a 6×6 grid with pits and one exit. Each piece is privately dealt a **quirk** from a small deck — MIRROR (E/W swapped), EAGER (moves 2), DRAG (ignores the first command after any HOLD), BRACE (moves only on HOLD), PLUMB (obeys normally — the boring one, which is itself information).

Each turn the Sergeant *says out loud* one word: NORTH / SOUTH / EAST / WEST / HOLD. Pieces then tap CONFIRM; their phone applies their quirk automatically — they cannot cheat their own quirk, and they cannot see where they land.

**Sergeant's phone (the board):** full terrain, exit, three dots rendered in a shuffled anonymous order that stays stable all game. They watch three dots respond to one word in three different ways and must infer who is who.

**Each piece's phone (private):** a compass rose, shared lives (3), their own quirk card, one unspent BREAK RANKS token, and a buzz+red flash if they just fell in a pit — with no indication *where* the pit was.

**Host TV (public):** the command log, the turn counter (12 max), lives, and a fog silhouette showing only that *something* moved. No terrain.

Talking is free and constant: pieces describe their quirk badly, the Sergeant tests hypotheses by burning a turn on a probe command. BREAK RANKS lets a piece ignore the order and move a direction of their choosing — usually a disaster, occasionally the win.

Win: all three dots on the exit tile within 12 commands with lives remaining.

## Technical approach
PartyKit Durable Object per room; authoritative server state `{grid, tiles[], actors:[{playerId, renderId, pos, quirk, tokenUsed}], turn, log[]}`. Turn-based, so sync is trivial — the hard part is **redaction and anonymity**. Piece sockets must never receive the grid or other actors: the server builds a per-socket projection, not a filtered client render. `renderId` is a per-game shuffle so dot order carries no identity signal, and pit-hit events are emitted to the victim as a bare `{hit:true}`.

Second hard part is content: quirk triples must be *distinguishable within 12 turns* and the board must be solvable. Ship a brute-force solver that validates each (map, quirk-triple) pair offline; only hand-verified pairs go in v1.

## v1 scope
- Exactly 4 players, fixed roles, one round
- One hand-authored 6×6 map, one validated quirk triple
- 5 quirks total, 12 turns, 3 shared lives
- One BREAK RANKS token per piece
- Win/lose screen with the map finally revealed to everyone

## Out of scope
Multiple rounds, rotating Sergeant, scoring, matchmaking, larger grids, generated maps, a traitor role, animation polish.

## Risks & unknowns
Quirks may be too easy to just *say aloud* — mitigate by making quirk text deliberately vague ("you are eager"). The Sergeant may bottleneck into a monologue; the 12-turn cap and the probe cost push against it. Anonymous dots may be visually unreadable at 3 dots — test 4.

## Done means
Four phones join a room code; only the Sergeant's device ever receives grid data (verified by inspecting the piece socket payloads); a spoken command produces three different, quirk-correct moves; and a group that has never played wins or loses within 8 minutes and can explain what each quirk was.

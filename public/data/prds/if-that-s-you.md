## Overview
A 4-player cooperative navigation game (one Cartographer, three Pieces) that runs about six minutes. The Cartographer's phone is the only map in existence. The Pieces are dots on it who cannot see it, and whose names the Cartographer is not allowed to use.

## Problem
Every blind-navigation party game degenerates into "Alex, go left. Sam, go up." One-to-one addressing turns the game into a typing-speed problem and reduces the Pieces to keyboards for the Holder's brain. The interesting question — *which of you is which?* — is answered for free in the first ten seconds.

## How it works
The TV shows only two things: a shared step budget (24) and a goal counter (0/3). No map, ever.

The Cartographer's phone shows a 7x7 walled grid with three colored doors, three shape-tokens, and three **grey, unlabeled** dots. They can see everything move; they know nothing about who is who.

Each Piece's phone shows a private goal card ("token: TRIANGLE, then door: RED"), four direction pads, and nothing else — no position, no map, no walls.

The Cartographer types one command per turn. It appears verbatim on the TV and on every Piece's phone, and the client **rejects any command containing a player name or seat number**. Commands are conditional: *"If your token is a triangle, step north."* *"If your door is not blue, step west twice."*

All three Pieces then privately and simultaneously submit a direction or PASS. Everything resolves at once. Each move that actually happens costs 1 from the shared 24. Two dots entering the same cell bounce and still pay. The Cartographer watches which grey dots moved and infers identity from the pattern — that inference *is* the game, and every probe costs steps the room needs.

## Technical approach
Host browser tab + phone PWAs + a PartyKit Durable Object per room. Authoritative state: `grid` (one of five handcrafted 7x7 maps), `pieces[{seat, pos, goal, hasToken}]`, `budget`, `phase`. Phase machine: COMMAND (Cartographer only) → COMMIT (Pieces submit sealed intents; TV shows "2/3 locked" and nothing more) → RESOLVE (broadcast diff).

This is turn-based, so latency is easy. The hard parts are (a) **leak-proofing** — intents live server-side and are never echoed to peers before resolve, or the whole bluff surface collapses; (b) **order-independent simultaneous resolution** — apply all moves optimistically, then revert every pair that collides, iterating to a fixed point so no piece gets an advantage from seat order; (c) the **name filter**, which must catch nicknames and initials (lobby names + Levenshtein ≤1 + a manual banned-word list, with a soft warning rather than a hard block on false positives).

## v1 scope
- Exactly 4 players, exactly 1 map, exactly 1 round
- 24 steps, 3 goals, binary win/lose — no scoring
- 8 canned condition templates with a fill-in blank (typing full sentences kills pace)
- No reconnect, no lobby art, no sound

## Out of scope
A saboteur Piece who obeys other people's conditions; fog on the Cartographer's own map; rotating the Cartographer mid-game; multiple maps; leaderboards.

## Risks & unknowns
If the goal-card space is too small, identification is trivial — needs two independent axes (3 doors x 3 tokens = 9 distinguishable conditions). The name ban is app-enforced only for typed text; a Cartographer can still say a name out loud, so the TV command is treated as the canonical, legal order and the room polices the rest.

## Done means
Four phones and a TV; across five playtests the room clears all three goals inside 24 steps at least once, the Cartographer issues at least one condition that exactly two of three Pieces act on, and a WebSocket capture shows no Piece's client ever receives another Piece's intent before RESOLVE.

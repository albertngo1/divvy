## Overview

A 4-player cooperative puzzle for a TV and four phones, built on one inversion: the person holding the map cannot move the pieces. They can only move **the map**. The three blind Pieces move themselves, simultaneously, in the same instant the world slides under them — and each Piece's phone secretly forbids them a different kind of step, a rule they know and nobody else does.

## Problem

Map-holder games make the holder a dispatcher and the pieces a set of hands. Nobody is solving the same problem at the same time. Here the Holder is a level designer working live, under a 3-second clock, against three plans they can't read — and the Pieces have to discover, out loud, why their perfectly reasonable instructions keep failing.

## How it works

A 6x6 wrapping terrain grid holds three goal tiles (one per Piece) and some blocked tiles. Every 3 seconds the round ticks.

On each tick, **simultaneously**:
- Each Piece taps one of four directions on their phone. Their pawn attempts one step in screen-fixed space.
- The Holder taps one **global transform**: shift the entire terrain one row/column (wrapping), or rotate it 90°. Pawns do not move with it — the world slides beneath them.

Both are revealed and resolved together, so neither side can react to the other. Talking is allowed and encouraged; the tension is that the Holder is committing blind to what three people are about to do.

- **Holder's phone (private):** the full terrain, the three goals, the three live pawns, and a transform pad. This is the only view of the board anywhere.
- **Each Piece's phone (private):** four direction buttons, a secret constraint card visible only to them ("never step the same direction twice in a row", "you may only move on odd ticks", "you must alternate horizontal and vertical"), and a single lamp: did my last step succeed or was it refused?
- **Host TV (public):** three lamps reading MOVED / BLOCKED / REFUSED per Piece, the tick countdown, and a goals-reached counter. Never the terrain.

A REFUSED lamp is the room's only clue that someone is playing under a rule — the Holder must infer three hidden constraints from failure patterns while still solving the geometry. Win: all three pawns stand on their own goals at the end of the same tick.

## Technical approach

PartyKit Durable Object (or Socket.IO over Tailscale Serve) as the authority. State: `{ terrain: Tile[36], offset: {dx,dy,rot}, pawns: {id: {x,y}}, constraints: {id: RuleId}, tick }`. Terrain is stored once; the Holder's view is terrain rendered through `offset`, pawn coordinates are screen-fixed so a transform silently changes what every pawn is standing on.

Sync: hard 3s server ticks with a 300ms input freeze before close. Intents buffered, resolved in one pass — constraints evaluated first (refusal), then movement, then the Holder's transform, then goal check. The hard part is that a *rotation* remaps the entire coordinate frame mid-flight; resolution order must be fixed and identical for replay, or the room will correctly accuse the game of cheating. Phones receive only `{result, lampState}`; the terrain array is never serialized to a Piece socket.

## v1 scope

- 4 players fixed: 1 Holder, 3 Pieces. One round, ~20 ticks, then win or bust.
- Three hardcoded constraint rules, dealt one per Piece.
- Two transform types only: shift-by-one and rotate-90.
- One hand-authored terrain layout. No generation.
- TV shows three lamps and a clock. Nothing else.

## Out of scope

Multiple rounds, more Pieces, constraint reveals or trading, hazards, undo, animation of the slide beyond a 200ms tween, scoring.

## Risks & unknowns

Simultaneous resolution with a rotating frame is genuinely confusing for the first three ticks — the tutorial may need to be the first round itself. Wrapping terrain may make the puzzle too loose to ever feel solved; a fixed border is the fallback. Three hidden constraints on top of blind simultaneity may be one layer too many, in which case constraints go public on the TV and the game is still playable.

## Done means

Four phones join, the terrain renders only on the Holder's phone, and a full 20-tick round resolves with a deterministic replay the TV can scrub — including at least one tick where a Piece's step was silently refused by their private rule and the Holder visibly changed plan because of the lamp.

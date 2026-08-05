## Overview

A 4-player, ~8-minute cooperative maze game for one host TV and four phones. One player is the **Board**: their phone renders the entire dungeon. The other three are **Pieces**: their phones show no map at all, just a D-pad and a private rule card. The Board can see everything and understand nothing.

## Problem

The "one sighted player shouts at blind friends" genre (Keep Talking, blind-maze co-ops) has a short half-life: once the sighted player builds an accurate mental model, the game degrades into clean dictation and the blind players become input devices. The itch is to keep the Board *authoritative but wrong* — not by adding random noise, but by hiding a second rule system inside the players it is commanding.

## How it works

A 6×6 grid: walls, three pits, one exit pad. All three Pieces must stand on the exit pad simultaneously within 20 ticks.

**Board phone (private):** the full grid, walls, pits, and three tokens rendered only as colored dots — **Blue, Amber, Grey**. The dots are never labeled with player names. The Board talks freely and can see every move resolve.

**Piece phone (private):** a black screen with four arrows, a WAIT button, and one **Rule Card** that only that player can read. Crucially, every rule references board-side entities the Piece has no way to identify: *"You may not move in the same direction Blue moved this tick."* / *"You may never end a tick orthogonally adjacent to Amber."* / *"If Grey waits, you must wait."* After each tick the Piece sees exactly one word: MOVED, WALL, or BLOCKED.

This is the whole joke. The Piece *can* say their rule out loud — and it's useless, because nobody in the room knows who Blue is, including Blue. The Board sees a token flash red and cannot tell whether it hit a wall it can see or a rule it can't. "GO NORTH, THERE IS NOTHING THERE" is the game's chorus.

All three Pieces submit simultaneously on a 6-second tick; the host TV shows only the tick clock and remaining ticks.

## Technical approach

PartyKit Durable Object per room. State: `{grid, tokens: {blue|amber|grey: {cell, playerId}}, rules[], tick, log[]}`. Phones are PWAs over WebSocket; the host tab is a read-only subscriber.

The genuinely hard part is **simultaneous resolution of mutually-referential constraints**. If Blue's rule references Amber's move this tick and Amber's rule references Blue's, naive sequential evaluation makes the outcome depend on iteration order. v1 resolves with a two-pass fixed point: pass 1 evaluates every rule against *declared intents*, not results; pass 2 applies terrain collision. Any Piece whose intent violates its rule is BLOCKED and holds position. Rules are authored to only reference intents, never post-move state, which makes the fixed point trivially unique — this authoring constraint is the real design work, not the code.

Tick determinism is server-side; late submits become WAIT.

## v1 scope

- Exactly 4 players, 1 hand-authored 6×6 grid, 1 round
- 3 hand-written rule cards (one per Piece), fixed assignment
- 20 ticks, 6s each, co-op win/lose
- Host TV: tick clock, tick counter, win/lose card

## Out of scope

Multiple maps, rule generation, rotating the Board role, scoring, spectators, reconnect grace, animation polish.

## Risks & unknowns

Rule cards may be too punishing (game unwinnable) or too weak (Board's model is fine). Needs playtest tuning of exactly how often each rule bites — target roughly 1 BLOCKED per player per 5 ticks. Second risk: players may find naming conventions ("I'm the one who bumped west") that collapse the color ambiguity in two ticks; countermeasure is that terrain bumps and rule blocks look identical to the Board.

## Done means

Four phones join, three Pieces submit blind moves on a shared tick, the Board's screen shows exactly three unlabeled dots resolving simultaneously, at least one BLOCKED event occurs that the Board demonstrably misattributes to terrain, and the room either reaches the exit pad or times out — with the post-game screen finally revealing which player was Blue.

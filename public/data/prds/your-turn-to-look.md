## Overview

A 4-player cooperative maze game for a phone-per-person living room. There is exactly one map in the game, and at any moment exactly one player is holding it. Holding it makes you omniscient and paralyzed; not holding it makes you mobile and blind. The map is passed by naming a person out loud and tapping their name.

## Problem

Map-holder party games settle into a fixed hierarchy: one director talks, three pieces obey, and the pieces are basically limbs. The role never moves, so nobody but the director ever gets to think spatially. The itch: make *sight itself* a scarce, transferable, physically-costly object, so the interesting decision is "who deserves to see right now."

## How it works

An 8×8 dark house, four pieces, one exit tile, three pit tiles. Goal: get all four pieces onto the exit within 5 minutes.

**The holder's phone (private):** the map, but rendered only as a radius-2 disc centered on *the holder's own piece*. Everything else is black. Walls, pits, and the exit are drawn inside that disc; other pieces show as dots only if inside it. The holder's own movement buttons are greyed out — you cannot walk while looking.

**Every other phone (private):** four compass buttons, a step counter, and a one-line body-frame sensation feed of their own last 3 events ("wall ahead", "floor gives", "nothing"). No coordinates, no map, no view of anyone else.

**Host screen (public):** four name plates, a big "MAP: Dana" badge, the mission timer, and the number of steps taken. Never the maze.

Passing: the holder taps a name; the map transfers instantly, that player freezes, the previous holder unfreezes and goes blind. Because the disc follows the holder's body, scouting a far corridor means first walking someone there in total darkness, *then* handing them the map. Talking is unrestricted and constant — it has to be, because everyone's knowledge is 10 seconds stale and belongs to a different part of the house.

Stepping into a pit costs that piece a 15-second freeze; if the holder steps in a pit, they can't (they're frozen) — pits punish the blind, which is the whole point.

## Technical approach

Host tab + phone PWAs + one PartyKit Durable Object per room, authoritative. Data model: `{ maze: bool[8][8][4] walls, pits: Set<cell>, exit: cell, players: {id, cell, frozenUntil, steps}, mapHolder: id }`. Server owns all state; clients render only what the server pushes them, and the server computes each player's private payload — a piece never receives maze data at all, so a devtools-open player learns nothing.

Movement is server-validated at a 250ms tick to keep four simultaneous walkers deterministic. The genuinely hard part is the handoff race: two players tapping "give to me" within the same tick, or a pass landing while the old holder has a queued step. Resolve with a monotonic `handoffSeq` — server accepts the first pass, rejects later ones with a visible "too late" toast, and drops any move whose `seq` predates the freeze.

## v1 scope

- Exactly 4 players, one 8×8 hand-authored maze, one round, 5 minutes
- One exit, three pits, no items, no scoring beyond win/lose
- Pass-the-map by tapping a name; no request button
- Host screen shows holder name + timer only

## Out of scope

Multiple rounds, generated mazes, doors/keys, a traitor, reconnect, spectators, sound.

## Risks & unknowns

The radius-2 disc may be too tight to plan with, making passes frantic rather than deliberate — tune 2 vs 3 in playtest. Groups may converge on a boring optimum (one scout ferries the map back and forth); pits and the 5-minute clock exist to punish that, but may not be enough. Freeze-while-holding could feel like a punishment rather than a trade.

## Done means

Four phones join by room code; the map visibly moves between phones on tap; a non-holder's phone never receives maze bytes over the wire (verified in a network log); and a real group wins at least once and loses at least once across six sessions.

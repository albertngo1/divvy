## Overview

A 60-second party game for 4–6 people in one room with a TV and their own phones. Every player points one arrow at one other player. You score one point per arrow pointed *at* you. But any pair that points at each other annihilates: both score zero. The instinctive social move — "I'll take you, you take me" — is the single fatal action in the game.

## Problem

Party games reward the room for converging. The moment everyone agrees, the tension dies. This game makes agreement radioactive: the only structure that pays everyone is a *directed cycle* of length ≥3 (A→B→C→A), which is impossible to build with a handshake and has to be talked into existence in the open, out loud, under a countdown, while everyone quietly suspects it's a trap.

## How it works

**Host screen (public):** the player list, a live *anonymized* pledge tally under each name ("Ben: 3 pledges") with no indication of who, a 60-second countdown, and a rising "ink" meter. At lock, the TV draws the whole directed graph at once and detonates every mutual edge with a very loud noise.

**Each phone (private):** a list of the other players; tap one to aim your arrow. Re-aimable freely until the timer expires — your current target is never transmitted to anyone but the server. Each phone also holds a private **Obligation card**, drawn from three types in v1: *Blocked* (you may not pledge to a named player), *Charity* (you must pledge to whoever has the fewest pledges at lock, or score zero), *Patron* (arrows from one named player are worth double to you). Nobody can verify anyone's card, so "I literally can't take you" is both a real excuse and the best lie in the game.

Scoring: in-degree, mutual pairs zeroed, obligations applied. One round, then argue about it for ten minutes.

## Technical approach

Host browser tab + phone PWAs + one authoritative PartyKit Durable Object per room. State: `{players[], pledges: Map<playerId, targetId|null>, obligations: Map<playerId, card>, phase, deadlineMs}`. Phones send `{pledge: targetId}`; the server never echoes edges.

The hard part is **not** throughput — payloads are tiny. It's *information discipline*. Broadcasting tallies reactively leaks the graph through timing: if Ben's counter ticks up 40ms after Dana's phone plays its lock animation, the room learns Dana→Ben. Fix: the server emits tally snapshots on a fixed 500ms tick regardless of activity, with no per-event push and no "someone changed their mind" signal. Countdown uses server `deadlineMs` plus a client offset estimate; late pledges are rejected against the server clock, not the phone's.

## v1 scope

- 4 players, one 60-second round, one score screen
- Three obligation card types, dealt randomly, one per player
- Re-aimable arrow, no lock-in button
- Reveal animation: draw all arrows, explode mutuals
- Join by room code; no accounts, no persistence

## Out of scope

Multi-round play, arrow "weights," spending points to peek, spectators, reconnect handling, sound design beyond one explosion, any AI.

## Risks & unknowns

With 4 players a 3-cycle is easy and the game may be too solvable — 5 may be the real floor. Obligation cards could feel arbitrary rather than dramatic. The endgame may collapse into everyone frantically re-aiming in the last 3 seconds; that might be the best part or pure noise.

## Done means

Four phones and a TV, one round, and on the reveal at least one mutual pair explodes and the room audibly groans. Scores match a hand-computed in-degree. No phone or screen displays any player's target before the reveal, verified by inspecting the WebSocket frames.

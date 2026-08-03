## Overview

A 3-player silent coordination game. The host screen shows eight options — movie titles, animals, whatever. Every player must submit the same one. The catch: each phone privately strikes out two of the eight as forbidden *for that player only*, and nobody knows anyone else's forbidden pair. Three attempts. Two to four minutes.

## Problem

Schelling-point games collapse fast: the obvious answer is obvious, everyone picks it, done. The itch is a coordination game where the obvious answer is *illegal for someone* and you don't know who or which. Consensus stops being about taste and becomes about inferring other people's constraints from their failed attempts.

## How it works

Host screen (public, identical for all): eight numbered option tiles, attempt counter, and a **touched-count badge** on each tile — how many distinct players have ever submitted it. Nothing else.

Each phone (private, different per player): the same eight tiles, but two are struck through and untappable. Bans are dealt so at least two options are legal for all three players, and ban sets partially overlap. You are never told how many bans exist elsewhere.

Attempt 1: everyone taps a legal tile and locks. Server waits for all three, then reveals only whether the three matched. If not, each submitted tile's touched-count on the host TV increments — so "Tile 5 has been touched by 2 players" is now public proof that tile 5 is legal for at least two people. Nobody learns *who*.

That badge is the entire communication channel. Your vote is simultaneously an attempt to win and a broadcast of your own legality. Attempt 2 and 3 run the same way. Win = all three on the same tile. Loss = full reveal of all three ban pairs, usually to groaning.

The deliciousness: the crowd-favorite tile is often banned for exactly one person, and that person's only way to say so is to burn a turn voting elsewhere.

## Technical approach

Host tab + phone PWAs + one authoritative Durable Object per room (PartyKit; Socket.IO over Tailscale Serve is an equivalent drop-in).

State: `{ roomCode, options[8], bans: {playerId -> [2 optionIds]}, submissions: {attempt -> {playerId -> optionId}}, touched: {optionId -> Set<playerId>}, phase }`.

Sync: bans are pushed only down that player's socket at deal time. Legality is enforced **server-side** on submit (the client greys tiles, but a tampered client gets rejected). Submissions are buffered and invisible until all three land — a simple barrier — then the server derives the touched-counts and broadcasts one public delta to host and phones.

Genuinely hard part is not throughput, it's the barrier's failure modes: a player who locks and then backgrounds their PWA leaves the round wedged. Needs a submit-deadline timer with an auto-forfeit path, plus reconnect that restores the private ban set without ever replaying it to the wrong socket.

## v1 scope

- Exactly 3 players, one round, one hand-authored 8-option list
- Two bans per player, guaranteed ≥2 globally legal options
- Three attempts, touched-count badges, all-or-nothing win
- Reveal screen showing all ban pairs
- Room code join, no accounts

## Out of scope

- Scoring, multiple rounds, 4+ players, variable ban counts
- Player-authored option lists
- Any chat or reaction channel
- Spectators

## Risks & unknowns

- Ban dealing may accidentally make the puzzle trivial (one legal tile stands out); needs a generator constraint, not random dealing
- Three attempts may be too generous — a smart room may solve it on attempt two every time
- Option lists with a very strong favorite may be more fun than neutral ones; unknown until playtest

## Done means

Three phones join, each sees a different pair struck out, the server rejects a forged banned submission, touched-counts update correctly after each simultaneous attempt, and a playtest room that fails attempt one can reason its way to a legal match by attempt three.

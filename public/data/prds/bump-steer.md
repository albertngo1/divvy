## Overview

Bump Steer is a 4-player real-time cooperative game for a TV plus phones. One player is the **Yardmaster**, whose phone holds the entire board — walls, hazards, everyone's position — and who can talk as much as they like but cannot move a single token. Three players are **Cars**: blind tokens in the yard whose phones have no map at all, only a roster of the *other* players' names and four arrows. You cannot move yourself. You can only shove somebody else. Everything you do to the board, you do through another person's body.

## Problem

Asymmetric map games hand the sighted player total control and the blind players a joystick, which makes the blind players into hands and the sighted player into a boss. Bump Steer severs locomotion from self: the sighted player has zero agency and the blind players have agency only over each other. Nobody can be a boss, because nobody's orders execute themselves.

## How it works

A 6×6 yard with a few walls and a two-tile **loading dock**. Three Car tokens start in known corners. 90 seconds, fully real-time, no turns.

Each Car's phone shows privately: two name chips (the other Cars), a D-pad, their own remaining shove budget (8), and a cooldown ring (3s between shoves). Tap a name, then a direction — that player's token moves one tile that way. That's the entire verb set. A Car has no map, no coordinates, no idea where they are.

The private feedback channel is the good part: when *you* get shoved, your phone buzzes and flashes an arrow for the direction you traveled. You never see the yard, but you can dead-reckon your own position from felt shoves if you can hold it in your head while three people shout at you.

The Yardmaster's phone shows the live board. The TV shows only: the clock, each player's remaining shoves (public, so the room can budget), and a clank counter that ticks whenever a shove lands against a wall. No positions, ever.

Win: all three tokens on the dock simultaneously. Cruelty: a docked Car can still be shoved off by a well-meaning teammate.

## Technical approach

Socket.IO or a PartyKit DO, one room per code, phones as PWAs. State: `grid`, `tokens: {pid, r, c}`, `budget: Record<pid,int>`, `cooldownUntil: Record<pid,ts>`. Action: `{actor, target, dir}`, validated server-side for actor≠target, budget>0, cooldown elapsed.

The hard part is **simultaneous contradictory shoves**. Two Cars shoving the same target opposite ways inside the same instant must not depend on packet arrival jitter. Batch actions into a 250ms authoritative tick, resolve deterministically (opposing shoves cancel, both budgets still spent — a wasted shove is funnier than an arbitrary winner), then push one masked delta per socket. Cars receive only their own buzz/arrow event; the Yardmaster receives full positions; the TV receives counters. Haptic latency matters more than visual: the buzz must land under ~150ms or dead reckoning feels broken.

## v1 scope

- Exactly 4 players, one round, 6×6, 90 seconds
- 8 shoves each, 3s cooldown, no refills
- No hazards beyond walls; wall shoves cost budget and do nothing
- Win = all three on dock at once; loss = timer
- Post-round: TV plays back the true path for the laughs

## Out of scope

Multiple rounds, variable yards, pulls as well as pushes, Yardmaster speech restrictions, spectators, persistence.

## Risks & unknowns

May degenerate into two Cars ping-ponging each other; budget scarcity is the only current brake. The Yardmaster could become a firehose of "no, the OTHER left" — needs playtesting to see if 90s is chaos or comedy. Dead reckoning may be beyond anyone after two drinks, which is fine if the buzz alone feels good.

## Done means

Four phones join. A Car taps a name and an arrow; the target's phone buzzes with a direction arrow within 150ms and the Yardmaster sees the token move, while the TV shows only a decremented budget. Two opposing shoves in one tick cancel and both budgets drop. The round ends in a win or a timeout and the TV replays the true paths.

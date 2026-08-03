## Overview

A 90-second co-op combo relay for 3–5 people in a living room. The TV owns one stick-figure fighter; each phone owns a private, different moveset. The room's only score is the longest unbroken combo it can chain together, and every drop has a name attached to it. For groups who like the *feeling* of fighting-game execution without the sixty hours of lab time.

## Problem

Fighting games are the most spectator-friendly genre and the least party-friendly one — two people play, six people watch, and the skill gap is a cliff. The transferable thrill isn't the joystick; it's the half-second of *hit confirm*: seeing the state the last hit left the opponent in and knowing, privately, what you personally can do about it. That reading is per-person knowledge. It ports to phones perfectly and has never been the party-game mechanic.

## How it works

The fighter is always in exactly one of 8 **poses**: NEUTRAL, CROUCHED, AIRBORNE, JUGGLED, TURNED AROUND, WALL-SPLAT, GUARD-BREAK, GROUNDED. The pose is public and enormous on the TV, along with the combo counter and a draining 2.0s bar.

**Shared host screen:** current pose (giant word + crude figure), combo counter, whose turn it is (revealed 0.5s before the window opens), and the drop replay — "P3 tried CRUMPLE KICK from AIRBORNE."

**Each phone, privately:** six moves, unique per player. For each move, only that player sees (a) which poses it's legal from, and (b) which pose it *leaves the fighter in*. Nobody else can know where your move sends the body.

Turn order is randomized each hit. When the TV calls your name you have 2.0s to tap one move. Legal → combo +1, pose flips to your move's output, next player is called. Illegal → drop, sad sound, counter to zero, blame logged.

The knot: the TV renders the new pose 400ms *after* the server accepts it, so the next player is reading an animation in progress. You are not looking up a rule, you are confirming a hit.

One shared move on every phone: **REVERSAL**, legal from any pose, halves the counter. The chicken exit.

## Technical approach

PartyKit Durable Object per room, authoritative. State: `{pose, comboCount, activePlayerId, deadlineTs}`. Players: `{id, name, moveset: Move[6], drops}`; `Move {id, label, legalFrom: Pose[], leavesIn: Pose}`. Movesets are dealt at room start and never leave the server except to their owner.

Phones send `{moveId}`; the server validates against `pose` and that player's own table, then broadcasts. Countdown bars use `serverDeadlineMs` plus a per-client offset measured by ping/pong, so nobody's timer is generous. A 250ms grace window absorbs wifi jitter. The genuinely hard part is the deliberate 400ms render delay on the host — the phone client must not receive the new pose any earlier than the TV shows it, or the relay's whole tension leaks out. Pose transitions ship to phones on a delayed channel; move acceptance ships instantly.

## v1 scope

- Fixed 4 players, one 90-second round, one room code
- 8 poses as text + emoji; no real animation
- 6 moves per phone dealt from a hand-authored pool of ~24
- REVERSAL included; no tags, no meter, no supers
- Two sounds total: hit, drop
- End screen: longest combo + drop count per player

## Out of scope

Characters, art, multiple rounds, rematch, spectators, solo practice, difficulty tuning, persistent stats.

## Risks & unknowns

Two seconds may be unreadable rather than exciting — needs playtest tuning at 2.0 / 2.5 / 3.0s. Move tables may be unlearnable inside 90 seconds; mitigation is capping each move at 2–3 legal poses. A "training wheels" toggle that greys out illegal moves would kill the game and must stay off by default. Bad wifi makes drops feel unjust.

## Done means

Four phones and one host tab, cold group. A combo of ≥5 chained moves happens at least once, a drop is attributed to the correct phone on the TV, and testers spend the next thirty seconds arguing about whose fault it was.

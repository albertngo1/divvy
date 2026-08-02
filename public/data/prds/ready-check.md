## Overview
A 90-second cooperative raid-boss encounter for exactly 4 players seated in a circle. Shared TV is the boss fight; each phone is a raid UI that has been deliberately sabotaged. For groups who have never played World of Warcraft but have watched someone scream "SPREAD" at a monitor.

## Problem
Raid mechanics are the best cooperative design ever shipped — a private status effect, a public countdown, and a room that must talk — but accessing them costs 20 people, months of gear, and a Discord server. Meanwhile most co-op party games hand everyone the same screen, so the loudest player quietly solves the whole thing while three people watch. Raid design already solved that: it gives each person a fact nobody else has. This steals that, and adds the twist that makes it a *party* game.

## How it works
**Shared TV:** boss blob, boss HP, raid HP, and a cast bar naming the incoming mechanic with a 6-second countdown. Four nameplates showing only HP. It never shows who has what.

**Each phone, privately:** four action buttons (SPREAD, STACK, CLEANSE ▸name, SOAK) and a *Neighbor Panel* listing the live debuffs of the two players seated adjacent to you — **never your own**.

At each cast start the server assigns debuffs to 2 of the 4 players:
- **Bomb** — holder must press SPREAD before the timer hits zero.
- **Chain(X)** — holder and player X must both press STACK within 500ms of each other. Only their neighbors can see who X is.
- **Rot** — holder must be CLEANSEd, by name, by somebody else.

Since nobody sees their own row, the only path to survival is: read your neighbors' debuffs aloud, hear your own shouted back at you, press the button. Missed or wrong presses drain raid HP; clean casts drain boss HP. The designed cruelty: both people who can see your debuff may be mid-resolve on their own, so you have to interrupt someone who is counting.

## Technical approach
Host browser tab + phone PWAs + a PartyKit Durable Object as authoritative clock and state. Room state: `{players[], seatOrder[], bossHp, raidHp, cast:{id, type, startedAt, deadlineAt, assignments:{playerId -> debuff}}}`. The server computes a per-player *neighbor slice* and pushes only that — a phone's socket never receives its own debuff field, so privacy is enforced server-side rather than by CSS.

The genuinely hard part is Chain's 500ms co-press over hotel wifi with 20–200ms asymmetric latency. Fix: each client runs a periodic NTP-style handshake (median of 5 round trips) to estimate clock offset, stamps presses with corrected `performance.now()`, and the server resolves the cast 200ms *after* the deadline to collect stragglers before judging. Second hard part: seat order must match physical seating — v1 just asks each player to type their seat number at join and shows it on the TV for correction.

## v1 scope
- Exactly 4 players, seated in a circle, one boss.
- 6 casts, 3 debuff types, ~90 seconds total.
- Neighbor graph fixed for the whole game.
- TV: HP bars, cast bar, and a post-mortem list of who missed what.
- Art budget: a colored blob. No sound.

## Out of scope
Healing/tank roles, physical movement or positioning, 5+ players, rotating neighbor graphs, multiple bosses, meta-progression, spectators.

## Risks & unknowns
- 500ms co-press may be miserable in practice; may need to relax to 800ms.
- At 4 players the neighbor graph is nearly the whole room — asymmetry could feel thin. 5–6 sharpens it, but v1 stays small.
- One loud player may just call every debuff for everyone, flattening the fun.

## Done means
Four phones and a TV in a real room: on cast 3, a player who cannot see their own Rot is CLEANSEd by name by a neighbor who read it aloud, inside the timer, and the TV shows the cast resolve clean. Server logs confirm no phone payload ever contained that player's own debuff.

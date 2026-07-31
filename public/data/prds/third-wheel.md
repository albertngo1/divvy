## Overview
A 4-player, five-minute hidden-role game where the subtly-different private view isn't about *facts* — it's about *people*. Each phone shows one name: your secret partner. Three cards are true, forming one real pair and leaving a leftover. The fourth card names someone who is already spoken for. The result is a small social tragedy played out on a seating chart.

## Problem
Imposter games usually corrupt the imposter's data. Corrupting their *relationships* is funnier and stranger: the odd player behaves with total sincerity, and the comedy comes from watching devotion land on someone who isn't looking back. It's also structurally deniable — an unrequited chase looks identical to a clumsy one, and the person being chased can't tell if they're loved or being framed.

## How it works
Four players. The server builds pairs (A,B) and (C,D), then rewrites exactly one card: D's phone says "your partner is A." Now A↔B is mutual, C→D is one-way, D→A is one-way, and nobody is told any of this.

Five rounds. Each round the TV shows **three** tables with silly names (The Radiator, By the Snacks, Near the Door). Three tables and four players means someone always shares — every round produces signal.

**Privately, per phone:** your partner's name (constant all game), the three table buttons, and a 10-second countdown. **On the TV:** the tables, the countdown, and after the window closes, a simultaneous seating reveal — avatars snapping into place at once.

Scoring per round: +2 if your card's partner is at your table, +1 more if you two are alone there. There is no score for being popular.

Between rounds, 30 seconds of open talk under one rule shown permanently on the TV: **you may never say your own partner's name aloud.** Everything else — hinting, lying, complaining about being ditched — is fair.

After round 5, every phone privately answers two questions: *whose card is lying?* and *who was actually assigned to you?* The liar scores a large bonus for correctly fingering themselves; everyone else scores for naming the liar. The reveal screen draws the arrow diagram, and the orphan finds out they were never being chased at all.

## Technical approach
Host browser tab + phone PWAs + a Socket.IO server behind Tailscale Serve (or one PartyKit room object). Data model: `room {code, players[4], truePairs, falseEdge {from, to}, round, picks: Map<playerId, tableId>, deadlineMs, phase}`. Phases: LOBBY → DEAL → PICK(n) → REVEAL(n) → TALK(n) → VERDICT → SUMMARY.

Sync strategy: a player's card is sent only to that player's socket, once, and is never included in any room-wide broadcast — the TV client never receives the pairing graph until VERDICT. Picks are buffered server-side and released as one atomic broadcast when the deadline fires or all four are in, so no phone can react to another's tap. A missing pick auto-repeats the previous round's table ("stayed put"), which is diegetic rather than a penalty. Clients render countdowns against a server timestamp corrected by a startup RTT handshake.

The genuinely hard part here isn't throughput — it's *legibility*. The false edge must produce a tell that emerges around round 3, not round 1 and not never. That's a tuning problem over table count, round count, and whether talk is allowed, and it can only be settled by playing it.

## v1 scope
- Exactly 4 players, exactly 5 rounds, exactly 3 tables.
- One hardcoded pairing shape; only the role assignment is randomized.
- Talk phase is a 30-second timer and the taboo rule as TV text — no enforcement, no audio.
- Text names, no avatars beyond colored dots, no sound.
- One summary screen: the arrow diagram, the liar, the scores.

## Out of scope
5+ players, multiple false edges, three-way rings, cross-game scoring, rematch with reshuffled roles, any voice or gesture input, spectator mode.

## Risks & unknowns
Round 1 is pure Schelling noise — pairs may take three rounds just to find each other, leaving too little time for the tell to surface. Five rounds may be too few, or the taboo rule may be so leaky in practice that the group solves it in the first talk phase. Four players is also thin: with one liar and one orphan, the honest pair may just watch. And the emotional payload cuts both ways — the orphan spending five rounds being ignored is either the best joke of the night or genuinely unpleasant, and we won't know until we watch someone experience it.

## Done means
Four phones join, each receives exactly one partner name, and no client other than the recipient ever holds that name before VERDICT (verified by inspecting a captured socket stream). All four seat picks reveal on the TV in the same frame. The summary screen correctly renders the three-arrow diagram including the false edge, and the self-accusation bonus pays out. In three live playtests, at least two rooms name the liar correctly and at least one liar names themselves.

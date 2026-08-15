## Overview

A 5-player, one-round hidden-role game for a living room with a TV and five phones. The usual imposter game gives the traitor a *wrong* view. Dealt Twice gives them a *stolen* one — a duplicate of an innocent's private card. Nothing on the imposter's phone is false. The tell is not an error anywhere; it is a collision, and the innocent who got twinned looks exactly as guilty as the thief.

## Problem

Hidden-role games die when the imposter's view is wrong in a way that makes them contradict a knowable truth. Then deduction is just "who said the odd thing," and the imposter's whole job is bluffing about content they never saw. Nobody has ever built the inverse: an imposter whose information is *correct but not theirs*, where the deduction is finding two people who agree too well.

## How it works

The host screen shows a job board: one open **Contract** with five numbered requirements ("needs a red key," "needs someone with clearance 3," …). The room must, together, fill the contract by naming which player covers which requirement.

Privately, each phone shows a **Credential Card**: six fields (name, clearance, key colour, floor, shift, badge number). Two twists:

1. Only four distinct cards exist. One is dealt twice — once to an innocent, once to the imposter.
2. Every card, for every player, has **one random field redacted** — a black bar. So everyone is partly blind, and a blank is not evidence of anything. Critically, the two copies of the duplicated card are redacted in *different* places.

Three talk beats. Each beat the TV names a field ("everybody, clearance"); every phone privately submits its value or REDACTED; the TV displays them attributed, in a row. Duplicate holders will collide on every unredacted shared field — but so, by coincidence, will unrelated cards on low-entropy fields, so it takes all three beats to be sure.

Any player may spend their single **Challenge** on another player: both phones go private, the challenger sees the target's card with the challenger's *own* redactions applied, and must state a field the target can read and they cannot. The twinned innocent can pass this — they can read a field the imposter's copy has blacked out. The imposter must guess it from what the innocent already said aloud.

One vote. Innocents win by majority-voting the imposter; imposter wins on any other outcome, including voting out their twin.

## Technical approach

PartyKit Durable Object per room. State: `{players[], deck: Card[4], assignment: {playerId → cardIndex}, redaction: {playerId → fieldIndex}, beat, submissions[], challenges[]}`. Cards and redactions are generated server-side at room start; phones receive only their own projection — never the deck. Beats are barrier-synced: server buffers submissions, reveals only when all five land or a 25s timer fires, so nobody can read the room before committing. Challenge is a two-party private channel through the DO, logged for the recap.

The genuinely hard part is projection discipline: a single over-broad broadcast leaks the deck to devtools and kills the game. Every outbound message is built per-socket from a `project(state, playerId)` function with a server test asserting no message to player P contains any card other than P's.

## v1 scope

- Exactly 5 players, 1 round, no scoring beyond win/lose
- One hardcoded contract, one hardcoded deck of 4 cards
- 3 fixed talk beats, 1 challenge per player, 1 vote
- Host screen: submissions grid + vote tally + reveal
- Rejoin by re-scanning the room code

## Out of scope

Multiple rounds, 4-or-8-player deck balancing, generated cards, spectators, audio, persistent stats, an imposter-side win-more ability.

## Risks & unknowns

Collisions may read as obvious after one beat — mitigate by tuning field entropy so unrelated cards share ~40% of values. The twinned innocent may feel unfairly doomed; playtest whether the Challenge asymmetry is enough to save them. Redaction may just feel like missing UI rather than a rule.

## Done means

Five phones join a room, each sees a different-looking card, no phone can obtain another's card via network inspection, three beats and one challenge complete without desync, and in ≥3 of 5 live playtests the room correctly identifies the imposter rather than the twin.

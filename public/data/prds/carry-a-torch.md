## Overview

A three-player game of secret patronage. Each phone privately shows one line: **"Your partner tonight: Bo. You score what Bo banks."** Two of those cards point at each other. The third points into the pair. That player is the Torch — quietly bankrolling someone who is bankrolling somebody else — and their only path to points is figuring that out before the buzzer.

## Problem

Most "wrong private view" games corrupt a *fact* — a word, an image, a rule. This one corrupts a *relationship*, which is far harder to sanity-check, because the evidence isn't on your screen: it's in whether help arrives. It turns the imposter's discovery into the drama instead of the punchline.

## How it works

**Host screen (public):** three name plates with each player's **bank total**, a round timer, and — after each deadline — how much each player *received* that round. It never shows who gave what.

**Each phone (private):** the partner card, plus an allocation dial: split 10 chips between the two other players. Submitted simultaneously, revealed never.

Two 45-second gift rounds. Because the room is three people, the arithmetic is live and cruel: if you gave Bo 7 and the TV says Bo received 7, the third player gave Bo nothing — which means the third player isn't Bo's partner, or is hiding hard. To stop everyone hedging 5/5 into an information vacuum, the round's **top receiver banks a +3 concentration bonus**, so splitting evenly is a real cost.

Then a 20-second private accusation: each phone names who holds the one-sided card — **including yourself as a legal answer**. The pair scores their partner's bank, plus 3 each if the Torch fails to self-identify. The Torch scores 5 for naming themselves and 3 more for correctly naming the true pair. Winning as the imposter means admitting you were the sucker.

## Technical approach

PartyKit / Cloudflare Durable Object room, host browser tab plus phone PWAs, authoritative server. State: `{ phase, players[3], cards{ playerId: targetId }, round, allocations{ round: { from: {to: n} } }, banks{}, accusations{} }`. The server generates the pairing (a↔b, c→a) and pushes each phone only its own card.

Sync is trivially small; the hard parts are **leak prevention and timing**. Allocations must be write-once per round, server-clocked, and released only at the deadline — showing live "submitted" lamps would let a fast submitter signal a partner, so lamps appear only after the buzzer. Nothing but the receiver totals may reach the host tab, since the TV is the one screen everyone can photograph. A late or missing allocation auto-splits 5/5 rather than stalling the room.

## v1 scope

- Exactly 3 players, two gift rounds, one accusation phase.
- 10 chips, integer split, one submit per round.
- Host shows bank totals and per-round receipts only.
- Fixed pairing shape: one mutual pair, one Torch.

## Out of scope

4–6 player pairings, anonymous whisper tokens, multiple games, reconnect, chip carryover, any chat.

## Risks & unknowns

Three players may make the deduction *too* easy by round two — the concentration bonus may need to be a hidden multiplier instead. A Torch who works it out in round one has nothing left to do; may need a mid-game "switch your card" option. And the pair can collude verbally, since nothing stops them saying their cards out loud — the round may need a no-naming rule with a foul button.

## Done means

Three phones join by code and each receives a distinct partner card; two allocation rounds submit simultaneously under a server deadline; the TV shows only receipts and banks; all three accuse; the reveal draws the actual arrow diagram and scores the Torch's self-identification correctly.

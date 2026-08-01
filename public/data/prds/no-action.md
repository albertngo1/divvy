## Overview

**No Action** is a four-player prop-betting game played over any three-minute video clip on the TV. Each phone secretly authors one betting line about the clip; each phone secretly bets on everyone else's. The twist: the props you *decline* are the ones you referee — and a prop that nobody declines has no neutral counter, so it is voided as **no action** and its author earns nothing. For groups who already yell predictions at the screen.

## Problem

Watching something together is passive, and the usual fix — prop bets — needs two things a living room never has: a bookmaker willing to take the other side, and an honest scorekeeper. Every "TV bingo" app makes all players bettors and nobody a referee, so resolution collapses into arguing about whether that counted. And a line with no opposition is boring; a line only means something if someone can walk away from it.

## How it works

**Make (60s).** The server privately deals each phone one countable proposition from a six-card deck authored for this clip ("the word *actually* is spoken", "cuts to a wide shot"). Privately, you set an integer line (`OVER/UNDER 2.5`) and a max exposure. The TV shows only four face-down cards and a countdown.

**Take (45s).** The TV lists the four lines anonymously — text only, no authors. Each phone privately shows the three lines it did *not* write, each with OVER / UNDER / PASS and a stake of 10/20/40. Your own line reads **YOU ARE THE HOUSE** with live exposure as tickets land. No choice is ever broadcast.

**Lock.** The server assigns referees: for each prop, everyone who PASSED. Zero passers → the TV stamps it **NO ACTION** in red, stakes returned, author paid nothing. Zero takers → also void. So the author's real problem is setting a line juicy enough to draw action but shaded enough that at least one person walks.

**Watch (3 min).** TV: the clip plus four live counters. Each phone privately shows large TALLY buttons *only* for props it referees, with a 3-second UNDO. From the TV you cannot tell who is counting what.

**Settle.** Reveal lines, final counts, every ticket, payouts, plus a flat fee to each referee.

## Technical approach

PartyKit Durable Object per room, authoritative. Model: `Room {phase, clipId, props[], counters}`, `Prop {id, authorId, text, line, status}`, `Ticket {propId, playerId, side, stake}`, `RefAssignment {propId, playerIds[]}`. Phones send intents only; the DO computes assignments at lock and never leaks pre-lock state. The host tab is the clock authority, broadcasting `currentTime` every 250ms; each referee tap is stamped with host-clock time at receipt and deduped by `(playerId, clientSeq)`. The hard part is the atomic lock transition — void detection, escrow of stakes, and referee assignment must resolve in one server-side step before any phone re-renders, or a player can infer another's choice from a flicker. Second hard part: making counter updates feel instant on the TV (optimistic local increment, server reconcile at 10Hz) without letting an undo produce a visible rewind.

## v1 scope

- Exactly 4 players, one local 3-minute mp4, **one round**
- Six hand-authored props for that one clip
- Half-integer lines, three fixed stake sizes
- One tally button per refereed prop, 3s undo, no dispute flow
- Flat referee fee; referee accuracy is not scored

## Out of scope

YouTube/streaming ingest, automatic event detection, multi-round bankrolls, spectator mode, 5+ players, any chat.

## Risks & unknowns

- Referee/taker collusion — v1 accepts it (four friends, one round).
- The void rule may fire nearly always or never; the sweet spot is a playtest question, not a design one.
- Fuzzy props cause arguments; wording must be brutally literal.
- Refereeing two props while watching may be too much load — may need a cap of one.

## Done means

Four phones join from a room code; in a single three-minute round, at least one prop resolves from referee taps and at least one is voided NO ACTION; the TV prints a final ledger including referee fees; nobody touches paper or a calculator.

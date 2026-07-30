## Overview

A five-minute sealed-bid auction for 3–5 people where the bidding currency is *conserved* and *circulates*. Each phone holds a secret hand of three numbered chips; the host TV runs the auction house. For groups who like Ra, Amun-Re, or Modern Art but have never once finished a game without someone asking "wait, whose sun is that?"

## Problem

The sun-tile auction is one of the great tabletop mechanics and one of the most miserable to physically operate. Simultaneous sealed bids need closed fists and a referee. Chips must be passed face-down without anyone glimpsing them. Above all, the *good* part of the mechanic — tracking whose bidding power has drained and whose has quietly grown — is bookkeeping the table performs badly and out loud, which destroys the very secrecy that makes it interesting. Phones don't just speed this up; they make the hidden state actually stay hidden.

## How it works

Twelve chips valued 1–12 are dealt three apiece, secretly. Five lots are auctioned in sequence.

For each lot: the host screen reveals the lot (a scoring card worth 1–5 points, plus a junk lot worth −2). All phones simultaneously commit exactly one chip from their private hand. When the last commit lands, the host resolves:

- Highest chip wins the lot.
- **The winner's committed chip is traded to whoever committed the lowest chip.** Both hands change silently.

The host announces only *who won* and *who was low* — never a number, never a chip. Everyone learns "Priya's chip beat Dan's," and that the two swapped, but not by how much.

PRIVATE on each phone: your three current chip values, a log of which chips you've held and where they went, and the lot list. PUBLIC on the TV: the lots, who owns which won lots, and a swap animation showing two anonymous chips crossing the table.

The consequence: big chips migrate toward whoever is losing, so leading is self-correcting, and by lot three the room's model of who holds what has decayed into genuine, arguable uncertainty. Winning the junk lot with a 2 is the best play in the game and looks like an accident.

## Technical approach

Host browser tab + phone PWAs against a PartyKit room (one Durable Object per game code). State: `{players: {id, name, chips: number[], won: lotId[]}, lots, phase, commits: {playerId: chipId}}`.

The server is fully authoritative and chip values are never broadcast to the room. The genuinely hard part is **per-connection state projection**: every outbound frame must be rendered per-recipient (your chips as values, everyone else's as counts), with the host connection treated as a *public-only* client. One lazy `room.broadcast(state)` leaks the entire game permanently. Enforced by a single `project(state, viewerId)` function that all sends route through, plus a test asserting no host-bound frame contains a chip value.

Second hard part: reconnects. A phone that drops mid-commit must rehydrate its private hand and its already-locked commit without re-opening the choice.

Commit-reveal hashing isn't needed — the server holds truth — but commits are latched irrevocably on receipt so a late phone can't peek at the "3 of 4 committed" indicator and change its mind.

## v1 scope

- 4 players, fixed. One host screen, one game, no lobby persistence.
- 12 chips, 5 lots, one round, ~5 minutes.
- Commit UI: three big chip buttons, tap to lock, no undo.
- Host shows lot, commit-count dots, winner/low-bidder callout, swap animation, final scores.
- 20-second shot clock; timeout auto-commits your lowest chip.

## Out of scope

More than one round, chip counts other than three, avatars, sound, spectators, rejoining a finished game, any lot type beyond points/junk, teams, mobile-host mode.

## Risks & unknowns

The swap rule may be too subtle to feel at the table — playtest whether the host callout ("Dan takes the trash. Someone just got richer.") lands as drama or as noise. Four players may be too few for the information to get interestingly murky; five may be the real floor. Risk that optimal play collapses to "always bid low" if junk lots are too cheap — tune the −2.

## Done means

Four phones join by code, play five lots start to finish without a refresh, and at the end each player can be shown the true chip history — and at least two of them were wrong about who held the 12. Network capture of the host connection contains zero chip values.

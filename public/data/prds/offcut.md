## Overview

A silent cooperative card game for 3 people in one room, host TV plus phones. Each player holds a private hand of words. Exactly one word appears in all three hands. Every round all three players simultaneously discard one card, face-up, forever. You win only if, when the dust settles, all three of you are holding the identical last card. Nobody may speak, gesture, or point.

## Problem

Most "secretly agree with each other" games give players a shared board and a hidden preference. The negotiation channel is either free (talking, banned) or a purpose-built signalling widget (bolted on, artificial). Offcut has no channel at all except the trash. The only way to tell the room something is to permanently destroy it, which means you can never, ever tell them about the one card that matters.

## How it works

Server deals 12 words into three private 5-card hands, seeded so exactly one word W is in all three, and two or three decoy words sit in exactly two hands.

Four discard rounds. Each round, simultaneously and privately:

- **Phone (private):** your 5 (then 4, 3, 2) cards, a tap to arm one for the bin, a big LOCK button. Cards other players have already binned are struck through in your hand — so you learn a card is dead only after someone kills it.
- **Host TV (shared):** three coloured scrap columns growing round by round, every discard permanent and legible to the whole room, plus a dumb "2 of 3 locked" counter. It never shows a hand, a card count of who holds what, or who is close.

The logic that emerges: discarding a word broadcasts *I held this, and it is now dead*. A word nobody has binned and you still hold is a live candidate. The trap is the pairwise decoy — you and one other player both cling to a word the third has never seen, and you both watch the round counter run out. Round 4 resolves, the TV flips all three final cards at once. Match on all three or the room loses.

## Technical approach

PartyKit Durable Object per room. Authoritative state: `{ pool[12], players: { id, hand[], discarded[], armed, locked }, round }`. Hands live only server-side; a phone receives only its own hand plus the public strike-through set. Reconnect uses a `sessionToken` in localStorage so a phone reload restores the private hand without ever broadcasting it.

Sync is a simple barrier, not hard real-time: server buffers armed discards, applies them atomically when all three lock, then emits one `round_resolved`. The genuinely hard part is the **deal generator** — sampling hands with exactly one 3-way intersection and a tuned number of 2-way decoys, so the puzzle is solvable in 4 rounds but not obvious in 1. That needs a rejection sampler plus playtested overlap parameters.

## v1 scope

- Exactly 3 players, one hardcoded room, one game
- One fixed 12-word pool, one deal
- 5-card hands, 4 discard rounds, no timer
- Host TV: scrap columns + lock counter + final reveal
- Win/lose screen, refresh to replay

## Out of scope

Scoring, multiple rounds, 4+ players, word packs, images instead of words, any timer, spectators, animations beyond a card flip.

## Risks & unknowns

May be trivially solvable — if elimination alone finds W by round 3, there is no tension; overlap tuning is the whole game. Opposite risk: a decoy pair makes the loss feel arbitrary rather than earned. Silence is hard to enforce with a live table; the reveal has to land hard enough that people self-police.

## Done means

Three phones join a host tab, each sees a distinct 5-card hand, four simultaneous locked discards resolve as atomic rounds with correct strike-throughs, and the TV reveals three final cards with a correct win/lose verdict. A mid-game phone refresh restores the same private hand with no leak on the wire.

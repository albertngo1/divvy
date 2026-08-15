## Overview

A 4–6 player betting party game for a TV plus phones, riffing directly on Wits & Wagers. In the board game, everyone's numeric guess is written on a card and laid face-up in sorted order, and the table bets on which card is closest without going over. **Third of Six** deletes the face-up part. The guesses are never revealed until payout. The only information anyone gets is *where they sit in the sorted order* — and that is different, and private, on every phone.

## Problem

Wits & Wagers' betting round is a lovely mechanism ruined by full information: once all six numbers are face-up on the felt, the "bet" is arithmetic. The interesting question — *is my guess too high?* — is answered for you. Ordinal-only play restores it: knowing you are 3rd of 6 with "26 bones" is a genuinely hard, genuinely social read, and it can only be delivered privately.

## How it works

1. **Question.** TV shows one trivia number question ("How many bones in the human foot?"). No answer choices.
2. **Lock.** Every phone privately shows a number pad. Everyone locks simultaneously. TV shows only a lock counter (4/6).
3. **Slots.** TV renders N blank slots left→right, plus a leftmost **UNDER ALL** slot. Slots are the sorted guesses — no names, no numbers, ever. Outer slots pay longer odds (3:1 edges, 2:1 near-edges, 1:1 middle), UNDER ALL pays 5:1.
4. **Private view.** Your phone — and only your phone — shows: your own number, and a highlight on *your* slot: "You are slot 3 of 6." You learn nothing else about anyone.
5. **Bet.** Two chips, placed privately on any slots including your own, locked simultaneously.
6. **Reveal.** TV flips the truth, fills every slot with its number and owner at once, and pays out.

The read is real: lowest of six with 19 means five people went higher, so if you suspect the room over-guesses, your own slot is the bet. Third of six with a number you now distrust means you should be betting to your own left.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs both WebSocket clients.

State: `{ phase, questionId, truth, players: [{id, name, guess, slotIndex, chips: [slot, slot]}] }`.

Sync: **per-client view projection is the whole ballgame.** The server must never broadcast full state and let clients filter — a player with devtools open would read every guess. The DO computes a distinct payload per connection: `{ mySlot, myGuess, slotCount, lockedCount }` for phones, `{ slotCount, lockedCount, chipCountPerSlot }` for the host. Truth and the guess array exist only server-side until the `reveal` transition.

Hard parts: (a) tie handling — equal guesses must share one slot, or the tiebreak (lock timestamp) itself leaks a fact; v1 shares a slot and pays both. (b) Simultaneity — bets are buffered server-side and only revealed on the last lock, so a phone that is 300ms slow gains nothing. (c) Reconnect must re-derive the same private view, never a fresh one.

## v1 scope

- One hardcoded question with a known integer answer
- 4–6 players, no host controls beyond "next phase"
- Two chips each, one betting round, one payout
- Slot odds hardcoded; chips are display-only, no persistent score
- Names typed on join, no avatars, no reconnection

## Out of scope

Question packs, multi-round scoring, an all-play "pay the house" slot, spectators, animations beyond a slot flip, mobile keyboard polish.

## Risks & unknowns

Ordinal-only may be *too* thin — with 4 players the slots carry little signal, so 5–6 may be the real floor. Ties could be common on small-integer questions; choose questions with wide answer ranges. Betting on your own slot may dominate; the odds ladder needs playtest tuning.

## Done means

Six phones join, everyone locks a number, each phone displays a correct and *different* slot index, and a player inspecting their own WebSocket frames cannot recover any other player's guess. Chips lock, the TV reveals all six numbers into the slots at once, and payouts match the odds ladder.

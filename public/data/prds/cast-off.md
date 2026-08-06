## Overview

A silent cooperative card game for exactly three players. Everyone holds four private cards. The room wins if, after six turns, all three hands are **identical** — but nobody is told what the target hand is. It has to be deduced from what other people are willing to discard. Ten minutes, one round, for groups who like Hanabi but don't want a 45-minute commitment.

## Problem

Silent-coordination games usually give you a clue channel (a number, a word, a token). Then the game is about the clue system, and the first hour is rules. The itch: a convergence game where the communication channel is something you were going to do anyway — get rid of a card — so there is nothing to learn before you start.

## How it works

Deck: 6 symbols (anchor, moth, key, bell, comb, plum), 3 copies each. Before the game, 4 symbols are secretly **live** — all 3 copies of each are dealt out, 4 to each player. The other 2 symbols sit unseen in the bank. So the only possible identical hand is one of each live symbol, and the deal is constrained so every player starts holding at least one duplicate — meaning nobody can see more than three of the four live symbols. Every card you hold is proof that its symbol is live. Every symbol that never appears is probably dead.

Each turn, simultaneously:

1. **Cast off.** Every phone privately taps one card to discard. The TV reveals all three at once, seat-colored.
2. **Claim.** Every phone privately taps one of the two cards it did *not* discard. If two players claim the same card, the TV flips a public coin; the loser takes whatever remains, which can be their own discard coming back — an ugly, readable signal.
3. Hands stay at four. Six turns, then automatic reveal.

Private per phone: your four cards, your intent. Public on TV: the full discard river in order, every claim result, the turn counter. Never a hand. Passing one phone around would expose all three hands and delete the game.

## Technical approach

Host browser tab + phone PWAs + authoritative Socket.IO/PartyKit server.

- Data model: `Room { seed, liveSymbols[4], hands: {pid: Card[4]}, river: [{turn, pid, symbol}], phase, turn }`. Clients receive a **projection**: your own hand plus public river. Full state never leaves the server.
- Phase machine: `DISCARD → REVEAL → CLAIM → RESOLVE`, each with a 20 s timer and an auto-random fallback so one distracted player can't stall the table.
- Hard part is less raw sync than *felt* simultaneity: discards must land on the TV in one beat, so the server buffers all three and reveals on the last submit (or timeout), showing only anonymous "locked" pips while waiting. Claim resolution must be provably fair and always terminate — with three discards and three claimants, greedy assignment plus a seeded coin flip is guaranteed to leave each player exactly one card.

## v1 scope

- 3 players, 6 symbols, 4-card hands, exactly 6 turns, one deal.
- Constrained deal (every player starts with a duplicate).
- Discard river and claim log on the TV.
- Win/lose screen showing all three hands side by side.

## Out of scope

Scoring, multiple rounds, 4+ players, an early-CALL mechanic, card art beyond flat glyphs, reconnect handling, rematch with a fresh deal.

## Risks & unknowns

- Six turns may be far too generous or far too tight; needs simulation before playtest.
- The forced take-back edge case might read as a bug rather than a tell.
- Symbols must be instantly distinguishable at a glance across the room, or the river becomes unreadable.
- Risk that the deduction is mechanical once someone "gets it," collapsing to solved play by turn three.

## Done means

Three phones join by code, six turns run without a stall, and the reveal correctly calls a win only when all three hands are the same multiset. In 10 playtests, at least 3 wins and at least 3 losses — if it's 10/10 either way, the tuning is wrong. Server logs confirm no client ever received another player's hand.

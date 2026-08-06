## Overview

A 4-player Taboo variant, one round, about four minutes. The forbidden words aren't printed on the card — they were secretly planted by the two people sitting across from you, who watched you play and guessed exactly which word you'd reach for first. You find out what's banned by stepping on it.

## Problem

Taboo's banned list is printed, so the clue-giver's job is a lookup: read five words, avoid five words. Trapwords (the tabletop game that invented the hidden-taboo idea) fixes this but drowns in physical bookkeeping — hidden slips, an honor-system referee, and constant "wait, did they say it?" arguments. The bookkeeping is exactly what four private screens erase.

## How it works

Four players: one **Giver**, one **Guesser** (teammates), two **Miners** (opponents).

**Private views, all simultaneous:**
- Giver's phone: the target word, and nothing else.
- Guesser's phone: a text box and a SUBMIT button. Never sees the word.
- Each Miner's phone: the target word, plus during setup, two text boxes to plant traps — and during play, their own two trap words rendered huge, each with a DETONATE button.

The TV shows a 60-second timer, three intact skulls, and an empty EXPLODED row.

**Setup (30s):** both Miners privately type two trap words each — words they predict the Giver will actually say. They cannot see each other's traps, and the server silently collapses duplicates into one mine. Two Miners who both plant "cold" have wasted half their arsenal, so they have to diverge on a hunch, blind. That's the whole Miner metagame.

**Clue phase:** the Giver talks out loud, freely, no rules. Each Miner watches their own words and slams DETONATE the instant they hear one. The TV publishes the exploded word to the whole room — permanently, in red — and burns a skull. The Giver now has to keep talking *around* a word they just learned is radioactive, mid-sentence, with the Guesser having also just learned it and re-anchoring on it. Three skulls and the Miners win; a correct Guesser submit before the timer wins for the team.

All four people are looking at four genuinely different screens at the same time. Passing one phone around is not a degenerate version of this game — it's not a game.

## Technical approach

Socket.IO room server behind Tailscale Serve; host tab plus PWA phones on a 4-letter code. State: `{targetWord, phase, skulls, mines: [{word, ownerId, exploded}], guesses[]}`.

Mine planting is normalized server-side (lowercase, strip punctuation, singularize) before dedupe; the Miner is privately told "someone already has this — pick another" without being told who. Redaction is per-role: the target word ships to three of four phones, mines ship only to their owner until they detonate.

The genuinely hard part is detonation ordering. Two Miners can slam within 80ms of each other on different words, and the TV must show them in a stable order matching what the room heard. The server timestamps on arrival, applies a 200ms batch window, and resolves the batch as one atomic skull-burn — so a double-detonation costs two skulls and ends the round cleanly rather than racing the win-check. The Guesser's submit is checked against the target on the same event queue, so a correct guess that lands 40ms before the third skull wins.

## v1 scope

- Exactly 4 players, fixed roles, one round
- 30 hand-picked target words, no deck logic
- 2 traps per Miner, 3 skulls, 60-second timer
- Detonation is human-triggered and unappealable
- TV: timer, skulls, exploded-word row

## Out of scope

Speech recognition, role rotation, scoring across rounds, challenges or vetoes, teams larger than two, reconnect handling.

## Risks & unknowns

A Miner can detonate on a word that wasn't said. v1 relies on the room hearing the lie, since the exploded word is published publicly; if that fails socially, we need a Guesser veto. Traps may be too easy to predict on concrete nouns, making 60 seconds unwinnable — the word list has to skew abstract.

## Done means

Four phones join and each shows a visibly different screen; duplicate traps are silently merged with the second Miner privately prompted to re-plant; a DETONATE tap publishes that word to the TV and burns a skull within 250ms on every device; and the round ends decisively on either three skulls or a correct submit, with all four unexploded mines revealed at the end.

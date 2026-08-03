## Overview

A 4-player riff on *Concept* (the icon-pointing game) for groups who like cooperative games that end in arguing. One Guesser, three Givers, one secret word, ninety silent seconds. The twist: each Giver privately owns only a slice of the icon board and can only place markers on icons they own. A printer's type case that has run out of a letter is "out of sorts." So is your teammate.

## Problem

*Concept* on a table is slow and everyone can see the whole board, so the clue-giving collapses into one confident person driving. The failure mode that's actually funny — "why didn't you point at SHIP?!" — never happens, because SHIP is always available. Private, disjoint vocabularies manufacture that failure on purpose, and only per-phone state can hide who lacks what.

## How it works

1. Four phones join. Server picks a secret word (PIRATE) and shows it privately to the three Givers only.
2. **Giver phone, private:** the same 40-icon grid the TV shows, but 25 icons are greyed and unpressable. You own 15. You have 3 markers. You cannot see anyone else's ownership, and you cannot signal it — no talking at all.
3. **TV, shared:** the 40-icon grid with placed markers only, colored per Giver, numbered in placement order, plus a 90s timer and a strike list of wrong guesses.
4. **Guesser phone, private:** a text box and a GUESS button. No grid, no ownership, no word.
5. Real time, no turns: Givers place markers whenever they want. Server rejects a second marker on an already-marked icon; the loser's phone bounces with a haptic and their marker is refunded.
6. Guesses appear on the TV as strikes. A correct guess ends the round.
7. **Reveal:** the TV overlays each Giver's private ownership as three translucent colored washes. The room finally sees that SHIP, SEA and TREASURE were owned by nobody, and that the person who placed EYE only had EYE, BREAD and TUESDAY.

## Technical approach

PartyKit Durable Object per room. State: `{word, icons:[40], ownership:{playerId:number[]}, markers:[{icon,by,seq,t}], guesses:[], phase, deadline}`. Per-socket projection: a Giver receives `ownership[me]` and `word`; the Guesser receives neither; the TV receives markers and guesses only. Ownership is revealed to all sockets exactly once, at phase transition to `reveal`.

Hard part: concurrent marker placement. Two Givers tapping the same icon 60ms apart must resolve identically on three screens plus the TV. Clients render optimistically with a pending state, the server assigns a monotonic `seq` and first-write-wins, and losers roll back to a greyed "taken" state. The TV is the only display that must never show a rolled-back marker, so it renders confirmed `seq` order only, one frame behind. Second hard part: ownership generation — sampling must guarantee 2–3 semantically obvious icons for the chosen word land in nobody's set, which needs a hand-tagged relevance list per word, not random sampling.

## v1 scope

- Exactly 4 players, one word, one 90-second round.
- 40 emoji icons, hand-tagged for 8 secret words.
- 3 markers per Giver, no marker removal.
- Outcome is solved / not solved. No points.
- Reveal overlay screen, then stop.

## Out of scope

Scoring, multiple rounds, variable player counts, marker removal or repositioning, custom words, Guesser hints, rematch.

## Risks & unknowns

Ownership may be too punishing — if all three Givers lack anything usable the round is dead air rather than comedy. Ninety seconds may be too short for silent coordination. The Guesser may feel like a passenger; the reveal has to land hard enough to justify their wait.

## Done means

Four phones join, three see distinct greyed grids and the word, the Guesser sees neither, markers placed within 60ms of each other resolve to one winner on all four screens with the loser refunded, a correct guess ends the round, and the reveal overlay correctly shows three ownership washes including at least one obvious icon owned by no one.

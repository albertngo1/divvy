## Overview
A 4-6 player collaborative logic-deduction game with a hidden saboteur. The group rebuilds a suspect's evening on a shared grid using privately-held clues; the imposter's phone carries exactly one corrupted clue — and doesn't know it. For puzzle-lovers who want social deduction with real logical teeth.

## Problem
Hidden-role "different private view" games almost always make the difference cosmetic. Here it's a genuine logical contradiction. And the beloved format of group logic puzzles (each player holds some of the clues) has never been weaponized into a hunt: when one privately-held clue is silently false, cooperative deduction becomes a search for the inconsistency's source.

## How it works
The TV shows a 5×5 deduction grid: five hours (6/7/8/9/10pm) × five locations (Bar, Diner, Library, Station, Home), plus a suspect dossier. Goal: place the suspect in exactly one location per hour. Clues are distributed privately — each phone holds 2-3 cards ("Never at the Bar before 8," "Library came immediately after the Diner"). The honest clue set yields one consistent solution. One randomly chosen phone (the imposter) has ONE clue swapped to a false statement that contradicts the rest. Players read clues aloud and fill the grid together on the TV (anyone proposes a cell; majority confirms). When the false clue is voiced, the grid won't close — a contradiction surfaces. The group deduces WHOSE clue caused it and votes. The imposter, trusting their card, argues for it — self-incriminating.

Private (phone): your clue cards, your "propose cell" control, your vote. Shared (TV): the grid, confirmed placements, contradiction highlights, reveal.

## Technical approach
Host tab + phone PWAs + authoritative WS server. Data model: Room{grid, clueDeck, players[], phase}, Clue{id, text, predicate, ownerId, corrupted?}, Player{role, clues[], vote}. Puzzle generator (offline for v1): produce a solvable 5×5 with a UNIQUE solution, partition clues across players, then corrupt exactly one clue so the full set is UNSAT but removing that clue restores SAT — verified with a tiny constraint check. Sync: cell proposals broadcast + confirm-gated; last-writer-wins per cell. Hard part: generating puzzles where exactly one clue's corruption produces a detectable-but-not-obvious contradiction that's traceable to a single owner.

## v1 scope
- 4 players, one round, ONE hand-authored puzzle (no live generator).
- Fixed clue distribution; one pre-corrupted clue on a random phone.
- Shared grid with propose/confirm; simple majority vote; reveal.

## Out of scope
- Automatic puzzle generation, difficulty tiers, scoring.
- Multiple rounds, larger grids, hint system.

## Risks & unknowns
- Logic puzzles can stall a party — needs a timer and gentle nudges.
- Too-obvious contradiction = instant catch; too-subtle = unsolvable. Calibration-heavy.
- Misread clues create false contradictions; reading aloud accurately matters.

## Done means
Four players each hold private clues, collaboratively fill the grid, hit the imposter's contradiction, and vote out the correct player — in a playtest where the imposter actively defended their secretly-false clue.

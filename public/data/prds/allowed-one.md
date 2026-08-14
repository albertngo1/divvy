## Overview
A 4-player, eight-minute deduction game for people who like the arguing part of logic puzzles. Every player's private evidence is corrupted. You are told, truthfully, that exactly one of your three clue cards is false — and you are not told which. The imposter is told exactly the same sentence, and it is a lie: they have two false cards, and they know precisely which two.

## Problem
Hidden-role games where one person holds the bad copy have a structural flaw: three honest players share a consistent picture and out-vote the odd view almost by reflex. The fix is to corrupt everyone. Once every player is unreliable, contradiction stops being an accusation and becomes ordinary weather — and guilt has to be measured, not spotted.

## How it works
The TV shows five numbered chairs and five party guests (Molly, the dog, the cake, the cousin, the lamp) waiting off to the side. One true seating arrangement exists; nobody sees it.

Each phone privately holds three constraint cards: "the dog sits left of Molly", "chair 4 is not the cake", "the cousin is next to the lamp". Exactly one is corrupted. The imposter's phone shows four cards' worth of knowledge in three: their two false cards are quietly marked, so they alone know which of their statements are poison and can time them.

Play is three publish rounds. On your turn you tap one card to publish it to the TV, where it becomes public and permanent. After every publish the host recomputes across all 120 permutations: which seatings survive if each player has *at most one* false published card. The TV renders two things — a survivor count, and a **conflict web**, a red line drawn between any two players whose published cards cannot both be true. Everyone accumulates red lines; the imposter accumulates them faster, but not reliably, and that gap is the entire game.

Each player holds one **RETRACT**: publicly kill one of your own published cards. Retracting is what an honest player does the moment they deduce which of theirs was the fake — and it is exactly what a guilty player does to erase an edge. The room watches you spend it.

Endgame: every phone privately submits a seating arrangement and an imposter vote. The room scores if the majority arrangement is correct; the imposter wins on a wrong arrangement *or* a wrong vote.

## Technical approach
Host tab + phone PWAs on one PartyKit Durable Object. State: `{truth (server-only), hands (server-only), published[], retracted[], phase, turnIdx, finalSubmissions}`. Puzzle generation brute-forces 5! = 120 permutations at deal time and accepts a deal only if: the full honest set uniquely determines the truth under the one-false-each model, and the imposter's extra lie makes at least two seatings survive — so the imposter's crime is genuinely load-bearing on the room's answer, not decoration.

Sync is turn-based and forgiving; the hard part is not latency, it's the solver being *legible*. Recomputing 120 permutations against ~12 constraints is microseconds, but the conflict web must animate one new edge at a time and name the two cards that clash, or the room can't argue about it.

## v1 scope
- 4 players, 5 chairs, one round, one hand-tuned puzzle generator.
- Three publish rounds, one retract each, one final private submission.
- TV shows survivor count + conflict web. No animations beyond the edge draw.

## Out of scope
Multiple rounds, variable player count, two imposters, hint economy, any theme other than the seating chart, persistent scores.

## Risks & unknowns
This could read as homework rather than a party. Mitigation is that the TV does 100% of the arithmetic and the players only argue. The retract may be strictly dominant to never use, which would flatten a whole mechanic. And the noise floor is untested: with four honest lies already in play, one extra may simply be invisible.

## Done means
Four phones, one deal, the conflict web fills in live, at least one retract is spent, and the room submits a seating chart and a vote. Across ten test deals, the imposter is caught between 40% and 70% of the time — outside that band the corruption rate is wrong.

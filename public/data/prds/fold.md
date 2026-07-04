## Overview
Poker-style trivia. You see the question on your phone. You privately decide how confident you are and raise, call, or fold — betting chips, not committing to an answer. Then the answers come out. Score is about stakes management, not knowledge. The person who folds smart beats the person who knows more but overbets bad hunches.

## Problem
Trivia party games reward whoever's read the most Wikipedia. That's boring and gatekeep-y. Poker rewards reading yourself and the table. Fusing the two — "how sure am I, really?" — turns trivia into a metacognition game that a humble guesser can win against a confident wrongster. Existing trivia apps (Kahoot, HQ) don't have the fold-or-raise loop that makes poker addictive.

## How it works
4–6 players, each with 100 chips. A question appears simultaneously on every phone with 4 multiple-choice options — but you can't answer yet. First, a betting round: each player privately taps CHECK, RAISE (with a slider for amount), or FOLD. Folded players are out of the hand and lose their ante only. Remaining players lock their bet. Then the answer selection: everyone still in privately picks one of the 4 options. Reveal: correct answerers split the pot proportional to their stake; incorrect answerers lose their stake. Ties split. 10 hands per game; highest chip count wins.

## Technical approach
Socket.IO on the homelab. Server owns question pool, betting state, chip counts. Questions from a curated JSON of 500 vetted trivia items (mix of easy/medium/hard). LLM Haiku not needed for v1 (static pool); could later generate questions on demand. The per-phone architecture is load-bearing: your bet must be private during the raise phase because visible bets would let the table read faces and follow the shark. Locking answers privately too means the pot resolves fairly without the "someone glanced at my screen" argument. Chip counts stay public; individual bets stay private until reveal.

## v1 scope
- 4 players fixed
- 10 hands per game
- Fixed 4-option multiple choice
- Chip stakes: ante 5, raise cap 50, min raise 10
- Static question pool of 500 items across 5 categories
- No difficulty tags on questions in v1

## Out of scope
- Bluffing rounds / open-ended answers
- Difficulty-tiered pot multipliers
- LLM-generated questions
- Categories chosen by players
- Persistent chip stack across games
- Tournament mode

## Risks & unknowns
- If everyone folds the same hand, the round is a dud — need forced-ante or blind mechanic
- 10 hands may be too many for a party context; may cut to 6
- Question quality is everything; a bad question ruins a hand
- Slider raises may feel clunky on mobile — buttons might be better

## Done means
Four people play a full 10-hand game, at least one player wins by folding smart on a topic they knew nothing about, and the group agrees the winner deserved it.

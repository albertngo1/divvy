## Overview
Shrug is a phones-as-buzzers party game (Jackbox-style) built around a single, sharp finding from HCI research: AI advice suppresses people's willingness to admit uncertainty, even when the advice is wrong and accuracy is rewarded. Shrug turns that failure mode into the whole game. It's for 3–8 players who like trivia but are tired of trivia.

## Problem
Most trivia rewards confidence and recall. In the age of an always-available oracle, the actually valuable skill is *calibration* — knowing when the oracle is bluffing and when to abstain. No party game trains or exposes that. And the research shows we're bad at it precisely when it counts.

## How it works
Each round poses a question with three moves: answer, or pay 1 'nerve' token to consult the AI oracle, or Shrug. The oracle always responds fluently and confidently — but on a hidden fraction of rounds it's been prompted to be *plausibly wrong*. Scoring is calibration-shaped: a correct answer is +3, a wrong answer is −2, and a Shrug is +1 — so guessing when unsure is strictly worse than admitting it. The twist: consulting the oracle is seductive (it *sounds* certain), and players who lean on it get punished on bluff rounds. A per-game 'Calibration' meter tracks how often each player's confidence matched reality; the winner isn't the most-right, it's the best-calibrated. A post-game screen reveals which oracle answers were lies and who fell for them.

## Technical approach
Stack: a Node/TS host (browser on the TV) + player phones over WebSocket (Socket.IO); question bank as JSON with a known ground-truth answer. The oracle is a single Claude call per consult; the 'lie' rounds use a system prompt instructing a confident wrong answer plus a persuasive-but-false rationale (temperature nudged, no hedging). Data model: rooms, players, rounds, and a per-player decision log (answer/consult/shrug + outcome) for the calibration score. Calibration metric: reliability-diagram style — bucket each decision by the player's implied confidence (answer=high, shrug=low) and compare to correctness, scoring Brier-like. The genuinely hard part is tuning the lie rate and the oracle's persuasiveness so it's beatable-but-tempting — too obvious and no one consults; too good and the game is a coin flip. Needs playtesting to land the reward table.

## v1 scope
- 4-player local room, phone buzzers, one TV host screen
- 100-question hand-authored bank with ground truth
- Oracle consult via one LLM call; fixed 30% confident-lie rate
- Scoring +3/−2/+1 and an end-game 'who trusted the bluff' reveal

## Out of scope
- Full reliability-diagram calibration meter (v1 uses raw score)
- User-submitted question packs
- Difficulty/lie-rate adaptation

## Risks & unknowns
- Balancing the lie rate and oracle persuasiveness is the whole game — high playtest risk
- LLM latency per consult could stall pacing (pre-generate lies for the bank)
- Players may just never consult, collapsing the mechanic — needs a nudge (limited free info otherwise)

## Done means
Four phones join a room, play 10 rounds, at least one bluff round fools a player into a wrong answer, the scoreboard reflects that Shrugs beat wrong guesses, and the end screen correctly reveals which oracle answers were lies and who acted on them.

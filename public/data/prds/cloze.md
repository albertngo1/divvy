## Overview
A 3-6 player cloze / mind-reading game scored by a small in-browser language model (distilgpt2 via transformers.js). The host shows one shared sentence with several blanks; exactly one blank is privately owned by each phone. You guess the word for your slot, and the model scores how likely your guess is there — in the fully assembled sentence you never fully saw.

## Problem
Predict-the-model games usually fix everyone on the same target token, collapsing into a pure tie-break. The itch here is reading a language model's mind at a spot only *you* own, under genuine uncertainty about the words your neighbors will drop into the very same sentence that scores you.

## How it works
The host TV displays a sentence template with N blanks, e.g. "The ⬚ chef quietly ⬚ the ⬚ before service." Each phone is secretly assigned ONE blank and shown the sentence with only its own blank highlighted — everyone else's blanks stay blank on your screen. You privately type a single word for your slot. Simultaneous; you can't see others' guesses. Crucially the model scores the FULLY assembled sentence, so your slot's best word depends on words you can't see — you're predicting under hidden interdependence. Reveal: host fills every blank with the players' words, runs the model, and scores each player by the probability (inverse surprisal) the model assigns to THEIR word in context, normalized by that slot's entropy so an easy idiom-blank isn't worth more than a wide-open one. Highest normalized score wins; the Frankenstein sentence is read aloud for laughs.

PRIVATE per phone: which blank is yours, your context view, your guess, and a local "model likes/dislikes this" nudge (phone scores the partial sentence — only a hint, since it's incomplete). SHARED host: the template and the final assembled, scored reveal.

## Technical approach
distilgpt2 (transformers.js). Phones give a local estimate over the partial sentence for feedback; the host does the authoritative full-sentence scoring once all words arrive. Server state: {template, blanks:[{index, ownerId, guess}], phase}. Sync: server shuffles and assigns blanks at round start, collects one guess per phone, barriers until all submitted, host scores, broadcasts. Hard part: per-slot entropy normalization — the host must compute the model's teacher-forced distribution at each blank position to get both the player's word's surprisal and the slot's entropy for fair scoring, plus stable handling when a guess tokenizes to multiple tokens.

## v1 scope
- 3-6 players, one round, one template with exactly N = player-count blanks.
- Random blank assignment, one guess each.
- Host authoritative scoring with entropy normalization.
- Assembled sentence read aloud on reveal.

## Out of scope
- Multiple rounds; multi-token guesses beyond the first token; choosing your own blank.

## Risks & unknowns
- Multi-token guesses complicate fair scoring.
- Entropy normalization can feel opaque — needs a simple reveal visualization.
- If slots are too tightly coupled, the interdependence may frustrate more than delight.

## Done means
Five phones each receive a distinct blank, submit blind, host assembles the sentence, scores each word's entropy-normalized model likelihood, and shows a ranked reveal; the assembled sentence and per-slot entropy render correctly and scores reproduce on rerun of the same guesses.

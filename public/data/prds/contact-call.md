## Overview
Contact Call is a browser daily puzzle inspired by the decoding of zebra-finch "language." Each day a procedurally generated songbird speaks a tiny artificial grammar. You're shown a few call → response exchanges and must infer the rule, then compose the correct reply to a fresh call. Wordle-style: one puzzle a day, shareable spoiler-free result.

## Problem
Deduction puzzles are usually numeric (Nerdle) or lexical against *English* (Wordle). There's little that makes you feel the specific pleasure of cracking an *unknown grammar* — the thing linguists and the finch researchers actually do — in under five minutes, with a satisfying "aha" instead of a dictionary lookup.

## How it works
A bird's language is a small formal system: a syllable inventory (rendered as short glyph/tone motifs) plus 2–4 transformation rules — e.g. "reply = reverse the call and append the danger syllable if it contains blue." You get 3 solved exchanges. Then a new call appears and you assemble the reply from a syllable palette. Wrong answers reveal a graded hint (which rule you violated). Solve in fewer tries = higher score. The song plays as audio + a visual spectrogram-ish motif so it *feels* like birdsong, not algebra. Shareable emoji grid encodes attempts, not the answer.

## Technical approach
Pure client-side, no backend. A date-seeded PRNG (`seedrandom`) picks a grammar from a rule DSL: syllables are tokens, rules are composable string/sequence transforms (reverse, substitute, conditional-append, positional swap) constrained so the solution is unique and human-inferable. A generator/solver validates each daily puzzle has exactly one consistent rule set and a bounded difficulty (measured by rule count + branching). Audio via Web Audio API: each syllable = a short FM/formant chirp; spectrogram drawn on canvas. The hard part is the *generator's difficulty curve* — auto-grading that a grammar is crackable from 3 examples but not trivially so (search for minimal-example uniqueness).

## v1 scope
- 6 hand-tuned rule primitives + seeded daily grammar
- 3 example exchanges + 1 challenge call
- Syllable-palette answer builder, 4 guesses
- Audio playback + canvas motif for each call
- Shareable result grid

## Out of scope
- Real bird acoustics / ML on actual recordings
- Accounts, streak sync across devices (localStorage only)
- Multi-bird conversations

## Risks & unknowns
- Auto-generated grammars may be ambiguous or unfair — needs a solid uniqueness checker
- Audio may annoy more than delight; visual-only fallback needed
- Difficulty calibration without playtesters is guesswork

## Done means
On a given date, everyone loads the same finch grammar, I hear/see three exchanges, correctly build the fourth reply within the guess limit, and get a shareable grid — and a solver confirms that grammar had exactly one consistent rule.

## Overview
Sandhi is a solo daily browser wordgame built on *rebracketing* — the way word boundaries can be redrawn to reveal a different word ('an ice man' → 'a nice man', 'the night rate' → 'the nitrate'). Each day gives you one hidden target word; you must produce a short, natural English phrase whose letters (spaces removed) contain that target spanning at least one word boundary. For word nerds, Oulipo fans, and anyone who liked juncture-based puns.

## Problem
Most daily wordgames are anagram/guess variants that have been mined to exhaustion. The boundary between words — linguistic *sandhi* and juncture — is a rich, under-used play space that rewards a different, more generative kind of cleverness: not unscrambling letters, but composing a plausible phrase that hides a smuggled word in plain sight.

## How it works
- Daily puzzle shows a target, e.g. **ICEMAN**... no, a target like **NITRATE**.
- You type a phrase. The engine strips spaces/punctuation, lowercases, and checks the target appears as a contiguous substring *and* that the substring crosses at least one original word boundary (so 'nitrate glow' doesn't count — it must be split, like 'night rate').
- Each submitted phrase is validated for 'is this real English' via a bigram/phrase check so you can't win with gibberish.
- Scoring rewards shortness (fewer letters) and 'naturalness' (higher corpus frequency of the component words). Wordle-style shareable spoiler-free result grid.
- A daily curated puzzle plus an endless 'find any target' practice mode.

## Technical approach
Static site, TypeScript, no backend needed for v1 (deterministic daily seed from the date). Wordlist + frequency from a public corpus (e.g. SUBTLEX / Google Books unigrams). Boundary-crossing check is trivial string logic once spaces are stripped with index tracking. Naturalness gate: a small bigram model (or just 'each token is a known dictionary word above a frequency floor') to reject nonsense. Generating the *daily target* is the interesting NLP: run word-break dynamic programming over a phrase corpus to find phrases whose despaced form has an alternate high-frequency word segmentation, rank by surprise/humor, and pre-curate the best into a JSON schedule. The genuinely hard part: **auto-mining puzzles that are solvable *and* delightful** — many valid rebracketings are dull, so v1 hand-curates a few hundred targets from an offline mining pass.

## v1 scope
- ~200 pre-curated daily targets in a JSON schedule.
- Phrase input, boundary-crossing validator, dictionary+frequency naturalness gate.
- Shortness/frequency score + shareable emoji grid.

## Out of scope
- Homophone/phonetic sandhi via pronunciation dict (v2, needs CMUdict).
- Multiplayer, accounts, server-side validation.

## Risks & unknowns
- 'Naturalness' is subjective; the frequency gate may accept awkward phrases or reject clever ones — tune the floor.
- Some targets have no short natural solution; curation must guarantee at least one exists (store a reference answer).
- English-only; juncture humor doesn't translate.

## Done means
A player can load today's puzzle, submit 'the night rate' for target NITRATE, see it accepted with a score, get rejected for 'nitrate' (no boundary) and for gibberish, and share a spoiler-free result — all offline from a static build.

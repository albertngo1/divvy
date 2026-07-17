## Overview
Runner-Up is a 3–6 player concurrent-room word game where the scoring lever is per-token *rank*, not aggregate perplexity. Each player privately builds a sentence in which every word should be the language model's rank-2 prediction — its runner-up, never its top pick and never a surprise. It's a game of deliberate, calibrated mediocrity for groups who've exhausted 'weirdest/most-predictable' framings.

## Problem
Every perplexity game so far pushes toward an extreme: minimize surprise, maximize surprise, or hit an aggregate band. The unexplored itch is *steering between* — consistently landing on the second-most-likely word forces you to model what's obvious AND avoid it, which is a genuinely different mental act and produces uncanny, almost-normal prose.

## How it works
The host TV shows a shared sentence stem (e.g. "On Sunday morning the dog..."). Each phone PRIVATELY shows its own copy of the stem and a text field. Players write a continuation of ~8 words, simultaneously, on their own boards. Nobody sees anyone else's text.

Scoring: the host runs each completed sentence through distilgpt2 token-by-token. For each word the player wrote, the model's ranked next-token distribution is computed; the word scores best if its rank is exactly 2 (configurable band: rank 2–3 = full points, rank 1 = 'too obvious, half points', rank ≥8 = 'too weird, zero'). Your score is the count of words landing in the runner-up band.

The host reveal renders each sentence with every word color-coded — green (rank 2–3), grey (rank 1, obvious), red (rank ≥8, wild) — so the room instantly sees who threaded the needle and who kept blurting the obvious word. Highest green-count wins.

Private-per-phone is load-bearing: everyone writes different sentences simultaneously and the challenge is personal calibration; a single passed phone kills the parallel race and lets players copy each other's near-misses.

## Technical approach
Host tab runs transformers.js (distilgpt2) with access to full logits so it can compute the rank of each supplied token given the preceding context. Phone PWAs are thin string editors over a WebSocket server (PartyKit / Durable Object or Socket.IO on Tailscale Serve). Data model: `room{stem, phase, rankBand}`, `player{id, sentence, wordRanks[]}`. Phases WRITE → SCORE → REVEAL, server-gated. Sync is trivial (submit-once per phase). Hard part: rank lookup — for each written word, feed the running prefix, get the sorted logits, find the token's index; must handle tokenizer splitting multi-token words (take the first subtoken's rank, or average) to keep scoring intuitive.

## v1 scope
- 3–4 players, one stem, one round, ~8-word continuations.
- Rank-2/3 = full, rank-1 = half, rank≥8 = zero.
- Host-side scoring; color-coded reveal.

## Out of scope
- Live per-keystroke rank hints (v1 scores only at submit).
- Multi-round, adjustable target ranks per round.
- Tie-break subtleties.

## Risks & unknowns
- Multi-token words muddy the rank concept — needs a clear rule and playtest.
- Rank-2 may feel arbitrary/unteachable without a worked example on the host screen.
- distilgpt2 logit extraction cost per sentence (small; fine offline).

## Done means
Four phones submit continuations simultaneously; the host correctly computes each word's model rank, scores runner-up hits, and renders a color-coded reveal where the highest green-count player wins — all in one round-trip per phase.

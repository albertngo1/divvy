## Overview
Word ladders, but the rungs are whole sentences. Given a start and a target sentence, change exactly one word per move; each intermediate must be grammatical and plausible. Solve in par or fewer. One puzzle a day, shareable result grid. For the crossword/Wordle crowd and for anyone who enjoys watching meaning slide.

## Problem
Wordle-likes have converged on a single mechanic: guess a token, get colour feedback. Nothing in that genre plays with *syntax* or with semantic drift, which is where the actual comedy of language lives. The joy here is specific and hard to get elsewhere: you start at "The cat sat on the warm mat" and end at "The judge spat on the cold flat" and every step along the way was, individually, completely reasonable — a mundane sentence mutating into an unhinged one with no single guilty step.

## How it works
The start and target sit at top and bottom. Tap a word to open a candidate list, pick a replacement, the sentence commits and slides onto the stack. Illegal moves (non-sentences) simply aren't offered in easy mode; hard mode lets you type any word and gates it with a fluency check, showing a live "is this a sentence?" meter that turns red as you approach garbage. Par is the true shortest path, precomputed. You win under par, you tie par, or you flail. Share output is a compact grid of your rung count vs par, plus the single funniest intermediate you passed through (chosen as the rung with lowest semantic similarity to both endpoints — the maximum-detour sentence).

## Technical approach
Corpus: Tatoeba English sentences (CC-BY, ~1.7M) filtered to 5–8 tokens, plus a hand-curated set for the daily. Neighbour graph via the classic blank-key bucket trick: for each sentence, for each token position *i*, emit key `(i, tokens with i blanked)`; every bucket is a clique of one-substitution neighbours. That builds the whole Hamming-1 graph in a single pass with a hash map — no O(n²) comparison — and gives connected components. Daily puzzles are chosen by picking two sentences in the same large component with BFS distance 4–6 and maximum embedding distance (MiniLM sentence embeddings) so the endpoints feel absurdly far apart while a short path exists. Hard-mode fluency scoring runs client-side: DistilBERT via transformers.js computing pseudo-log-likelihood of the edited sentence, normalized by length, thresholded against the corpus distribution. The genuinely hard part is that threshold — masked LMs happily bless fluent nonsense and reject fine-but-rare sentences, so v1 leans on the corpus graph (every rung is a sentence a human actually wrote) and treats the LM as an optional unlock rather than the referee.

## Technical stack: static site, precomputed puzzle JSON per day, no backend, no accounts, localStorage streak.

## v1 scope
- 30 hand-checked puzzles, corpus-only moves
- Candidate list per position, no free typing
- Par count and move counter
- Share string

## Out of scope
Hard mode / LM gating, multiple languages, user-submitted puzzles, hints, any account system.

## Risks & unknowns
Tatoeba sentences skew toward stilted textbook English — the mutation comedy may not land without curation. Component sizes may be lumpy: many sentences will have no Hamming-1 neighbours at all, so the playable subgraph could be far smaller than the corpus suggests. Needs a real check that BFS distance 4–6 pairs exist in quantity before committing.

## Done means
Thirty consecutive days of puzzles exist, each verified solvable in par, and a playtester who has never seen it completes day 1 in under three minutes and laughs at least once at a rung.

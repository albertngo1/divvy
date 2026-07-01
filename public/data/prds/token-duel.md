## Overview
Token Duel is a one-on-one autocomplete fight against a language model. You're shown a real passage revealed one word at a time; at every step both you and the model guess the next word, and at the end you see two numbers — your perplexity and the model's — over the same text. It's for word-game people, writers, and anyone curious how they stack up against the thing that keeps finishing their sentences.

## Problem
LLMs are unsettlingly good at next-token prediction, and reading is the most passive act there is. Token Duel makes the eeriness legible and competitive: it turns a chapter of Gutenberg into a duel and quietly teaches what perplexity, surprisal, and "predictable prose" actually mean by making you feel them.

## How it works
Pick a passage (a paragraph of a public-domain book or a Wikipedia lede). It reveals token by token. At each blank you type your guess for the next word; the model also produces its distribution. The actual word is revealed, and both you and the model are scored by how much probability/credit you assigned to the truth (log-loss / surprisal in bits). A running tug-of-war bar shows who's ahead. Final screen: your perplexity vs the model's, plus the single word that surprised each of you most.

## Technical approach
Stack: static front-end + a small inference backend. Source texts: Project Gutenberg and Wikipedia REST. Model: an endpoint returning `top_logprobs` for the next-token distribution (any logprob-exposing API), or an offline path via transformers.js running a small model in-browser. Human scoring uses word-level surprisal: map your typed guess to the passage's next word with case/lemma-fuzzy matching; correct = low surprisal, near-miss synonyms get partial credit via embedding similarity. The genuinely hard part is tokenization alignment — the model thinks in subwords, humans type whole words — so v1 scores at the word level and only uses the model's subword logprobs internally, aggregated back up to word probabilities.

## v1 scope
- One fixed passage of ~20 words
- You type the next word each step; compare to the model's top-1
- End screen with your accuracy, the model's accuracy, and both perplexities

## Out of scope
- Multiplayer, global leaderboards, ELO
- Arbitrary user-pasted text
- Full subword-level human scoring

## Risks & unknowns
- Word↔subword tokenization mismatch skews fairness if done sloppily
- API latency/cost per token; the in-browser fallback may be slow
- Genre bias — some passages are trivially predictable, others impossible

## Done means
You complete a 20-word passage, and the app shows your next-word accuracy and the model's side by side, each with a computed perplexity number, plus the most-surprising word for both.

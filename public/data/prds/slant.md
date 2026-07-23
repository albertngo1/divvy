## Overview
Slant is a solo web tool that takes a single real-world event and shows you, side by side, the *specific word substitutions* different outlets made while describing the same facts. Instead of a vague 'this source is biased' label, it surfaces the exact lexical fingerprint of framing. For media-literacy teachers, journalists, and anyone who wants to see spin at the word level rather than take a rating agency's word for it.

## Problem
Bias-rating sites give you a colored dot per outlet and call it done. But framing lives in word choice, and it's invisible unless you read ten articles at once and hold them in your head. Nobody has time. The capability to align articles and diff their diction is cheap now (embeddings + alignment) but no consumer tool does it — that's the arbitrage: a comparison that's tedious for a person is trivial for a pipeline.

## How it works
You paste an event query or a URL. Slant pulls 5–15 articles covering the same event, clusters them to confirm they're the same story, then does *sentence alignment* across outlets (which sentence in outlet A corresponds to which in outlet B). For each aligned claim it computes a substitution set: content words that vary across outlets while the surrounding structure matches. The UI shows a single 'consensus' rendering of the event with the contested words rendered as swap-chips — click one and see every variant ('killed' / 'died' / 'lost their life') with which outlet used it and a loaded-language score. A summary panel ranks outlets by how far their diction drifts from the median.

## Technical approach
Stack: Python FastAPI + a small React front end. Sources: GDELT DOC 2.0 API and NewsAPI to fetch same-event article clusters (GDELT already clusters by event), fall back to RSS + URL fetch. Event clustering and sentence alignment via sentence-transformer embeddings (`all-MiniLM`) + cosine matching with a monotonicity constraint (dynamic-programming alignment so order is preserved). Substitution detection: on aligned sentence pairs, run a token-level diff and keep swaps that are near-synonyms (WordNet / embedding similarity) or that flip on a loaded-language lexicon (MPQA subjectivity, NRC VAD for valence/arousal). Loaded-word scoring blends VAD valence + a small classifier. The genuinely hard part is *robust cross-outlet sentence alignment* — coverage reorders and compresses facts — solved with embedding DP alignment plus a 'no good match' skip state.

## v1 scope
- Paste one GDELT event ID or search phrase; pull up to 10 articles
- Sentence-align, surface top 15 contested content-word swaps
- Swap-chip UI with per-outlet attribution and a valence score
- Static export (PNG/permalink) of the framing map

## Out of scope
- Real-time monitoring / alerts, paywalled outlets
- Non-English coverage, factual fact-checking (this is diction, not truth)
- Automated left/right labels — show the words, let the user judge

## Risks & unknowns
- Alignment quality on heavily rewritten coverage; needs a confidence threshold and graceful 'unaligned' bin
- NewsAPI/GDELT rate limits and article body extraction reliability
- Loaded-language scoring is subjective — must be transparent, not authoritative

## Done means
For a recent multi-outlet event, Slant returns at least 8 aligned claims and correctly surfaces ≥3 real diction swaps a human reviewer agrees are framing choices, each attributed to the right outlets, with a shareable permalink that reproduces the view.

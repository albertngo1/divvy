## Overview
A desktop writing companion for people who have written in public for years and can feel their voice flattening. It builds a dated fingerprint of your prose from your own repository history, and scores any draft paragraph-by-paragraph on two axes: distance from *past you*, and distance from the LLM median.

## Problem
The complaint that AI-assisted prose "reads like nobody" is real but unmeasured — you notice it in other people's writing and never in your own. Meanwhile your actual style drifts for boring reasons too (new job, new audience, laziness), and there's no instrument for it. Grammar checkers push everyone toward the same mean, which is the opposite of what's needed.

## How it works
Point it at one or more git repos containing markdown (a blog, a notes vault, docs). It walks history and reconstructs the *first committed version* of every file at its commit date — giving a longitudinal, dated corpus of your writing for free, with revisions and edits as bonus signal. It computes a yearly fingerprint, then opens as a two-pane editor: your draft on the left, a margin ribbon on the right where each paragraph is colored by nearest neighbor — 2019-you, 2024-you, or the LLM centroid. A side panel lists your fastest-rising tics: phrases whose rate this year is far above your five-year baseline.

## Technical approach
- **Stack:** Rust CLI + Tauri shell; `git2` for history walking; SQLite for the corpus and feature cache.
- **Feature vector (deliberately topic-agnostic):** relative frequencies of the ~150 most common function words (Burrows's Delta), POS-trigram distribution from a small tagger, sentence-length mean and Gini, punctuation rates (em dash, semicolon, parenthetical), subordinate-clause depth, Yule's K for vocabulary richness.
- **Scoring:** z-score each feature against the whole-corpus distribution, then cosine/Delta distance to (a) each yearly centroid and (b) an LLM reference centroid built by generating ~2,000 paragraphs from three models on prompts derived from your own headline list — matched topics so the comparison isn't measuring subject matter.
- **Tic detection:** per-year n-gram (2–5) rates with a Poisson rate-change test, ranked by lift × current frequency.
- **Hard part:** small samples. Burrows's Delta is unstable below ~1,000 words, and a paragraph is 80. Use rolling windows plus empirical-Bayes shrinkage of each paragraph's vector toward the document mean, and refuse to render a verdict below a confidence floor rather than showing noise as color.

## v1 scope
- `voice build ./blog` — walk git, extract corpus, write SQLite
- `voice score draft.md` — print the 5 most LLM-median paragraphs and the 10 fastest-rising tics
- No GUI, no editor, no reference LLM corpus (v1 compares only to past-you)

## Out of scope
AI-detection claims, rewriting suggestions, non-git sources, multi-author corpora.

## Risks & unknowns
Style drift may be dominated by genre (a README is not an essay) and need per-genre baselines. The LLM centroid may be a moving target across model releases. And the tool could easily become self-parody: an instrument that makes you write in imitation of yourself.

## Done means
A held-out set of your own paragraphs from two different years is classified to the correct year at meaningfully above chance, and on a paragraph you knowingly had a model write, the tool flags it in its top 5.

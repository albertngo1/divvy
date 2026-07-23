## Overview
Sequester generates and maintains a private benchmark from your own corpus, then runs candidate LLMs against it to give you a leaderboard that reflects your actual use case instead of gamed public benchmarks. For teams choosing or monitoring a model in production.

## Problem
The 'Are AI labs pelicanmaxxing?' post nails it: public benchmarks are contaminated and overfit. Labs train toward the leaderboard, so MMLU/GSM8K numbers say little about whether a model is good at YOUR support tickets, YOUR contracts, YOUR codebase. Everyone eyeballs a few prompts and calls it evaluation. There's no cheap way to get a held-out, contamination-proof score on your own domain — and to re-run it the day a new model drops.

## How it works
You drop in a folder of documents. Sequester chunks them, and for each chunk a generator model synthesizes QA pairs of varied types (factual lookup, multi-hop reasoning, 'is this claim supported?', extraction). Because the questions are derived from your private, possibly-freshly-written text, no candidate model could have trained on them. It runs each candidate model over the frozen set, grades answers with an LLM-judge plus exact-match where possible, and produces a per-model scorecard with per-category breakdowns. The set is frozen and versioned; re-running next month's new model against the same sequestered set shows real drift, not benchmark noise.

## Technical approach
Stack: Python, LiteLLM to hit any provider uniformly, DuckDB/SQLite to store the eval set and every run, a thin Streamlit dashboard. Data model: Documents → Chunks → Questions (with gold answer + provenance span + difficulty) → Runs → Responses (with judge score + rationale). Question generation uses structured outputs to force answer + citation span; a verification pass discards questions whose gold answer isn't entailed by the source span (self-consistency filter) to kill hallucinated golds. Grading blends exact/regex match for extraction with a rubric-based LLM-judge for open answers, and we calibrate judge reliability by planting a few human-graded anchors. The hard part is question QUALITY — auto-generated questions trend trivial or ambiguous; the entailment filter plus difficulty stratification is what separates this from a toy.

## v1 scope
- Ingest plain-text/markdown/PDF folder
- Generate ~100 questions, entailment-filtered
- Run 3 hardcoded models, LLM-judge grade
- One scorecard table with per-category scores

## Out of scope
- Agentic/tool-use evals, multi-turn
- Human-in-the-loop question review UI
- Fine-grained cost/latency benchmarking

## Risks & unknowns
Generated questions may be too easy to discriminate strong models; LLM-judge bias and self-preference; users must trust their private docs to provider APIs (need a local-model path). Judge cost can balloon on big sets.

## Done means
Given a 50-doc corpus, Sequester produces a frozen 100-question set where a human rater agrees the gold answers are correct ≥90% of the time, and running two known-different-quality models yields a score gap that matches human preference.

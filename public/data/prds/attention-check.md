## Overview
Attention Check is a B2B API and dashboard that flags likely-LLM-generated open-ended responses in surveys and paid research panels. It's for market-research firms, UX researchers, academic survey teams, and anyone paying respondents on Prolific, MTurk, or via Qualtrics/SurveyMonkey where free-text answers are the deliverable.

## Problem
Open-ended survey answers used to be the honest, messy signal researchers trusted. Now a meaningful fraction of paid respondents paste the question into an LLM and return a polished, on-topic, utterly synthetic paragraph. Existing 'AI detectors' are generic text classifiers with terrible false-positive rates and no notion of *paid-panel behavior*. Researchers currently catch this by eyeballing responses — slow, inconsistent, and unfair to real participants.

## How it works
You embed a tiny JS snippet in the survey (or forward responses via API post-collection). Per response we compute three signal families: (1) **behavioral** — paste events, inter-keystroke timing, focus-blur (tab-switch to another app), and time-to-first-keystroke; (2) **textual** — perplexity under a small reference model, burstiness, and hedge/register markers; (3) **batch-level** — embedding-cluster tightness across the whole panel (LLM answers to the same prompt collapse into a suspiciously small region of embedding space). Each response gets a 0–100 risk score plus a reason breakdown. Researchers set a threshold, auto-reject or route-to-review, and export a clean audit trail for their IRB or client.

## Technical approach
Stack: TypeScript client SDK, a Rust/Node ingest API, Postgres + pgvector for embeddings. Behavioral capture is a ~4KB script logging coarse event timings (no keystroke content, for privacy). Text scoring runs a small local model (e.g. a distilled scorer) for perplexity plus classic burstiness stats; embeddings via a hosted embedding endpoint, clustered with HDBSCAN per survey-question batch. The genuinely hard part is calibration: keeping false positives low across languages and demographics so you don't punish articulate humans — so the score is deliberately *behavioral-first*, with text signals as tiebreakers, and every rejection is explainable.

## v1 scope
- JS snippet capturing paste + timing + focus events
- Single scoring endpoint returning risk + reasons JSON
- Batch embedding-cluster flag run on CSV upload
- One dashboard table: sort responses by risk, mark reviewed

## Out of scope
- Real-time blocking mid-survey
- Multiple-choice / Likert fraud (this is open-ends only)
- Voice/video responses

## Risks & unknowns
- False positives on non-native English speakers → reputational landmine
- Panel platforms may restrict injectable JS
- Arms race: respondents who hand-retype LLM text defeat behavioral signals (batch clustering is the backstop)
- 'AI detection' is a crowded, distrusted category

## Done means
On a labeled test set (100 genuine + 100 LLM-assisted responses to the same prompts), the batch+behavioral score achieves ≥85% recall on synthetic answers at ≤5% false-positive rate on humans, and a researcher can upload a CSV and get a sorted, reason-annotated risk list in under 60 seconds.

## Overview
A self-hostable web tool + browser extension that helps writers wrongly accused of using AI defend themselves. It runs your text through the *same* open detectors your teacher/editor uses, explains *why* each sentence scores as it does, and assembles a provenance dossier (edit timeline, paste events, revision diffs) into a shareable PDF. For students, ESL writers, and — the sharp niche — autistic writers, whose flat-affect, list-heavy, hyper-consistent prose is disproportionately misclassified as machine-generated.

## Problem
AI-text detectors are being used as disciplinary evidence despite ~30% false-positive rates on non-neurotypical and non-native writing (see arXiv: *The Misclassification of Autistic Writing as AI-Generated*). The accused have no way to see the detector's reasoning or prove authorship. The burden of proof is inverted and the victim has no instrument. That instrument is cheap for me to build and impossible for them to assemble alone — a clean arbitrage.

## How it works
1. Paste or upload an essay (or write inside the tool, which records provenance live).
2. Alibi scores it with an ensemble of *open* detectors (a classical TF-IDF + logistic classifier trained on the RAID corpus, plus perplexity/burstiness from a small local model) — mirroring the HN 'classical ML LLM classifier' approach so results are explainable, not black-box.
3. Per-sentence heatmap: which features drove each flag (low burstiness, no rare tokens, uniform sentence length). Each shows a plain-English 'this reads machine-like because…'.
4. Suggests *authenticity-preserving* edits that lower the score without dumbing down the writing, and — key — a rewrite is optional; the point is evidence, not gaming.
5. Exports an 'Alibi Packet': the detector outputs, feature explanations, and (if written in-tool) a timestamped keystroke/paste log + revision graph.

## Technical approach
Stack: SvelteKit front end, FastAPI back end, DuckDB for the RAID feature store. Detector ensemble: scikit-learn logistic regression on char/word n-gram TF-IDF (the reproducible 'classical' baseline), plus GPT-2-small perplexity via llama.cpp for burstiness. Provenance: a CodeMirror editor emitting an append-only event log (insert/delete/paste with monotonic timestamps), hashed into a Merkle chain so the timeline is tamper-evident. Explanations via SHAP over the logistic model — genuinely explainable, no LLM needed. Hard part: making false-positive explanations *legible and defensible* to a non-technical dean, and resisting the tool becoming a cheating aid (mitigated by centering provenance over rewrite).

## v1 scope
- Paste text → ensemble score + per-sentence SHAP heatmap.
- One-page 'why this flagged' explainer.
- In-tool editor with tamper-evident keystroke log → exportable Alibi Packet PDF.

## Out of scope
- Beating any *specific* commercial detector (Turnitin etc.).
- Real-time collaboration, LMS integration, accounts.
- Legal advice / template letters.

## Risks & unknowns
- Dual-use: could help actual cheaters evade detection. Framing and feature set lean toward provenance evidence, not evasion.
- Detector drift: commercial tools differ from the open ensemble; need a clear 'this is directional' disclaimer.
- Whether institutions accept a self-generated provenance packet as evidence.

## Done means
Paste a known-human autistic-writing sample that a public detector flags as AI; Alibi reproduces a high machine-score, shows the driving features per sentence, and exports a PDF packet a layperson can read and understand in under two minutes.

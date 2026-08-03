## Overview

A local browser tool for anyone who writes instructions other people (or agents) must execute: PMs, tech leads, RFP authors, teachers. You paste text; it returns a clustered map of the distinct readings your text supports, ranked by how many readers landed on each, plus a per-sentence attribution of where the divergence comes from.

## Problem

Asking a model "is this ambiguous?" produces confident sycophantic prose and misses everything, because the model is reasoning *about* the text instead of *from* it. Ambiguity isn't a property you can introspect — it's the variance in what happens downstream. The itch is real and daily: you ship a ticket, three people build three things, and nobody flagged it because each reader's own reading felt obvious to them.

## How it works

1. Paste text. 2. The tool samples N=40 *independent interpretations* at temperature 1.0 — not answers, but "restate the concrete plan this asks for, ≤40 words, do not ask questions, do not hedge." Each sample never sees the others. 3. Embed all 40, cluster, and render clusters as cards: a 6-word distinguishing label, the share of readers, and two verbatim samples. Four clusters at 40/30/20/10 is the money shot — you wrote one sentence and got four builds. 4. Span attribution: for each sentence, mask it and resample N=15 against the *fixed* centroids from step 3. Sentences whose removal **lowers** interpretive entropy are the forks (red underline — this clause is what's splitting people); sentences whose removal **raises** it are anchors doing disambiguating work (green). 5. Edit inline, re-run, watch entropy drop.

## Technical approach

Stack: Vite + React, everything client-side, key in localStorage. Sampling via the Anthropic Messages API against `claude-haiku-4-5-20251001` — 40 samples of ~60 output tokens is fractions of a cent, so re-running on every edit is affordable. Send the 40 as parallel requests with the shared instruction prefix cached (`cache_control: ephemeral`) so only the paste varies.

Embeddings run locally: `Xenova/all-MiniLM-L6-v2` through transformers.js in a Web Worker (WASM backend, ~25 MB, warm in ~2 s) — no second vendor, no data leaving for the embedding step. Cluster with agglomerative linkage on cosine distance, cut at the k maximizing silhouette over k∈[1,6]; k=1 means genuinely unambiguous and the UI should say so loudly. Cluster labels come from one extra call that sees the two medoid samples per cluster.

Entropy: Shannon over soft assignment (softmax of negative cosine distance to centroids, τ=0.1). Ablation deltas are noisy at N=15, so bootstrap a 90% CI over resamples and only underline a sentence when the CI excludes zero — the hard part is making a stochastic measurement stable enough that identical input twice doesn't paint different sentences red.

## v1 scope

- Textarea + Run button, no persistence
- N=20 samples, fixed k=3 clustering, no silhouette search
- Cluster cards with counts and raw samples; no auto-labels
- No ablation at all — just "here are your three readings"

## Out of scope

Suggested rewrites, diffing two drafts, Jira/Linear plugins, multi-paragraph documents, non-English text, team sharing.

## Risks & unknowns

One model's sampling diversity is not the same as human reader diversity — it may be systematically narrower, understating real ambiguity. Long inputs collapse to one cluster because the model latches onto the first paragraph. MiniLM's 256-token window truncates longer restatements.

## Done means

On a corpus of 10 real tickets you wrote, the tool finds ≥2 clusters on at least 4 of them, and for 3 of those a colleague who wasn't involved independently picks the same sentence the tool underlined red as the confusing one.

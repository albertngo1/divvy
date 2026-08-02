## Overview
A public index plus a paid alerting service for the supply-chain hole that opened when people started pasting model-written code: models confidently `import` packages that do not exist. The index measures which fake names are produced *reproducibly and across models* — those are the ones an attacker can pre-register and wait on — and tracks, per name, whether someone already has.

## Problem
A hallucinated import is a name collision with the future. If three different models, asked a common question, all reach for `pandas-gbq-lite` and it does not exist on PyPI, then registering it is a zero-effort supply-chain attack with a self-refilling stream of victims. Existing research has shown the phenomenon; nobody is running it as a live sensor, and no maintainer gets told when models start inventing plausible siblings of *their* library.

## How it works
An elicitation harness fires a rotating bank of realistic coding tasks ("stream a parquet file from S3 in Rust", "parse an .ics in Go") at a panel of models, several samples each at temperature 0.8. Code blocks are parsed, imports extracted, and every referenced package resolved against its registry. Non-resolving names are the catch.

Each name gets three scores: frequency (how often it appears), cross-model agreement (how many distinct model families invent it — this is the danger signal), and proximity (which real package it is a distortion of, by edit distance and embedding similarity over registry descriptions). Then the index checks registration state and, critically, *registration timing*: a name that materialized on npm three weeks after models started emitting it is a live incident.

Defensively, the top cross-model names get benign placeholder packages published under one transparent org — no install scripts, no code, a README explaining what happened and pointing at the real library. Real-world exposure is then measured with public download stats (`api.npmjs.org/downloads/point/`, pypistats), which is the first honest number on how often anyone actually installs a hallucination.

## Technical approach
Python workers on a schedule; Postgres for names, observations, and registration state; tree-sitter grammars for Python/JS/Rust/Go to extract imports rather than regexing them. Resolution via `pypi.org/pypi/{name}/json`, npm registry `GET /{pkg}`, `crates.io/api/v1/crates/{name}`, `proxy.golang.org`. Registration timing from each registry's first-release timestamp. Proximity uses `rapidfuzz` for edit distance and a sentence-transformer index over registry descriptions for semantic siblings. Change detection on registration state is a nightly diff.

Hard parts: (1) cost control — meaningful coverage needs tens of thousands of samples, so tasks must be sampled by expected yield, not uniformly; (2) false positives from private/internal/renamed/yanked packages, which need an explicit "was it ever real" check against archived registry snapshots; (3) the index itself is an attack shopping list. Mitigation is a disclosure discipline: a name is published only after it has been sinkholed or is already registered by a third party, never while it is unregistered and unclaimed.

## v1 scope
- 200 tasks × 3 models × 5 samples, Python and npm only
- Import extraction + registry resolution + a static ranked table
- One column: registered / unregistered / registered-after-first-sighting
- Manual sinkhole of the top 5 names, by hand, with a written policy page

## Out of scope
IDE plugin, CI gate, maintainer dashboard, non-code hallucinations, automated bulk registration.

## Risks & unknowns
Registry name-squatting policies may forbid placeholder packages even benign ones — needs a conversation with PyPI/npm security before publishing at scale, and the project dies quietly if they say no. Model updates may reshuffle the hallucination distribution monthly, which is either a churn problem or the product. Dual-use optics require the disclosure policy to be load-bearing, not a footnote.

## Done means
A published table of ≥50 cross-model hallucinated names with registration state, at least one name demonstrated to have been registered by a third party *after* its first sighting, and download counts from the sinkholed placeholders showing whether real installs occur.

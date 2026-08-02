## Overview

Mood Ring is a CLI (and later an LSP) that classifies every paragraph of your Markdown docs into one of the four Diátaxis modes — tutorial, how-to, reference, explanation — and renders each page as a horizontal stripe of four colors. Mixed, flickering stripes are the pages your users bounce off. For anyone maintaining developer documentation who has read the Diátaxis site, agreed with it, and then had no way to check whether their docs actually obey it.

## Problem

Diátaxis is convincing and unenforceable. Teams reorganize their directory tree into `tutorials/`, `how-to/`, `reference/`, `explanation/`, feel virtuous, and then keep writing pages that lurch between modes paragraph to paragraph: a tutorial that stops to enumerate every config flag, a reference page that opens with a five-paragraph philosophy essay. Prose linters (Vale, write-good) check style — passive voice, weasel words — and are completely blind to this. The failure is structural, not stylistic, and it is invisible in a diff.

## How it works

`moodring docs/**/*.md` emits: (1) an SVG stripe per file, one band per paragraph, colored by predicted mode with opacity by confidence; (2) a *purity* score — the run-length-normalized entropy of the mode sequence, so a tutorial containing one reference table scores fine but one that alternates every other block does not; (3) line-ranged diagnostics: `guides/quickstart.md:48-61 reference-mode block inside a tutorial page`. A `--ci` flag fails the build when purity drops below a threshold or a page's mode count increases relative to the base branch.

## Technical approach

Parse with `remark`/mdast (and `docutils` for rST) into blocks, keeping heading path and line spans. Feature extraction with spaCy: imperative detection (sentence-initial base-form verb with no nominal subject → how-to/tutorial), person pronoun counts (`you`/`we`/`I`), tense and aspect, modality (`should`, `can`, `must`), copular definitions (`X is a Y` → reference/explanation), code-block adjacency and length, ordered-list membership, table density, hedging, sentence-length variance.

The training corpus is the clever part and it is free: search GitHub for docs trees that already use the canonical directory names (`tutorials/`, `how-to/` or `howto/`, `reference/`, `explanation/`) — mkdocs and Sphinx projects that adopted Diátaxis. Directory name becomes the paragraph label. Scrape ~40 such repos, ~20k paragraphs, dedupe by content hash, hold out whole repos (not paragraphs) for validation to avoid leakage. Model: logistic regression over the handcrafted features plus TF-IDF of function words as the baseline; a fine-tuned MiniLM sentence classifier if the baseline stalls under ~0.75 macro-F1. Ship the trained weights in the package — no network calls, no LLM at runtime.

The hard part is that page-level labels are noisy supervision for paragraph-level prediction, and the corpus is biased toward projects that already comply. Mitigation: train on high-agreement paragraphs only (bootstrap by discarding the lowest-confidence 20% and retraining), and score interleaving rather than presence.

## v1 scope

- One command, one Markdown file at a time
- 4-way classifier over handcrafted features only, ~2k paragraphs from 20 repos
- Stripe SVG + purity number + top-3 offending line ranges
- `npx moodring README.md`

## Out of scope

Auto-rewriting or splitting pages, rST/AsciiDoc, editor LSP, multi-language docs, suggesting *where* a stray block should move.

## Risks & unknowns

The four modes may not be separable at paragraph granularity — explanation vs reference is the likely confusion pair. Directory-name labels may be wrong often enough to poison training. Teams may find the stripe pretty and the score unactionable, which is a product failure, not a model one.

## Done means

Held-out macro-F1 ≥ 0.70 across whole unseen repos; running the tool on a known-bad page (a tutorial with an embedded API table) flags the correct line range; and running it on Django's `topics/` vs `ref/` trees produces visibly different stripes.

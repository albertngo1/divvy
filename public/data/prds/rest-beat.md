## Overview
Rest Beat is a desktop/CLI tool for novelists and long-form nonfiction writers that renders a manuscript as a **game difficulty curve**: a scrolling chart of cognitive load per 250-word window, annotated with the same vocabulary level designers use — ramp, spike, plateau, rest beat, boss. It answers a question no prose linter answers: *is my pacing shaped, or is it flat?*

## Problem
Writers get micro feedback (grammar, sentence length, passive voice) and macro feedback ("chapter 12 drags") but nothing in between. "Drags" is a real, measurable phenomenon — sustained high load with no recovery window — and beta readers can feel it but not locate it. Game designers solved the analogous problem decades ago by drawing the curve and looking for missing rest after a spike.

## How it works
1. Drop in a `.docx`/`.md`/`.epub`. It segments into ~250-word windows at sentence boundaries.
2. For each window it computes a **load vector**: mean token surprisal under a small LM; new-entity introduction rate (people/places never seen before); unresolved-referent load (pronouns and definite descriptions with no antecedent within N words); mean syntactic depth; dialogue-vs-narration ratio; sentence-length variance.
3. Those collapse into one 0–100 load score via weights fit against reader ground truth (see below), plotted as a curve with the chapter structure marked underneath.
4. Pattern detector labels the curve: **spike** (>1.5σ above local mean), **rest beat** (sustained low-load window ≥400 words), **grind** (long plateau, high load, no rest), **anticlimax** (chapter ends below its own median).
5. Overlay a genre reference band: the median curve of 30 published books in the same genre, aligned by percent-through-chapter. Your grind shows up as your line living outside the band.

## Technical approach
Python. Parsing: `pypandoc` + `ebooklib`. NLP: spaCy `en_core_web_trf` for entities/dependency depth, `fastcoref` for referent resolution. Surprisal: GPT-2-small or Qwen3-0.6B via `transformers`, batched, fp16 — ~40k words/min on an M-series Mac, so a 100k-word novel charts in under three minutes. Reference corpus: Project Gutenberg (public domain, genre-tagged via Gutendex) plus the user's own shelf of DRM-free epubs; store window vectors in DuckDB, one row per window. Front end: a Tauri window with a d3 curve, click-a-point-to-jump-to-the-text.

The genuinely hard part is **validating that the load score tracks real readers**, not just LM perplexity. v1 calibrates cheaply: a self-annotation mode where the writer marks 20 windows they know drag, and a ridge regression re-fits the weights per user. Real reading-time data would be better and is out of scope.

## v1 scope
- Markdown input only, single chapter
- Three features: surprisal, new-entity rate, sentence-length variance
- One PNG chart with spike/rest labels
- Reference band from 10 hand-picked Gutenberg novels

## Out of scope
- Suggestions or rewriting. It diagnoses; the writer fixes.
- Multi-POV or timeline analysis
- Web service, accounts, collaboration

## Risks & unknowns
- Load score may just be a fancy readability index; kill it if it correlates >0.9 with Flesch-Kincaid.
- Gutenberg skews pre-1930; genre bands may be useless for contemporary thrillers.
- Coref is slow and error-prone on dialogue-heavy prose.

## Done means
On a chapter the author already knows sags, the tool's lowest-labelled "grind" region overlaps the author-marked passage — for 4 of 5 test chapters — and the score's correlation with Flesch-Kincaid is below 0.7.

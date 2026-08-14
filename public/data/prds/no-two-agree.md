## Overview
A static, explorable page for any public-domain text that exists in many English translations. Instead of reading one translation, you scroll a vertical "disagreement spine" of the whole work, where thickness = how much the translators diverge at that point. Click a hot spot and all renderings stack side by side. For close readers, translation students, and anyone who has ever wondered which lines are genuinely contested versus merely stylistic.

## Problem
Multiple translations are always compared *manually*, one passage at a time, usually a passage someone already told you was interesting. The signal — where independent skilled translators, working from the same source, land in different places — is a free measurement of textual ambiguity, and nobody has ever plotted it end to end. Parallel-text sites show you columns; none of them rank.

## How it works
1. Pick a work. Units are chapters (Tao Te Ching), verses (Bible), or aligned line ranges (Iliad).
2. For each unit, embed every translator's rendering, compute mean pairwise cosine distance, then normalize against a null model.
3. The spine renders as one tall column; hover shows the unit, click expands all N renderings plus the source-language phrase implicated.
4. Side panel: per-translator fingerprint — who is systematically the outlier, who hugs the consensus centroid, who is literal vs. loose.

## Technical approach
Python + DuckDB for the pipeline, one self-contained HTML page (D3 + inlined JSON) for output. Sources: `scrollmapper/bible_databases` (KJV, ASV, WEB, YLT, Douay-Rheims — already keyed `book:chapter:verse`, so alignment is free), Project Gutenberg for ~10 public-domain Tao Te Ching translations (chapter-aligned), and Iliad translations (Butler, Pope, Chapman, Derby, Lang-Leaf-Myers) which need real alignment: DTW over sentence embeddings within a Gutenberg book boundary.

Data model: one parquet table `(work, unit_id, translator, year, text, embedding)`. Embeddings from a local `all-MiniLM-L6-v2` / `gte-small`.

The genuinely hard part is the **null model**. Raw pairwise distance mostly rediscovers "long sentences and rare words differ more," and secondarily rediscovers "Chapman wrote in 1611." So divergence must be residualized: fit distance ~ length + mean lemma frequency + era-pair, and plot the residual. A second, cheaper lexical metric (Jaccard over content lemmas) is shown alongside as a sanity check — when the two disagree, that itself is interesting (same words, different syntax = a parsing dispute).

## v1 scope
- Tao Te Ching only, 8 translations, 81 chapters
- One metric, residualized on length alone
- One scrollytelling page, click-to-expand, no search
- Hand-checked alignment (81 rows, just eyeball it)

## Out of scope
- Non-English target languages
- Machine translation of any kind
- User-uploaded texts
- Post-1929 translations (copyright)

## Risks & unknowns
Modern sentence embeddings handle archaic English badly, so era may dominate the residual. Copyright forces the corpus to skew old, which worsens that. It's possible the top-ranked chapters are boring and the method just measures verbosity — that's the falsifiable claim.

## Done means
The page loads, you scroll all 81 chapters, and the top-5 contested chapters include chapter 1 (名可名非常名) and chapter 25 — passages with documented centuries of translator argument — without those being hardcoded.

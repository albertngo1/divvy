## Overview

SCOTUS Dissent Prosody tests a falsifiable hypothesis about judicial writing: justices write *angrier* when they lose. "Angrier" is operationalized as prosody — shorter sentences, shallower subordinate-clause nesting, more parataxis. For each justice, the tool pairs their majority-opinion style against their dissent style on a scatter plot. If the hypothesis holds, dissents cluster toward shorter/flatter, and Scalia's dissents should spike hardest. It's the rare language-viz with a clean, testable claim that a real outlet could pick up.

## Problem

Opinion length and readability have been quantified, but nobody has measured the *same justice's* majority-vs-dissent prosody as a paired comparison. The interesting signal isn't "dissents are shorter" in aggregate — it's whether a given author's own register shifts when writing from the losing side. That paired, within-author framing is the un-built move.

## How it works

The main view is a paired scatter: each justice is two points (majority centroid, dissent centroid) connected by an arrow, positioned by mean sentence length (x) and mean clause-depth (y). Arrows pointing down-left = "angrier when losing." A side panel ranks justices by the magnitude of their maj→diss shift. Clicking a justice drops to their opinion list with per-opinion prosody metrics and excerpt pull-quotes. Share artifact: the paired-scatter PNG with the arrow field and a callout on the biggest mover.

## Technical approach — specific

Stack: Python (spaCy + pandas) for the NLP pipeline, static JSON, Observable Plot for the scatter in a Vite site. Data source: **CourtListener** (Free Law Project) — its bulk data and REST API expose the full US Reports corpus with opinion type (majority/dissent/concurrence) and author metadata already tagged, which is what makes the within-author join tractable. Pull opinions via the CourtListener bulk dumps to avoid rate limits.

Data model: `opinion {case_id, author, opinion_type, year, n_sentences, mean_sent_len, mean_clause_depth, subordination_ratio}`. Key NLP algorithms: **spaCy** dependency parse per opinion; sentence length from the sentencizer; clause depth = max depth of the dependency tree measuring embedded clause markers (`ccomp`, `advcl`, `relcl`, `xcomp`); subordination ratio = subordinate clauses / total clauses; parataxis count from `parataxis` + coordinating-conjunction density. Aggregate to per-(justice, opinion_type) centroids. The hard part: attribution and cleaning — CourtListener opinion text includes syllabus, headnotes, footnotes, and reporter boilerplate that wreck sentence stats; footnotes especially inflate clause depth. Strip these with regex + structural heuristics before parsing, and validate on a hand-checked sample of 20 opinions.

## v1 scope (humiliatingly small)

- 8 justices with enough dissents (Scalia, Ginsburg, Thomas, Sotomayor, Roberts, Kagan, Alito, Breyer)
- Two metrics only: mean sentence length + clause depth
- Majority vs dissent (ignore concurrences)
- Paired-scatter with arrows + magnitude ranking + PNG export

## Out of scope (for now)

- Sentiment/emotion scoring beyond structural prosody
- Concurrences, per curiam, plurality opinions
- Lower courts
- Per-case time series or ideology controls

## Risks & unknowns

Prior-art verdict: **Partial** — opinion length and complexity have been quantified, but not same-justice majority-vs-dissent prosody. Main risks: (1) prosody may not correlate with "anger" — clause depth could reflect topic complexity, not emotion, so the claim must stay descriptive and falsifiable rather than psychological; (2) footnote/boilerplate contamination is a real threat to metric validity; (3) sample size — some justices have few dissents, widening confidence intervals. Mitigate by showing per-justice n, plotting confidence ellipses, and framing findings as "register shifts," not mind-reading. This is the highest-prestige, lowest-viral idea in the round; success is being *right*, not loud.

## Done means

- Pipeline ingests ≥2,000 opinions from CourtListener bulk data, cleaned of boilerplate
- Prosody metrics validated against 20 hand-checked opinions (±10%)
- Paired scatter renders 8 justices with maj→diss arrows and sample sizes
- Ranking panel + click-through to opinion excerpts works
- Scalia's dissent shift is measured and stated with its actual number

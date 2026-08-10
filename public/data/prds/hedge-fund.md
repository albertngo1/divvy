## Overview
A CLI plus a paste-box web view that reads a draft and reports its epistemic balance sheet: which clauses are asserted, hedged, attributed, or pure speculation, and which of them carry any evidence at all. For analysts, scientists, PMs, and anyone whose writing makes claims someone might later hold them to.

## Problem
Hedging is invisible to the person doing it. Two failure modes, both common, neither detectable by rereading your own draft: over-hedging until a reviewer writes 'so what do you actually think?', and under-hedging — a flat assertion you cannot defend that you didn't notice you'd made. Grammar checkers flag 'passive voice' and 'weasel word' one token at a time; none of them measure the document.

## How it works
Point it at a `.md` file or paste text. It segments into claim-bearing clauses and scores each on two axes: epistemic force (asserted → hedged → attributed → speculative) and evidential backing (does this clause contain a number, a date, a citation, a named source?). Output is a gutter ribbon, git-blame style, coloring every line, plus three top-line numbers: hedge ratio, unbacked-assertion count, and attribution-laundering flags — places you assigned a claim to 'experts' or 'the data' with no named referent.

Then the mischief: **margin call** mode rewrites the document with every hedge cue and its scope deleted, so you read the naked version. If the flat sentence scares you, that hedge was load-bearing — keep it. If it reads fine, the hedge was cowardice — cut it. Rendered as a side-by-side diff.

## Technical approach
Python service (spaCy `en_core_web_trf`) behind a TypeScript CLI; Vite for the web view. Clause segmentation on `ccomp`/`advcl`/`conj` boundaries off the dependency parse. Hedge detection is not a keyword list — cue *scope* is the whole problem, and that's precisely CoNLL-2010 Shared Task 2, so train on BioScope's speculation-cue-and-scope annotations: a cue classifier (DeBERTa-base, token classification) plus a scope-boundary tagger seeded by the dependency subtree of the cue. Evidential backing via NER + regex (`\[\d+\]`, DOI, URL, numerals, PERSON/ORG subjects of reporting verbs). Data model: `doc → clauses[] {span, cues[], scope, force, backing, flags}`, cached by content hash. Margin-call rewrite = delete cue + scope-internal modality, then a single local-LLM pass restricted to fixing agreement and articles, diffed to guarantee it changed nothing else.

Hard part: false positives on non-epistemic modals — 'may' as permission, 'appears' as a visual verb, 'should' as obligation. And domain shift: BioScope is biomedical hedging; memo and blog prose hedges differently. Requires a hand-labeled 200-sentence eval set drawn from the user's own corpus before any number on screen is trustworthy.

## v1 scope
- Paste box only, no file watching
- Cue lexicon (Hyland's taxonomy) with dependency-subtree scope — no trained model yet
- One number on screen: hedge ratio
- Margin-call diff view, no grammar repair

## Out of scope
Non-English, Word/Docs plugins, style rewriting, team dashboards, scoring other people's writing.

## Risks & unknowns
The tool has an opinion, and the opinion may be wrong — hedges are frequently correct, and a meter that only points one direction will push people into false confidence. Mitigation: flag both over- and under-hedged clauses, never show a single 'grade'. BioScope licensing needs checking before redistribution.

## Done means
A 1,000-word memo renders per-clause coloring in under 2 seconds, the margin-call diff is grammatical English, and cue detection scores ≥0.85 F1 on a 200-sentence hand-labeled set from non-biomedical prose.

## Overview
A search front-end for the Library of Congress's Chronicling America archive (~20M scanned newspaper pages, 1756–1963) that searches for the *misspellings the OCR actually produced* rather than the name you typed. For genealogists, local historians, house-history obsessives, and true-crime researchers.

## Problem
Chronicling America's search box is essentially exact-token matching over 19th-century OCR of microfilm of blackletter type on foxed newsprint. The word you want is on the page; the index contains `Ohas. Muclieil`. Serious researchers cope by hand-typing dozens of guessed corruptions, one query at a time, and quietly conclude the ancestor "isn't in the papers." Meanwhile the post-OCR-correction literature has solved the modeling half of this problem and nobody has wired it to the archive's public search.

## How it works
Enter a name, an optional state, and a date window. The tool expands the query into a ranked set of plausible OCR corruptions under a learned character-confusion channel, fires each as a phrase query, merges and dedupes hits, and re-ranks by `P(corruption | truth) × geographic/temporal prior`. Results show a page thumbnail with the matched region boxed, because the archive exposes per-word coordinates. Marking a hit good/bad nudges the channel weights, so the model sharpens on your specific surnames and typeface era.

## Technical approach
Python + FastAPI + SQLite (FTS5 for a local hit cache), htmx front-end. Data: `chroniclingamerica.loc.gov/search/pages/results/?andtext=…&format=json`, plus each page's `ocr.txt` and `coordinates/` JSON for word boxes. The channel is a character 3-gram substitution/deletion/insertion table with add-k smoothing, trained on aligned OCR↔ground-truth pairs from the Overproof and ICDAR-2017 post-OCR correction datasets, conditioned on three era buckets (pre-1870 long-s/fraktur artifacts, 1870–1920, post-1920 — the confusion sets differ sharply). Variant generation is a Viterbi beam search over the weighted edit FST, keeping the top ~40 variants by probability mass. Word-segmentation errors (`McNeil` → `Mc Neil`, `Chas.the` merges) get separate proximity queries on the fragments. Hard parts: variant explosion against a rate-limited exact-match API, and short names whose corruptions are unsearchable as tokens — mitigated in v1 by pulling one state's bulk OCR locally and running the channel over a real index.

## v1 scope
- One surname + optional given name, one hard-coded era model
- Top 20 variants, capped at 40 API calls per search
- Results list: thumbnail, snippet, date, paper, LoC link
- CLI plus one ugly HTML page; no accounts

## Out of scope
Full local index of all 20M pages; handwriting; non-English papers; Trove/BNA/newspapers.com; family-tree integration; relevance feedback retraining.

## Risks & unknowns
LoC API rate limits and occasional instability. The confusion table may be dominated by a handful of frequent substitutions, yielding low recall on the long tail. Ranking may drown users in plausible-but-wrong people.

## Done means
On a held-out set of 25 ancestor mentions with known-mangled OCR, vanilla exact search finds ≤6 and Wrong Fount surfaces ≥18 in the top 50 results, within 40 queries per search.

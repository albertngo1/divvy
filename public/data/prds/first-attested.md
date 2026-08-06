## Overview
A web tool and CLI that checks prose against a year. You give it a manuscript and a target date; it highlights vocabulary that didn't exist yet, ranked by how badly it breaks the spell, and offers attested alternatives. For historical novelists, tabletop RPG writers, museum copywriters, and period-drama script editors.

## Problem
Anachronistic diction is the cheapest way to lose a reader and the hardest thing to catch by ear, because the offending words feel ordinary. "Teenager" (1941), "scientist" (1834), "boyfriend" (1892), "okay" (1839) sail past every copy editor who isn't a lexicographer. Existing help is a scattering of blog posts and a paywalled OED subscription that nobody wants to consult 4,000 times per manuscript.

## How it works
Three tiers of flag, not one:
- **Red — impossible.** The word form has no attestation before the target year.
- **Amber — wrong sense.** The word existed; this meaning didn't. "Computer" is 1640s; "computer program" is 1946. "Awful" meant awe-inspiring. This is the tier every existing tool misses.
- **Blue — technically fine, tonally modern.** Attested but vanishingly rare until much later; usage frequency at the target year is below a percentile threshold.

Hover a flag to get a usage sparkline from 1500–2019, the earliest-known-use citation, and 3–5 substitutes filtered to words attested before the target year with similar embeddings.

## Technical approach
Svelte front end, Python/FastAPI back end, DuckDB over parquet for the lexicon.

Data: **Google Books Ngrams v3** English 1-grams (year-by-year counts) for frequency curves and a crude first-attestation floor; **Wiktextract** JSONL dumps from kaikki.org for etymology and first-attestation dates; the **Merriam-Webster Collegiate API** `date` field ("first known use") as a curated cross-check, cached locally.

The sense problem is the interesting algorithm, and the cheap trick is to stop checking words and start checking *collocations*. For any amber-suspect token, take its dependency-attached neighbor (spaCy) and look up the resulting 2-gram in Ngrams. "Computer" clears 1640; "computer program" as a bigram is flat zero until the 1940s and the curve is unmistakable. Same for "nervous breakdown", "gay marriage", "broadcast a message". Rule: flag amber when the head word predates the target year but its bigram with the governing head has near-zero mass before it.

Hard parts: pre-1800 Ngrams data is polluted by long-s OCR ("ſ"→"f"), so "suck"/"fuck" style artifacts need a scanning-error filter; Ngrams metadata dating is unreliable for reprints; and Wiktionary's etymology dates are inconsistently formatted free text needing a parser plus a fallback.

## v1 scope
- Paste-a-textarea, one year input, three-tier highlight
- Ngrams 1-grams + Wiktextract only; no MW API, no substitutes yet
- Bigram sense check for the top 2,000 most-drifted words only, precomputed
- Sparkline on hover

## Out of scope
- Languages other than English; syntax and idiom anachronism; Word/Scrivener plugins; rewriting whole sentences

## Risks & unknowns
- Google Ngrams' corpus is books, so speech-first slang is systematically late-dated
- False positives are worse than misses; a red flag on a legitimate word destroys trust fast
- Writers may want the *opposite* tool — deliberately modern voice in period settings is a live style

## Done means
On a hand-built 200-item gold set of known anachronisms drawn from published errata and r/AskHistorians threads, ≥80% recall on red, ≥50% on amber, and under 5 false reds per 10,000 words on a control text of actual 1813 prose from Project Gutenberg.

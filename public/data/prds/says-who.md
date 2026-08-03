## Overview
A web tool that treats a quotation as an organism and reconstructs its phylogeny from dated full-text corpora. You paste a line; it returns two trees. The **text tree** shows every attested variant, when each first appeared, and the exact edit that produced it. The **attribution tree** shows who got the credit over time, and the moment it defected. For journalists, editors, Wikipedia gnomes, speechwriters, and anyone who has ever lost an argument about whether Voltaire said it.

## Problem
Quotation checking today is a Snopes article or nothing. Existing sources tell you the *final* verdict — "misattributed" — but never the mechanism: which word drifted first, whether the drift preceded or followed the misattribution, and which intermediary text everyone downstream copied from. That mechanism is the interesting part, it is fully recoverable from digitized corpora, and nobody has built the view.

## How it works
1. Paste a quotation.
2. The tool shingles it and queries dated full-text corpora for near-matches.
3. Hits are clustered into distinct *variants*; near-identical strings that differ only by OCR-plausible noise collapse into their parent.
4. Each variant gets an earliest-attestation date. A directed tree is built by connecting each variant to the earliest prior variant within minimal edit distance.
5. Around each hit, a ±120-character window is scanned for attributed names, producing a parallel attribution timeline.
6. Render: a horizontal timeline where each branch is a variant, thickness is attestation frequency per decade, and each edge is labeled with the literal edit (`"seldom" → "rarely"`). Hovering an edge opens the actual scanned newspaper page.

## Technical approach
Python + FastAPI, SQLite with FTS5 for the local hit cache, and a D3 timeline front end. Sources: the Library of Congress Chronicling America API (`/search/pages/results/?andtext=...&format=json`, ~20M dated pages with per-word coordinate JSON for highlighting), Internet Archive full-text search, HathiTrust Bibliographic + Solr proxy where permitted, and Wikiquote page history via the MediaWiki revisions API for the modern tail. Google Books Ngrams gives a cheap frequency-per-year curve per variant for branch thickness.

Two real algorithmic problems. **One: OCR noise vs. real variation.** A naive Levenshtein treats `rarelv` as a mutation. Fix with a confusion-weighted edit distance — a substitution cost matrix learned from the Overproof / ICDAR post-OCR-correction datasets, so `rn↔m`, `l↔1`, `e↔c` cost ~0.1 and `seldom↔rarely` costs full price; collapse anything under a threshold into its parent. **Two: query fan-out.** You cannot full-text search 20M pages for fuzzy strings, so search on the rarest 3-gram in the quotation (rarity from Ngrams), fetch a wide candidate set, and do fuzzy matching locally.

## v1 scope
- Chronicling America only.
- One hardcoded seed quotation with a known drift, end to end.
- Text tree only. No attribution extraction.
- Static SVG output, no interaction.

## Out of scope
Books, tweets, arbitrary web text, non-English, a verdict of true/false.

## Risks & unknowns
Chronicling America ends at 1963, so most modern mutation is invisible without a second source. Rate limits make wide fan-out slow — needs an overnight crawl per quote and a shareable permalink rather than instant results. Some quotes have too few attestations to form a tree at all.

## Done means
For "Well-behaved women seldom make history," the tool outputs a tree whose root is the correct 1976 attestation, shows the `seldom → rarely` branch with its first dated occurrence, and links a scanned page image for each node.

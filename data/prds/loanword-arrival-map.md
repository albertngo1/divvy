## Overview

Loanword Arrival Map shows English as a magpie: a time-animated Sankey where donor languages feed borrowed words into English by semantic domain across nine centuries. French floods law and food 1200-1400; Italian owns music vocabulary in the 1600s; Japanese owns 1980s tech and cuisine. The artifact makes the historical layering of English legible in one moving diagram — you *watch* the tide of influence shift from Norman French to Latin to a global scatter.

## Problem

Everyone knows English is a borrowing language, but the standard artifacts are static hand-picked lists ("10 words from Arabic") or dense etymological tables. There is no interactive that shows the *flow over time by domain* — which donor dominated which corner of the vocabulary in which century. The data to do it properly lives behind a paywall, which is exactly why nobody has shipped the open version.

## How it works

A horizontal time axis (1150 → present) drives an animated Sankey. Left nodes are donor languages (French, Latin, Old Norse, Greek, Italian, Spanish, Arabic, Japanese, Hindi…); right nodes are semantic domains (law, food, music, war, science, tech, fashion). Ribbon width = count of first-attested borrowings in the current time window. A scrubber sweeps the centuries; ribbons swell and fade. Clicking a ribbon lists the actual words that arrived (e.g. Italian→music: *piano, soprano, crescendo*). Share artifact: an animated GIF or a snapshot at a chosen century.

## Technical approach — specific

Stack: Python ingest, static JSON, D3 Sankey + a custom time-interpolation layer in a Vite site. Data source: **Wiktionary etymology dumps** — the OED is paywalled and its licensing forbids redistribution of citation dates, which is the killer for the "obvious" version of this idea. Wiktionary's structured `Etymology` sections and Lua etymology templates (`{{bor}}`, `{{der}}`, `{{inh}}`) encode donor language; parse the raw XML dump (`enwiktionary-latest-pages-articles.xml`) plus the machine-readable extraction from **kaikki.org** (Tatu Ylonen's parsed Wiktionary JSON) to avoid writing a wikitext parser from scratch.

Data model: `borrowing {word, donor_lang, semantic_domain, first_year, century_bucket}`. Semantic domain is derived from Wiktionary category tags + a keyword classifier over the gloss. First-attestation year is the genuinely hard part: Wiktionary's dates are sparse and inconsistent (many entries say only "borrowed from Old French" with no year). Algorithm: where a year exists, use it; otherwise bucket by donor-language *era of contact* (Norman French → 1150-1400) as a coarse fallback, and clearly flag estimated buckets. Domain classification uses spaCy on the gloss + a hand-mapped lexicon of Wiktionary topic categories.

## v1 scope (humiliatingly small)

- 6 donor languages, 6 semantic domains
- Century-bucket resolution (not per-year), estimated buckets flagged
- kaikki.org parsed JSON as the sole source (skip raw dump parsing)
- Animated Sankey with scrubber + click-to-list-words
- Snapshot PNG export

## Out of scope (for now)

- Per-year precision or OED-grade first-citation dates
- Every donor language / every domain
- User word lookup ("when did *X* arrive")
- Phonological or morphological analysis

## Risks & unknowns

Prior-art verdict: **Partial** — the Open University's OED-sourced map exists but covers only ~10 hand-picked words; no per-domain Sankey-over-time is built. The dominant risk is data quality and licensing: **OED licensing kills the clean version of this idea** — its dated citations are the gold standard and cannot be redistributed. Wiktionary's dates are patchy, so v1 will lean on era-bucketing, which weakens the "watch it shift year by year" promise into "watch it shift century by century." If the fallback buckets dominate the picture, the artifact risks re-stating what etymologists already published (the exact trap flagged in the source notes). Verify early that dated entries are dense enough in the six chosen domains to carry the animation.

## Done means

- Parsed ≥5,000 borrowings from kaikki.org with donor + domain assigned
- Sankey animates across ≥8 century buckets; ribbon widths validated against known totals
- Click surfaces real word lists per ribbon
- Estimated vs dated buckets visually distinguished
- Static site deployed with snapshot export

## Overview
Quit Line is a browsable, interactive atlas of *where in a document people mark things up*, built on the public Hypothes.is annotation corpus. Every article becomes a vertical strip: grey ink for the attention a passage was statistically owed given its position and length, real ink for the surplus. For readers it's a curiosity object; for writers it's a mirror — paste your own URL and see the paragraph where strangers stopped annotating and, by implication, stopped reading.

## Problem
Annotation and highlight data is wildly position-biased: openings are marked far more than endings because people quit. Every naive "most highlighted passages" list is therefore a list of first paragraphs. The interesting quantity — passages that pull attention *net of* where they sit — has been described in the literature but never made into something you can look at and play with. Meanwhile the Hypothes.is public corpus (millions of annotations, open API, no scraping gymnastics) is essentially unvisualized.

## How it works
1. Harvest: `GET https://api.hypothes.is/api/search?wildcard_uri=…&group=__world__&limit=200`, paginated by `search_after`, for a few thousand heavily-annotated URLs.
2. Anchor: each annotation carries a `TextQuoteSelector` (exact + prefix/suffix) and often a `TextPositionSelector` (start/end char offsets). Fetch the document, extract main text with trafilatura, and map each annotation to a normalized position p ∈ [0,1] — exact match first, then fuzzy alignment (diff-match-patch) when the page has changed since annotation.
3. Model: fit a corpus-wide baseline intensity λ₀(p) — a Poisson GAM over p with a spline, plus a log-length term and a per-domain random effect (partial pooling, because most URLs have <10 annotations). Expected count per paragraph = λ₀(p) × words × doc factor.
4. Render: each doc is a strip of paragraph cells; fill = Anscombe-transformed Poisson residual (observed − expected), diverging palette, grey at zero. A prominent toggle turns the correction off — the whole picture snaps back to "the top is bright," which is the pedagogical punchline.
5. Derived stat: **quit index** = 90th percentile of annotation position, i.e. how deep the last 10% of markers got. Small-multiples wall of docs sorted by quit index.

## Technical approach
Python for the pipeline (httpx, trafilatura, pyGAM or statsmodels GLM with a spline basis), DuckDB for storage/aggregation, Observable Plot + vanilla JS for the front end, output as a static site (precomputed JSON per doc). Data model: `docs(uri, n_words, n_paras, domain)`, `paras(doc_id, idx, start, end, words)`, `annots(doc_id, para_id, p, created_at)`.

Hard parts: (a) re-anchoring quotes into documents that mutated after annotation — expect 10–25% anchor failure and report it honestly rather than dropping silently; (b) sparsity — one enthusiastic annotator can define a document, so cap per-user contribution per doc and require ≥5 distinct users before a doc gets a public strip; (c) the corpus skews academic/pedagogical (class assignments), which is a genuine population caveat to state up front, not hide.

## v1 scope
- 300 documents from 3 domains, harvested once
- Binned empirical baseline instead of a GAM (20 position bins × 3 length buckets)
- One page: strip view for a single doc + the correction toggle
- A single ranked list: top 50 residual paragraphs corpus-wide

## Out of scope
Writer's paste-your-own-URL mode, per-annotator profiling, sentiment or topic modelling of annotation text, real-time updates, private groups.

## Risks & unknowns
Annotation ≠ reading (people may read on and stop marking); corpus population skew; Hypothes.is rate limits and API stability; privacy — aggregate only, ≥5 users, never surface individual accounts.

## Done means
The site renders 300 documents; flipping the correction toggle visibly reorders the top-50 passage list; and the reported anchor-failure rate and per-doc annotator counts are printed on the methods page.

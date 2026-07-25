## Overview
River is a CLI that typesets a document into per-recipient PDFs that are pixel-plausibly identical but carry a fingerprint encoded in *which* near-optimal line-breaking solution was used. For anyone who circulates confidential prose — legal drafts, embargoed press releases, board memos, pre-publication manuscripts — and wants leak attribution that survives a phone photo.

## Problem
Existing document watermarking is either metadata (stripped by a screenshot), visible overlays (ugly, and the leaker just crops), or invisible-glyph tricks like zero-width spaces and homoglyphs (destroyed by OCR, and detectable by a `grep`). Meanwhile the leaker's most common exfil channel — a photograph of a page — preserves the one thing nobody watermarks: *geometry*. Knuth-Plass justification has enormous slack; for a typical paragraph, dozens of break sets sit within a few percent of optimal total demerits and are indistinguishable to a reader. That slack is an unused covert channel.

## How it works
1. `river embed --in memo.md --recipient alice --key secret.pem` renders a PDF.
2. Each paragraph is line-broken by Knuth-Plass, but instead of taking the single optimal break set, River enumerates the K-best break sets whose total demerits are within a ceiling (default 1.12×) and whose worst per-line badness stays under a visual threshold. Paragraph *i* thus carries ⌊log₂ Kᵢ⌋ bits; River picks the m-th variant in a canonical ordering.
3. The recipient ID is HMAC'd, Reed-Solomon coded, and spread across paragraphs.
4. `river extract leaked.pdf` (or `leaked.jpg`) recovers the line-start word index of every line, replays the same K-best enumeration from the source text, finds which variant matches, and decodes the ID.

## Technical approach
- Python. `fonttools` for real advance widths, Latin Modern embedded at a fixed measure so metrics are reproducible.
- Knuth-Plass as a DAG shortest path over feasible breakpoints; badness = 100·(adjustment ratio)³, plus hyphen/flagged-pair/fitness-class demerits. K-best via Eppstein-style k-shortest-paths on that DAG, or simply keeping a k-sized heap of predecessors per node.
- Render with `reportlab` at explicit word x-positions (no reflow, ever).
- Extraction: `pdfplumber` word boxes for the digital case; `tesseract` hOCR for the photo case — we only need *which word starts each line*, which is robust to skew, JPEG artifacts, and moderate blur. Perspective de-skew via the text block's four corners.
- Data model: `{doc_hash, paragraph_index, K, chosen_variant}` per paragraph; ID = RS(255,223) over 8-bit symbols.
- Hard part: bit-exact determinism between embed and extract. Font version, hyphenation dictionary version, and measure must all be pinned into the document hash, or the decoder enumerates a different K-best list and decodes garbage.

## v1 scope
- One font, one measure, hyphenation disabled.
- 3 bits/paragraph, 8 paragraphs → 24-bit ID, no error correction.
- Digital-PDF extraction only.
- `embed` and `extract` subcommands, nothing else.

## Out of scope
- Collusion resistance (two recipients diffing their copies); real deployments need Tardos fingerprinting codes.
- Reflowable formats, HTML, multi-column, figures, non-Latin scripts.
- Any claim of legal-grade evidentiary strength.

## Risks & unknowns
- Capacity may be thinner than hoped: short paragraphs may admit only one acceptable break set.
- A copy-editor's one-word change re-flows a paragraph and destroys its symbol — RS coding must absorb this.
- Ethically two-sided; the same tool tracks whistleblowers. Ship the detector alongside the embedder.

## Done means
Embed a 24-bit ID in a 2-page memo, print it, photograph the print at an angle with a phone, and `river extract` returns the correct ID — while a human A/B comparison of two recipients' PDFs finds no perceptible difference.

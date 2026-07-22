## Overview
A B2B (and prosumer) service for indie authors, small publishers, session musicians, photographers, and literary estates. It answers one question they can't answer today: *Was my work used to train an AI model, and am I owed money because of it?* — then does the filing for them.

## Problem
The $1.5B Anthropic settlement for pirated books just got court approval, and it will not be the last. Claim windows are short, notices are buried in legalese, and eligibility hinges on whether a specific ISBN/track/image appeared in a specific corpus (Books3, LAION-5B, Common Crawl slices). A midlist author with 12 titles has no realistic way to check all of this or to file before the bar date. Money is left on the table by exactly the people who can least afford to.

## How it works
1. User uploads a catalog: ISBNs, ISRCs, image portfolio hashes, or just "import from Open Library / Bandcamp / a CSV."
2. We cross-reference each item against a maintained index of known training corpora and against active/settled litigation classes.
3. For each hit we show: which corpus, which case, estimated payout band, and the claim deadline.
4. One button generates the pre-filled claim (settlement claim form, W-9, proof-of-ownership packet) and, where allowed, submits it via the claims administrator's portal or produces a mail-ready PDF.
5. A watchlist alerts you when a *new* suit is filed or certified that touches your catalog.

## Technical approach
Stack: Postgres + a Python ingest pipeline. Core datasets: a normalized copy of the Books3 / Bibliotik title list, LAION metadata, HathiTrust and Open Library for ISBN↔title↔author resolution, and a hand-curated `litigation` table scraped from PACER dockets + official settlement sites (claim URLs, class definitions, bar dates). Matching is the hard part: fuzzy title/author resolution (normalized edit distance + author disambiguation) against messy corpus filenames, plus perceptual hashing (pHash) for images against LAION. Data model: `works`, `corpus_memberships`, `cases`, `class_rules` (a small predicate DSL: publication-year ranges, format, rightsholder type), `claims` (status machine). Compliance guardrail: we are an information + document-prep tool, not a law firm — every eligibility call links to the primary source and carries a "verify with counsel" disclaimer.

## v1 scope
- Books only, US class actions only
- CSV / Open Library import
- Match against Books3 title list + the one live settlement
- Generate a printable claim packet (no auto-submit)

## Out of scope
- Music/image corpora, international suits, actual legal representation, negotiating settlements.

## Risks & unknowns
- UPL (unauthorized practice of law) exposure — stay strictly document-prep.
- Corpus indices are legally radioactive to host; store hashes/titles, not content.
- Payouts may be tiny; value must come from *aggregation* across a catalog and future suits.

## Done means
An author uploads 10 ISBNs, sees which are in the Books3 list and the Anthropic class, and downloads a correctly pre-filled, mailable claim packet with the right bar date on it.

## Overview
Essential Character is a daily browser puzzle built on the Harmonized Tariff Schedule and ~200,000 public U.S. Customs binding rulings. You're shown a real product description a real importer once submitted, and you must walk the tariff tree to the 10-digit code. Scoring is by how many digits you match before diverging. For puzzle people who liked Wordle-with-a-real-corpus, and — the paying half — for customs brokers and trade-compliance staff studying for the license exam.

## Problem
Tariff classification is a genuinely strange intellectual game: a legal ontology of everything humans ship, decided by doctrines like GRI 3(b), where composite goods are classified by the component that gives them their "essential character." Is a fabric-covered notebook paper or textile? Is a Halloween costume apparel or a festive article? The answers are public, argued in writing, and often absurd — and they're locked in a PDF-shaped government database nobody reads for pleasure. Meanwhile brokers cram for the Customs Broker License Exam (open-book, ~4 hours, historically brutal pass rates) with nothing but past-exam PDFs.

## How it works
Daily puzzle: a redacted goods description ("footwear with outer soles of rubber and uppers of textile, valued over $12/pair, with a foxing band"). You navigate Chapter → Heading → Subheading → statistical suffix, each level showing the real HTS text and its notes. You get partial credit at 2/4/6/8/10 digits and lose points for wrong turns. Then the reveal: CBP's actual ruling number, the code, and a pull-quote of the reasoning.

The mode that makes it a game rather than a quiz is **Duels** — GRI 3(b) cases where two headings genuinely both apply. You see both candidate headings and pick which component confers essential character, then read what CBP decided and why. Streaks, a shareable digit-grid result, and an archive by chapter ("Chapter 95: Toys" is a whole comedy set).

## Technical approach
Data: harvest CROSS (rulings.cbp.gov) via its JSON search endpoint, paging by date range; each record has ruling number, date, goods description, cited headings, and full text. HTS tree from the USITC REST export (`hts.usitc.gov/reststop/exportList?from=01&to=99&format=JSON`) — chapters, headings, indent levels, notes, duty rates. Store in SQLite with FTS5; ship the tree as static JSON (~12MB, gzips well) and the puzzle-of-the-day as a small blob.

The hard part is **answer leakage**: descriptions frequently quote the winning heading verbatim ("a plastic article of heading 3926…"). Pipeline: token-overlap scan of the description against the target heading's own text, redact matched spans, then a difficulty score = 1 − (fraction of players a cheap baseline model gets right). Puzzles whose baseline solve rate exceeds ~80% are demoted to warm-ups. Stack: Next.js + SQLite (Turso or plain file), no accounts in v1 — streaks in localStorage.

## v1 scope
- 300 hand-vetted rulings, one puzzle per day
- Chapter and heading levels only (4 digits), no statistical suffix
- Leakage redaction by regex + heading token overlap, human eyeball on all 300
- Result grid you can paste into a group chat
- No accounts, no payments

## Out of scope
Non-U.S. tariff schedules, duty-rate calculation, an actual classification API for importers, CBLE mock exams (that's v2 and the money).

## Risks & unknowns
CROSS scraping etiquette and rate limits; rulings are public record but be polite and cache. Descriptions are sometimes so technical they're unplayable without domain knowledge — needs aggressive curation. Unclear whether the general-puzzle audience overlaps the broker audience at all; they may need two front doors.

## Done means
A cold player with no trade background can finish a puzzle in under 90 seconds, sees their digit-match score, reads why CBP disagreed with them, and can name one thing about the tariff schedule they didn't know that morning.

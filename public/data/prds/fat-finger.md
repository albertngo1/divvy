## Overview

`fatfinger` is a CLI + Python library that audits an identifier scheme (case numbers, usernames, device serials, patient MRNs, SKUs, evidence tags) for **channel collisions**: pairs of distinct real identifiers that become indistinguishable after passing through one realistic transport. It is aimed at the people who own an ID column and have never once asked what happens when a human reads it over a phone.

## Problem

A man served 18 months because a police system dropped one underscore. Nobody in that chain owned the question "can two different IDs collapse into one?" Existing tooling checks uniqueness *inside* the database, which is the one place IDs are never confused. The failures happen at the boundaries: someone reads it aloud, someone OCRs a faxed form, someone pastes from a PDF and a soft hyphen rides along, someone's MySQL column is `utf8mb4_general_ci`. Every one of those is a lossy channel with a known, enumerable confusion set, and nobody composes them.

## How it works

You feed it a corpus (`--ids ids.txt`) or a generator spec (`--scheme 'CR-\d{4}-[A-Z]{2}_\d+'`). It applies a library of **channel functions**, each mapping a string to a canonical *skeleton*:

- `unicode`: NFKC + Unicode `confusables.txt` skeleton (rn→m, Cyrillic а→a, zero-width strip)
- `ocr`: fold OCR-confusable classes (0/O/D/Q, 1/l/I, 5/S, 8/B), collapse whitespace and separator glyphs (`_`/`-`/space/nothing)
- `speech`: run through phonetic folding (Double Metaphone on alpha runs, digit-word expansion: "oh"/"zero", "fifteen" vs "fifty")
- `collation`: casefold + trailing-space strip + accent strip (mimics `*_ci` collations)
- `keyboard`: single-edit Damerau-Levenshtein restricted to QWERTY-adjacent substitutions

Collisions are found by **bucketing on skeleton hash**, not pairwise comparison: each channel emits `skeleton(id) -> id`, and any bucket with >1 member is a collision class. Multi-hop collisions (OCR *then* collation) come from composing skeletons, which stays linear. Output: a severity-ranked report plus `--fail-on collision` for CI.

## Technical approach

Python 3.12, `regex` for Unicode classes, the CLDR/Unicode `confusablesSummary.txt` and `intentional.txt` data files vendored, `metaphone` for phonetics, `rapidfuzz` for the bounded keyboard channel. Data model: `Collision(channel_path, skeleton, members[], severity)` in SQLite so runs are diffable across time ("3 new collisions since last release"). The genuinely hard part is the keyboard/edit channel — it is the only one without a canonical form, so it needs an actual metric index; use a BK-tree over the corpus with max distance 1, which stays tractable to ~10M IDs. Second hard part: severity. A collision between two IDs that never co-occur in the same context is noise; ingest an optional co-occurrence file (both appear in the same case/tenant/day) to weight it.

## v1 scope

- One command: `fatfinger check ids.txt`
- Three channels only: `unicode`, `ocr`, `collation`
- Plain-text and JSON report, exit code 1 on any collision
- A `--scheme` mode that estimates collision probability by sampling 100k synthetic IDs

## Out of scope

ASR-in-the-loop (running Whisper on TTS of every ID), handwriting models, suggesting a *fixed* scheme, any GUI, PII handling guarantees.

## Risks & unknowns

Confusable data is Unicode's, tuned for security spoofing, not for OCR — the OCR class table will be hand-built and arguable. Severity ranking may drown users in true-but-irrelevant collisions. Corpora are often sensitive, so it must work fully offline and never phone home.

## Done means

Given a 50k-row synthetic court-case-number corpus seeded with 12 known-bad pairs (including one underscore-vs-nothing pair), `fatfinger check` finds all 12, reports fewer than 30 false positives, and completes in under 10 seconds on a laptop.

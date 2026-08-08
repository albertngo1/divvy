## Overview
A local, offline CLI (plus a drag-and-drop GUI wrapper) that reads a document's *internal* claims about its own origin and reports where those claims contradict each other or contradict reality. Aimed at one person who has been handed a file — a landlord's "original" lease, a vendor invoice, a screenshot of a chat — and wants a second opinion before signing or paying.

## Problem
A file's visible date is a text string anyone can type. The real timeline lives in producer strings, font versions, revision IDs, and encoder fingerprints — recoverable with `pikepdf` and `exiftool`, but only if you already know what a 2019 Acrobat build looks like. Nobody does. Existing tools (pdfid, JPEGsnoop, ExifTool) dump raw fields and leave the reasoning to you.

## How it works
`notyet lease.pdf` prints a timeline of every date-bearing claim the file makes about itself, then a ranked list of contradictions with plain-English explanations and byte offsets:

```
CLAIM  /Info CreationDate      2019-03-04
CLAIM  /Producer              "Microsoft: Print To PDF" (Win11 build)
FLAG   [high] Producer string first appears Win11 22H2 (Sep 2022),
       3.5 years after claimed creation.
FLAG   [med]  Embedded font "Aptos-Regular" v1.001 — Aptos shipped 2023-07.
NOTE   File contains 2 incremental revisions; revision 1 recovered to /tmp/rev1.pdf
```

## Technical approach
Python. **PDF**: `pikepdf`/`qpdf` for object-level access — `/Info` CreationDate & ModDate, XMP `xmp:CreateDate` and `xmpMM:History` event stack, `/Producer`, `/Creator`, PDF version vs features used (object streams require 1.5, AES-256 requires 2.0), embedded `FontFile2/3` parsed with `fontTools` for the `name` table version and unique ID. Multiple `%%EOF` markers plus the `startxref` chain let us split incremental updates and **write out each prior revision** — often the single most damning artifact. **OOXML**: unzip `docProps/app.xml` (Application + AppVersion, TotalTime), `core.xml` (created/modified/lastModifiedBy), `word/settings.xml` rsid table — rsid count is a proxy for real editing sessions, so "TotalTime: 2" with 40 rsids is incoherent. **JPEG/PNG**: EXIF via `pyexiftool`, plus quantization-table + Huffman-table + component-order fingerprinting matched against an encoder database to identify the *actual* encoder, then checked against the claimed camera make/model.

The moat is a curated `anachronisms.json`: `{artifact, first_seen_date, source_url, confidence}` for producer strings, app build numbers, font releases, and format features. Rules are declarative; each emits severity, explanation, and evidence offsets.

Hard part: false positives. A genuinely 2019 document re-saved in 2024 is not fraud. The engine must separate *claimed authorship date* from *last-save date* and only escalate when the anachronism attaches to the earliest claim, or when the file asserts it has never been modified.

## v1 scope
- PDF only.
- Six rules: producer-vs-date, font-release-vs-date, PDF-version-vs-features, ModDate < CreateDate, XMP history gaps, incremental-revision recovery.
- Table output to stdout; corpus seeded with ~40 producer strings.

## Out of scope
C2PA/content credentials, chain-of-custody or court-admissible reporting, OCR, deepfake detection, any network lookup.

## Risks & unknowns
Corpus rot — release dates need maintenance. Misuse as a "proof of fraud" oracle when it only produces suspicion. Some producers (Ghostscript rebuilds) have unstable version strings.

## Done means
On a corpus of 20 real documents and 10 deliberately backdated ones (edited `/Info` dates, re-saved in a newer app), it flags ≥8 of the 10 fakes at `high` and produces zero `high` flags on the 20 genuine files.

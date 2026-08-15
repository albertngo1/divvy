## Overview

A per-title remediation service for EPUB publishers facing the European Accessibility Act. You upload an EPUB; you get back (a) a fixed EPUB, (b) a plain-English conformance report mapped to EPUB Accessibility 1.1 / WCAG 2.2 AA, and (c) a paste-ready ONIX 3.0 metadata block carrying the accessibility codes distributors now demand. Aimed at independent and academic presses with 200–5,000 backlist titles, one part-time production person, and no accessibility staff.

## Problem

The EAA makes inaccessible ebooks unsellable in the EU, and retailers enforce it upstream through metadata: no ONIX accessibility codes, no listing. Big Five publishers hired teams. Everyone else has a directory of EPUBs produced by a 2014 InDesign export — images with no alt text, headings faked with bold spans, no declared language, no page-list mapping to the print edition — and a distributor portal rejecting records with an error message that means nothing to them. Consultants charge $150–400 per title to fix this by hand. The tedious 80% is mechanical.

## How it works

1. Publisher drops EPUBs into a watched folder (S3/Dropbox) or uploads a ZIP of the backlist.
2. Each title is audited, auto-remediated where the fix is deterministic, and queued for human review where it isn't (alt text, complex tables, reading order in fixed-layout titles).
3. A reviewer works a compact diff UI: image on the left, proposed alt text on the right, approve/edit/skip. A 300-page trade title with 12 images takes ~6 minutes.
4. Output: remediated EPUB, an HTML/PDF report, the ONIX fragment, and the customer-facing Accessibility Statement text the EAA requires.
5. Pricing: ~$29/title self-serve, ~$79/title with human review, backlist bulk rates. Revenue is real because the alternative is losing the EU channel.

## Technical approach

Node + TypeScript worker behind a small Next.js app; Postgres for job/title state; S3 for artifacts. Audit layer wraps two mature open-source tools rather than reinventing them: **DAISY Ace** (`@daisy/ace-core`, JSON report with WCAG rule IDs) and **EPUBCheck** for structural validity. Remediation operates on the unzipped OCF container: parse OPF and XHTML with `xmldom` + `xpath` (never regex — round-tripping must preserve the package doc byte-for-byte where untouched), then apply typed patches.

Deterministic patches worth automating: `xml:lang`/`lang` on `<html>`, `<dc:language>`, `epub:type` landmarks, `role` attributes on nav, `<title>` per content doc, table `<th scope>` inference from a header-row heuristic, heading-level repair when a doc's first heading is `h3` (shift the whole tree, don't rewrite individual tags), and `schema:accessMode` / `accessibilityFeature` / `accessibilitySummary` metadata in the OPF.

Alt text: extract each `<img>`, pull 400 chars of surrounding text as context, and send image + context to a vision model with a house prompt (functional description, no "image of", ≤125 chars, decorative images get `alt=""` + `role="presentation"`). Every generated string lands in the review queue — never shipped unreviewed.

ONIX emission: `<ProductFormFeature>` blocks with `ProductFormFeatureType` 09 and List 196 values derived mechanically from the post-fix Ace report (e.g. 04 epub-a11y-11, 85 WCAG level AA, 52 all textual content can be modified, 00 accessibility summary), plus Type 10 for the certifier. The mapping table from Ace rule outcomes → List 196 codes *is* the product's core IP.

Hard part: not breaking books. Every patch runs a before/after EPUBCheck and a rendered-text diff (extract text nodes in spine order, assert equality) — any change to visible text content fails the job closed.

## v1 scope

- CLI on a folder of reflowable EPUB 3 files
- Ace + EPUBCheck run, JSON merged into one report
- Four deterministic patches: language, doc titles, nav landmarks, OPF a11y metadata
- ONIX fragment printed to stdout
- No web app, no billing, no alt text

## Out of scope

- Fixed-layout and comics/manga (reading order is genuinely hard)
- EPUB 2 → 3 conversion
- PDF, audiobooks, MathML remediation
- Distributor API integration (Ingram, Firebrand) — email the file for now

## Risks & unknowns

Liability: certifying a title as conformant carries real weight; v1 sells "conformance report," not "certification," and names the human reviewer. Bad alt text is worse than none for the reader and must never auto-ship. Publishers with EPUBs generated from a source-of-truth (XML, InDesign) will re-export and lose the fixes — offer a patch manifest they can replay. Commercially: the market is real but concentrated in distributors, so the fastest path may be white-labeling under one distributor rather than selling press by press.

## Done means

Run the CLI on 20 real backlist EPUBs: every output passes EPUBCheck, Ace's error count drops by ≥60%, the rendered-text diff is empty for all 20, and the emitted ONIX fragment validates against the ONIX 3.0 schema and is accepted by a distributor's test ingest.

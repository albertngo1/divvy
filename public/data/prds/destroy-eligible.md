## Overview
A service (thin SaaS + a real human review loop) for hospitals, law firms, credit unions, universities, and municipalities that pay a records vendor monthly to store paper boxes offsite. It ingests the vendor's inventory export and the organization's retention schedule, and produces a ranked destruction queue with the dollar figure attached to each line.

## Problem
Offsite storage is billed per box per month, forever, and the box descriptions were typed by someone who left in 2009. Records managers know a large fraction of the inventory is past retention but can't defend a destruction decision without going box by box — so the safe move is to keep paying. Storage spend compounds for decades on records that carry only liability. The vendor has no incentive to fix this, and the org's own catalog is a spreadsheet nobody trusts.

## How it works
Upload the inventory CSV (barcode, description, department, date range, from/to dates, any destroy-eligible date) plus the applicable retention schedule. The system classifies each box description into a record series, applies the governing retention rule to the box's end date, subtracts anything under legal hold, and emits three lists: **Destroy Eligible** (past retention, no hold), **Needs a Human** (low-confidence classification), and **Keep Paying** (with the rule and the years remaining shown, so it's defensible). Every line carries its annual carrying cost. Crucially the report also does the math the vendor doesn't advertise: most contracts charge a per-box permanent-withdrawal fee, so destroying 6,000 boxes costs money up front — the tool computes payback in months and sorts the queue by that, not by box count. Output is a sign-off packet: a destruction manifest, the rule citation per series, a legal-hold attestation page, and a sampling plan (pull 20 random boxes, verify contents match the description before anything is shredded).

## Technical approach
Python + Postgres + a small Next.js review UI. Classification is a two-stage pipeline: deterministic regex/keyword rules over normalized description strings first (they cover the bulk — "AP INVOICES 2011", "EOB", "PT CHARTS A-M"), then embeddings (a sentence-transformer over the description plus department) with nearest-neighbor match against a labeled series library, and only the residual goes to an LLM extraction step with mandatory human confirmation. Rule corpus is built from public sources: NARA GRS, state records-retention schedules (e.g. TSLAC), HIPAA 45 CFR 164.316(b)(2), SEC 17a-4, FLSA and IRS minimums, encoded as `{series, jurisdiction, trigger_event, years, citation}`. Data model: `box → classification(confidence, series) → rule → eligibility(date, blocked_by)`, with every eligibility decision immutable and versioned so a later audit reproduces exactly what was known when. The genuinely hard part isn't code — it's that destruction is irreversible and the buyer is risk-averse, so the product must be biased toward "keep" and must never auto-act: it produces evidence, a human signs.

## v1 scope
- One vertical (healthcare) and one vendor's export format
- 40 hand-built record series covering ~80% of typical boxes
- Rules engine + confidence-scored review queue
- One PDF output: destruction manifest with citations and dollar totals

## Out of scope
Actually scheduling destruction with the vendor, digitization, legal-hold system integration, multi-jurisdiction conflict resolution.

## Risks & unknowns
Selling into a role that fears being blamed; whether a first customer will share inventory data before paying; whether description quality is too poor to classify at all in some shops; liability positioning must be advisory, not legal advice.

## Done means
One real 20,000-box inventory processed end to end, producing a signed-off destruction list whose annualized savings exceed the fee by 5x, with a documented rule citation on every line.

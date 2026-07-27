## Overview

A small SaaS for general contractors, property managers, and franchisors — anyone who is a *certificate holder* on other people's insurance policies and is legally exposed when that coverage is wrong. It compiles the insurance exhibit of a contract into a typed, machine-checkable spec, then diffs every incoming certificate of insurance against it and produces a red-line.

## Problem

The subcontract says: $2M general aggregate, $5M umbrella, additional insured on a primary and non-contributory basis, waiver of subrogation, CG 20 10 04 13 + CG 20 37 04 13 endorsements attached, carrier rated A- VII or better. What actually arrives is a scanned ACORD 25 PDF emailed by the sub's broker, which an ops coordinator eyeballs for thirty seconds and files. A meaningful share of them are non-compliant — wrong endorsement form edition, expired umbrella, non-admitted carrier, the GC not actually named. Nobody discovers this until a claim, at which point the GC's own policy eats it.

## How it works

1. Upload the contract PDF. An extraction pass pulls the insurance exhibit into a typed spec: a list of predicates (`coverage.umbrella.each_occurrence >= 5_000_000`, `endorsement.form_number in {CG2010 0413}`, `carrier.am_best >= A-`). You confirm/edit it in a side-by-side diff UI against the source text — the spec is the product, so a human signs off once per contract template.
2. Each project gets an email intake address. Brokers send COIs there; the parser structures them and runs the predicate list.
3. Output: a one-page red-line — green checks, red failures each citing the exhibit clause and the COI field, plus a pre-written reply to the broker naming exactly what to reissue.
4. A "who's on site today" view crosses the sub roster with expiry dates, so lapsed coverage shows up as a body on a jobsite, not a row in a spreadsheet.

## Technical approach

Next.js + Postgres + a worker queue. ACORD 25 is a fixed form, so parsing is template-anchored: pdfplumber for the text layer when present, Tesseract with per-region crops keyed off the form's static labels otherwise; an LLM pass only for the free-text "Description of Operations" box where additional-insured language actually lives. Carrier verification hits NAIC company search and the state DOI producer lookup for admitted status; AM Best rating from a maintained lookup table. Expirations publish as an ICS feed. Inbound mail via a Postmark webhook.

The genuinely hard part is endorsements. The COI itself is not evidence — the endorsement forms are, and brokers attach them as separate scans. You need form-number detection (`CG 20 10 04 13` in a header band), edition-date comparison, and matching the endorsement's schedule of named entities back to the certificate holder's legal name, which is spelled three different ways across the file.

## v1 scope

- One contract, one hand-written spec, eight predicates.
- Email intake → parsed COI row in Postgres.
- Red-line PDF out.
- Expiry list, sorted.

## Out of scope

COI issuance, e-signature, mobile app, multi-tenant billing, W-9/lien-waiver collection, anything resembling legal advice.

## Risks & unknowns

Liability framing — this is triage, never a compliance opinion, and the UI must say so. Incumbents exist (TrustLayer, myCOI, Jones) and sell to enterprise; the wedge is the spec-compiler and a price point a 30-person GC will pay. Brokers hate portals, hence email-first.

## Done means

Run 20 real COIs from a live project against one real insurance exhibit. The tool flags the same defects the risk manager flags, misses none of them, and raises at most one false positive.

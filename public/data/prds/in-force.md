## Overview
In Force is a SaaS for property managers, general contractors, and franchise operators who must collect and verify Certificates of Insurance (COIs) from every vendor and subcontractor. It ingests ACORD 25 PDFs, extracts coverage limits and expiry, checks them against your requirements, and auto-chases anyone expiring or short.

## Problem
Before a subcontractor sets foot on site or a vendor gets paid, you need proof they carry insurance — general liability, workers' comp, auto — at or above your required limits, often naming you as additional insured. Today this lives in an inbox: PDFs emailed in, a spreadsheet of expiry dates someone forgets to update, and a manual squint at each certificate to confirm the general-liability limit is actually $1M/$2M and not $500k. When a vendor's policy lapses mid-project and something goes wrong, the liability lands on you. Chasing renewals is pure unpaid administrative drudgery.

## How it works
You define requirement templates ("GL $1M each occurrence / $2M aggregate, WC statutory, Auto $1M, additional insured required"). Vendors email or upload their COI; In Force OCRs the ACORD 25 form, extracts each coverage line's limits, effective/expiry dates, and insurer, and grades the certificate green (meets all requirements), amber (expiring within 30 days), or red (under-limit, expired, or missing a required line). A dashboard shows every vendor's status; the system auto-emails vendors (and their brokers) ahead of expiry and re-verifies the replacement certificate when it arrives.

## Technical approach
Stack: Next.js + Postgres + a Python extraction worker. ACORD 25 is a standardized form, so extraction combines positional templating with a vision-LLM fallback for scanned/photographed copies. Data model: `org`, `requirement_template`, `vendor`, `certificate(vendor_id, coverage_lines[], effective_at, expires_at, additional_insured bool, file_ref)`, `check(certificate_id, rule, pass/fail)`. A nightly job recomputes status and queues chase emails via a templated sequence; an inbound email address per org lets vendors just reply-attach. The hard part is trustworthy limit extraction — a $1,000,000 vs $100,000 misread is a real liability — so every red/amber grade shows the extracted numbers next to the source region for one-click human confirmation before it gates a payment or site entry.

## v1 scope
- Requirement templates per org
- Upload/email-in COI PDFs, extract limits + dates with human-confirm
- Green/amber/red dashboard
- Automated expiry-chase emails to vendors

## Out of scope
- Direct carrier/broker API verification of authenticity
- Fraudulent-certificate detection
- Payment or e-sign integrations

## Risks & unknowns
- Extraction errors carry liability → mandatory human confirm on gating decisions
- Incumbents exist (myCOI, Jones) but priced for enterprise; wedge is the affordable tier for mid-size GCs/property managers
- Fake COIs are a known problem we can flag but not fully solve in v1

## Done means
A manager uploads 15 vendor COIs, the dashboard correctly flags the two that are expired and the one carrying only $500k GL against a $1M requirement, and an expiry-chase email goes out to a vendor 30 days before their policy lapses.

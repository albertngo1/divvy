## Overview
A weekly alerting service for the ~19,000 independent retail pharmacies in the US. Every Wednesday, CMS republishes NADAC — the National Average Drug Acquisition Cost, an NDC-level survey of what pharmacies actually pay per unit. Underwater Fill joins that free file against a store's own recent claim reimbursements and emails a ranked list: *these 14 NDCs you dispense are now underwater; here are the therapeutically equivalent NDCs that still clear margin.*

## Problem
Generic acquisition costs move week to week; PBM MAC reimbursement lags by weeks or never adjusts. The pharmacist discovers the loss at month-end reconciliation, after dispensing 60 fills at −$22 each. Chains have analysts and GPO dashboards for this. Independents have a fax machine and a wholesaler rep whose incentives are not theirs. The data to prevent it is public, free, and nobody serves it to them in the form they need: a decision at the counter.

## How it works
1. Onboarding: the pharmacist exports 90 days of dispensing history from their PMS (PioneerRx, Liberty, Rx30, QS/1 all have a scheduled CSV report) and drops it in a web upload or an autoloaded SFTP dir. Columns needed: NDC, quantity dispensed, total paid, date.
2. We compute realized per-unit reimbursement per NDC per payer and per-unit cost from NADAC, giving a margin surface.
3. Each Wednesday when the new NADAC file lands, we diff it. Any NDC where new NADAC × typical quantity > recent reimbursement is flagged underwater. Any NDC with a >15% week-over-week NADAC jump is flagged as *about to be* underwater.
4. For each flag we resolve substitutes: NDC → RxCUI via RxNorm, sibling NDCs with the same RxCUI, filtered to Orange Book TE code A-rated, ranked by NADAC. Output: "switch from labeler X to labeler Y, saves $18.40/fill, A-rated, in stock at Cardinal."
5. Email + a one-page printable shelf sheet.

## Technical approach
- Data: `data.medicaid.gov` NADAC dataset API (weekly CSV, ~28k rows, NDC + per-unit cost + effective date); openFDA `/drug/ndc.json` for labeler/package/strength; RxNav REST (`/rxcui/{id}/ndcs`, `/ndcstatus`) for the equivalence graph; FDA Orange Book data files for TE codes.
- Stack: Postgres (tables: `nadac_week`, `ndc`, `rxcui_edge`, `store_claim`, `flag`), a Python weekly ingest job, Django admin for ops, Postmark for delivery. Boring on purpose.
- Hard part is not the join, it's the semantics: NADAC is a *national average*, not the store's invoice, so margin estimates carry error; MAC lists are contractual secrets, so we infer reimbursement empirically from the store's own paid claims rather than modeling PBM behavior. Substitution also has legal edges — DAW codes, state substitution statutes, narrow-therapeutic-index drugs — so A-rated is a hard gate and NTI drugs are suppressed.

## v1 scope
- One store, manual CSV upload, one payer bucket (all payers pooled).
- Underwater list + NADAC-spike list, no substitution engine.
- Email is literally a Jinja template.
- Pricing conversation with 5 pharmacists before writing code.

## Out of scope
Real-time pre-adjudication at point of sale; wholesaler invoice ingestion; DIR fee modeling; 340B; multi-store rollups.

## Risks & unknowns
NADAC-vs-invoice drift may make flags noisy enough to be ignored. PMS export formats vary per vendor and version. Some PBM contracts have gag-ish clauses about claim data sharing — needs a lawyer read. Willingness to pay may be $99/mo, not $299.

## Done means
A real pharmacist uploads their own export, gets a Wednesday email, changes what they stock for at least one NDC, and can tell you the dollar figure it saved them that month.

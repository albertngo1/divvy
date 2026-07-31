## Overview
Break Seal is a small, opinionated SaaS for testing labs (environmental, food safety, cannabis, calibration) that tracks certified reference materials (CRMs/SRMs) at the level of the individual sealed unit: what was bought, which lot, when the seal was broken, when it expires, every measurement made against it, and which of your calibrations depend on it. It exports a metrological traceability packet on demand. Buyers are QA managers at 5–50 person labs paying $149–$599/mo.

## Problem
ISO/IEC 17025 requires demonstrable metrological traceability: every reported result must chain back to a valid, in-date certified reference material with documented uncertainty. In practice that chain lives in a shared drive of vendor PDFs, a whiteboard, and one person's memory. Labs discover expired standards *during* the audit, or worse, after six months of results. Meanwhile these materials are extraordinarily expensive per milliliter, get over-ordered out of fear, and their stability clock starts the moment the ampoule is opened — a fact nobody records. LIMS platforms treat CRMs as inventory SKUs, not as measurement instruments with uncertainty budgets.

## How it works
1. **Ingest the certificate.** Drop in a vendor CoA PDF (NIST SRM, LGC, Sigma, Restek). Extraction pulls SRM/lot number, matrix, each certified analyte with its certified value, expanded uncertainty *U*, coverage factor *k*, storage conditions, expiry, and post-opening stability window.
2. **Register units.** One certificate → N physical ampoules/vials with barcodes. Scanning a barcode at the bench records `opened_at`, which starts the *shorter* post-opening clock — the thing labs actually forget.
3. **Use it.** Every time an analyst measures the CRM (verification, calibration check, QC), the observed value is logged against `(instrument, analyte, lot)`.
4. **Watch it drift.** Each triple gets a control chart whose limits combine the certificate's *U* with the lab's own observed repeatability *s_r*. Westgard-style rules fire alerts: 1-3s, 2-2s, 4-1s, 10-in-a-row trend. This converts a compliance chore into an instrument-health early-warning system — the actual reason people keep logging in.
5. **Survive the audit.** One click renders a traceability packet: result → method → calibration → CRM unit → lot → certificate PDF → issuing NMI, with every uncertainty at each hop.
6. **Reorder sanely.** Consumption rate per lot → projected exhaustion date and a purchasing calendar, so nobody panic-buys a $2,000 set in December.

## Technical approach
Django + Postgres + HTMX; boring on purpose because labs are on locked-down Windows. Data model: `Material(vendor, sku, matrix)` → `Lot(certificate_pdf, expiry)` → `CertifiedValue(analyte, value, U, k, unit)` → `Unit(barcode, received, opened_at, effective_expiry)` → `Measurement(unit, instrument, analyst, ts, observed)`. Barcodes are Code128 printed to a Brother QL. Extraction is a vision-LLM pass over each PDF page into a strict JSON schema, landing in a **human confirmation queue** — the operator sees the extracted table beside the page image and approves — with a per-vendor layout cache so the second CoA from the same vendor is near-instant. Control limits use the standard combination `U_combined = sqrt(U_cert² + (k·s_r)²)`.

The hard part is not software: it's that vendor CoA layouts are wildly heterogeneous (multi-page tables, footnoted informational vs certified values, analytes reported in three unit systems), and getting a *certified vs informational* value wrong is a compliance defect, not a bug. Hence: never auto-accept, always confirm, always keep the source page image linked.

## v1 scope
- Single lab, single user, no SSO
- Upload CoA → confirm extracted analytes → register units
- Expiry + post-opening email alerts at 90/30/7 days
- One control chart per (instrument, analyte, lot), 1-3s rule only
- CSV export (audit packet PDF comes later)

## Out of scope
Full LIMS/sample tracking, instrument integrations, e-signature/21 CFR Part 11, multi-site, resale or aliquot marketplace (chain-of-custody makes that a legal minefield).

## Risks & unknowns
Selling into small labs is slow and relationship-driven; the wedge may need to be a free public CRM-expiry database to get in the door. Incumbent LIMS vendors bundle a weak version of this for free. Extraction accuracy is the product's credibility — one wrong certified value and the QA manager never trusts it again.

## Done means
Ten real CoA PDFs from three different vendors ingest with ≥90% of certified values and uncertainties correct after the confirm step; an expiry alert email fires on schedule; and a QA manager can, from a logged result, click through to the issuing certificate in under five seconds.

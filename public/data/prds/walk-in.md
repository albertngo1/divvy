## Overview
Walk-In is a small B2B service for independent restaurants, single-store grocers, school-district kitchens, and small food distributors: it watches the federal recall firehose and joins it against *their own purchase history*, producing a per-location "pull list" instead of a national press release.

## Problem
When a Class I recall drops, the notice is prose: brand names, UPCs, plant codes, and free-text lot ranges like "lot codes beginning TFS-2026-1 through TFS-2026-9, Best By 6/28/26–7/06/26." A three-location restaurant group has a shoebox of Sysco/US Foods/PFG invoices and no way to know if they bought any of it. Enterprise chains have traceability software; everyone below them does the check manually, which means they don't. Health inspectors ask for a pull log; nobody has one. The arbitrage: openFDA and FSIS publish all of this for free, structured-ish, and this niche cannot consume it.

## How it works
Onboard by forwarding invoice PDFs to a dedicated address, or uploading the weekly CSV export every distributor ordering portal offers. Nightly the ingester pulls new enforcement reports and press releases, normalizes them into predicates, and matches against purchase lines inside the recall's delivery window. A hit sends one SMS/email: "PULL — 2 cases Chopped Romaine 4/5lb, lot TFS-2026-4, delivered Jun 12 to Location B. Class I, cyclospora." One tap records disposition (destroyed / returned / credit requested) with a photo, and the account accumulates a signed one-page pull log PDF for the inspector.

## Technical approach
Python/FastAPI + Postgres. Feeds: `api.fda.gov/food/enforcement.json`, FSIS `/fsis/api/recall/v/1`, plus the FDA recall press-release RSS (enforcement reports lag announcements by days — the RSS is the fast path). Invoice ingest: mailparser → pdfplumber text extraction + per-distributor CSV templates. Matching cascade: (1) GTIN/UPC exact after check-digit normalization; (2) brand + description fuzzy match via rapidfuzz token-set ratio over descriptions with pack-size and UOM stripped; (3) lot predicate evaluation; (4) delivery-date gate. Model: `distributors, locations, purchase_lines, recall_events, recall_predicates, matches, dispositions`. Postgres LISTEN/NOTIFY drives alert fanout.

The genuinely hard part is (3): converting lot-code prose into a machine-checkable predicate. Regex families cover the common shapes; everything else goes to a Claude structured-output extractor emitting a small predicate JSON (prefix / numeric range / date range / plant code), with low-confidence extractions queued for human review before any alert fires. False positives are more expensive than false negatives here — one bogus "pull everything" and the customer stops reading.

## v1 scope
- One distributor CSV format, produce category only
- FDA enforcement feed + recall RSS; no FSIS yet
- Email alerts, magic-link auth, no mobile app
- Predicate extraction with mandatory human review on every match
- Three pilot restaurants, hand-onboarded

## Out of scope
EDI 810/856 integration, POS/inventory depletion modeling, allergen labeling advice, full HACCP compliance, supplier scorecards.

## Risks & unknowns
Distributors may restrict portal exports. Willingness to pay is unproven — this may read as insurance, which people underbuy. Precision on fuzzy description matching against generic produce descriptors. Legal positioning: advisory tool, explicitly not a compliance guarantee.

## Done means
Replaying the July 2026 Taylor Farms cyclospora recall against a pilot's real invoice history, the system flags the correct purchase lines within 15 minutes of the feed update, produces zero false alerts that week, and emits a one-page pull log the pilot's health inspector accepts.

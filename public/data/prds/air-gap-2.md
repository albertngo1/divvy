## Overview
Air Gap is a mobile-first tool for certified backflow-prevention testers — the plumbers who annually test the assemblies that keep lawn irrigation, boiler feeds, and fire lines from siphoning contamination back into the public water main. It turns a clipboard-and-carbon-copy ritual into three taps.

## Problem
Every commercial water connection with a backflow assembly must be tested yearly, and the test report must be filed with the *water purveyor* (the local utility) within a short window. There are thousands of purveyors in the US, each with its own paper form, PDF, or web portal, each wanting slightly different fields. A tester runs 10–20 assemblies a day, scribbling differential-pressure readings onto multi-part forms, then spends evenings hand-transcribing and mailing/faxing to dozens of districts. Miss a deadline and the customer's water gets shut off. It's pure clerical friction on top of skilled field work.

## How it works
1. Tester scans the assembly tag (QR or photo-OCR of the serial/model plate) — Air Gap looks up the assembly, its address, and the governing purveyor.
2. During the test, the app captures the four standard readings (initial/final gauge PSID, check valve tightness, relief-valve open point) with big field-glove buttons and pass/fail logic.
3. On save, it renders the **purveyor-specific** report from a template pack and either e-submits via the district's portal/email or generates a print-ready PDF.
4. A dashboard tracks which assemblies are coming due, clustered into efficient route lists.

## Technical approach
Stack: React Native (Expo) client, Postgres + a small FastAPI backend. The core asset is a versioned JSON **purveyor pack**: `{purveyor_id, form_layout, submit_method: email|portal|pdf, field_map}`. Report rendering uses a headless HTML→PDF (Playwright/`weasyprint`) driven by field_map so a new district is a data edit, not code. Tag decode reuses on-device OCR (Vision/MLKit) plus a per-manufacturer serial-scheme table. Hardest part: the long tail of submission methods — some purveyors take email PDFs, some have crude web portals, some only fax. v1 covers email + PDF and punts portals to a manual "copy these fields" assist screen.

## v1 scope
- One metro area's ~15 purveyors hand-encoded as packs
- Manual assembly entry + photo OCR of the tag
- Test-reading capture with pass/fail math
- PDF + email submission
- "Due soon" list

## Out of scope
- Auto-portal robots for every district
- Billing/invoicing, CRM
- Multi-tester company accounts / dispatch

## Risks & unknowns
Incumbents (SwiftComply, Tokay) already sell this to utilities top-down; indie angle is bottom-up for solo testers. Purveyor form drift means packs rot. Legal weight of e-submission varies by jurisdiction.

## Done means
A tester in the pilot metro completes a real test on their phone and the correct district receives a valid, accepted report PDF with zero paper — measured by the utility acknowledging the filing.

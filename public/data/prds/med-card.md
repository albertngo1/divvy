## Overview
Med Card is a small SaaS for safety managers at 5–75-truck motor carriers who must keep a compliant Driver Qualification File (DQF) for every driver. It turns a pile of expiring documents into a single dashboard with a due-date timeline and an auto-assembled, audit-ready file per driver.

## Problem
FMCSA 49 CFR §391 requires each driver to have a DQF containing an application, MVR at hire + an annual review, a road-test certificate, a valid CDL, and — the killer — a DOT medical examiner's certificate that expires on its own clock (often 2 years, sometimes 3 months). Small carriers track this in Excel or a wall calendar. A driver whose med card lapsed yesterday is now an out-of-service violation; a New-Entrant Safety Audit or compliance review that finds gaps means fines and a conditional rating. The Drug & Alcohol Clearinghouse adds an annual query requirement with its own deadline. Nobody has time to babysit dozens of independent expiry clocks.

## How it works
You add each driver and upload their documents (photograph the med card with your phone). Med Card OCRs the medical examiner's certificate to pull the expiry date, extracts CDL class/expiry, and stamps each MVR with its review date. The app then computes every recurring deadline — med card renewal, annual MVR review, annual Clearinghouse query, CDL expiry — and renders a rolling timeline plus tiered email/SMS alerts (60/30/7/0 days). One button exports a driver's complete DQF as an indexed PDF that mirrors the FMCSA audit checklist, so at audit you hand over a clean file instead of scrambling.

## Technical approach
Stack: Next.js + Postgres + a small Python OCR worker (Tesseract fallback + a hosted vision model for the med-card form, since the ME certificate is a semi-standardized layout). Data model: `carrier`, `driver`, `document(type, issued_at, expires_at, file_ref)`, `requirement(driver_id, kind, due_at, status)` where a nightly job recomputes `requirement` rows from documents + rule config. Alerting via a cron that queries `requirement` due-windows. The genuinely hard part is reliable date extraction from photographed med cards (glare, handwriting) — mitigate with human-in-the-loop confirmation on every OCR'd date before it drives an alert. Clearinghouse queries themselves stay manual (no public API); we track the deadline and log the receipt.

## v1 scope
- Add drivers, upload/scan documents
- OCR med-card expiry with mandatory human confirm
- Deadline timeline + email alerts for med card, MVR review, CDL, Clearinghouse
- One-click indexed DQF PDF export

## Out of scope
- Actual MVR pulling or Clearinghouse API integration
- ELD / hours-of-service data
- Payroll, dispatch, IFTA

## Risks & unknowns
- OCR accuracy on bad photos → human confirm mitigates but adds friction
- Carriers may already use TMS suites (Samsara, Motive) that bundle this; wedge is the sub-$50/mo standalone for carriers too small for those
- Liability if an alert is missed — position as reminder tool, not compliance guarantor

## Done means
A carrier can add 20 drivers, scan their med cards, and receive a correct 30-day-out email for the next expiring card, then export that driver's DQF PDF matching the §391 checklist.

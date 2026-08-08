## Overview
A phone-first tool for receiving docks at small and mid-size shippers, distributors, and 3PLs. At the moment of delivery it scans the PRO number, tells the clerk the specific exception language that this carrier's claims department cannot deny, and then — if damage is found — assembles and files the cargo claim packet automatically. Sold per dock location, not per user.

## Problem
Under the Carmack Amendment a carrier is liable for freight damage, but a *clean delivery receipt* — signed, no notations — is close to a full defense. Small shippers lose five and six-figure sums a year to this, and the loss is entirely front-loaded into a 90-second interaction with a driver who wants to leave. The back half is worse: claims are filed by email with hand-scanned BOLs, carriers have a 30-day acknowledgment and 120-day disposition obligation nobody tracks, the 9-month filing statute is missed constantly, and nobody at a 40-person company owns the process. Why now: freight-market softness has carriers denying more aggressively, and vision models are finally good enough to read a photographed, coffee-stained delivery receipt.

## How it works
1. Clerk opens the app, scans the barcode or types the PRO/BOL number.
2. App pulls the shipment (from carrier API where available, or the customer's TMS/email parse) and shows a one-screen **Exception Coach**: piece count to verify, and pre-written notation text — "3 cartons crushed, product condition unknown, subject to inspection" — sized to fit the receipt line. Carrier-specific, because denial patterns differ by carrier.
3. Clerk photographs the freight and the signed receipt. Photos are hashed, geotagged, timestamped.
4. If damage: the app builds the claim packet (standard claim form, BOL, POD with notation, invoice, photos, repair/salvage evidence), files by carrier portal or email, and starts a docket with the 30/120-day carrier clocks and the 9-month statute.
5. Dashboard: recovery rate by carrier, denial reasons ranked, dollars lost to clean receipts — the number that renews the contract.

## Technical approach
- Mobile: React Native (offline-first — docks have terrible signal). Local SQLite queue, sync on reconnect; photos uploaded to S3 with content-addressed keys.
- Backend: Postgres + a small Python/FastAPI service. Core tables: `shipment`, `delivery_event`, `evidence` (immutable, hash-chained), `claim`, `claim_event`, `carrier_rule`.
- Document extraction: a VLM (Claude with vision) reads photographed BOLs and delivery receipts into structured fields — PRO, piece count, notation text present/absent, signature block — with a human review queue for anything under a confidence bar. Handwriting on a carbon-copy receipt is the hard OCR problem, and the answer is that the app already knows the expected fields, so it verifies rather than transcribes.
- Carrier rule engine: per-SCAC YAML — filing address/portal, required forms, notation phrasing that survives review, historic denial reasons. This is the real moat and it is built by hand, one carrier at a time, from customer claim history.
- Deadline engine: date arithmetic + a notification worker. Boring, and the single most valuable component.

## Business model
$249/month per dock location up to 50 claims/yr, plus 10% of recovered dollars on claims the service files. Wedge customer: a 3PL or distributor doing $5–30M in freight, where one person handles claims among six other jobs.

## v1 scope
- One carrier's rules (pick the customer's worst denier)
- Scan PRO → show notation coach → photo capture → PDF packet emailed to the carrier
- Deadline reminders by email only
- Claims tracked in a table; no dashboard, no analytics

## Out of scope
TMS integrations, EDI 210/214, freight audit, insurance/cargo underwriting, international/air.

## Risks & unknowns
Behavior change at the dock is the whole risk — if the clerk skips the app when the driver is impatient, nothing works, so time-to-notation must be under 20 seconds. Carrier portals change and may not tolerate automation. Recovery-share pricing invites disputes about attribution; may need to be flat-fee-only.

## Done means
One pilot dock runs it for 60 days: every delivery has a photographed receipt in the system, at least one claim is filed end-to-end from the app, and the customer can name the dollar figure they used to lose to clean receipts.

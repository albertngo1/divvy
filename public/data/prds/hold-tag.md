## Overview
Hold Tag is a subscription service for independent restaurants, small grocers, school-district kitchens, and food trucks that continuously matches live FDA/USDA recall notices against the products those operators actually bought. It ingests distributor invoices, flags affected line items with lot-level specificity, prints a quarantine tag, logs the event for audit, and drafts the credit-request email to the distributor. Free tier alerts; paid tier does the credit recovery and keeps the compliance log.

## Problem
Recall data is public and completely useless operationally. A recall notice says "Brand X chopped romaine, lots 4821–4833, sold in AZ/CA/NV" — it does not say "you, specifically, took delivery of two cases on Tuesday." Big chains pay ReposiTrak or FoodLogiQ five figures a year to close that gap. Everyone below that tier finds out from a customer, a news alert, or never — and eats the loss, because unclaimed distributor credits are just quietly kept. Recalls also get delayed by suppliers lobbying, so operator-side detection is the only reliable clock.

## How it works
1. Onboard: operator sets a forwarding rule so distributor invoice emails/PDFs go to `<slug>@in.holdtag.app`.
2. Parse each invoice into line items: distributor item number (e.g. Sysco SUPC), brand, description, pack size, quantity, delivery date, and any printed lot code.
3. Poll recall feeds every 15 minutes. For each new recall, fuzzy-match against the last 90 days of purchased line items.
4. Match hit → SMS + email: "HOLD: 2 cases, Brand X romaine, delivered Tue 7/21 on invoice 88213." One tap prints a PDF hold tag with a QR code linking to the recall notice.
5. Operator confirms disposal quantity; Hold Tag generates the credit-request email to the distributor rep and a timestamped record for the health inspector.

## Technical approach
Stack: Postgres + a small Python service. Recall sources: openFDA enforcement API (`api.fda.gov/food/enforcement.json`), USDA FSIS recall API, and FDA's outbreak/advisory pages scraped as a fallback for the pre-classification window (advisories often precede the formal enforcement report by days — that lag *is* the product).

Invoice parsing: distributor PDFs are semi-structured; use `pdfplumber` for text-layer extraction with per-distributor table templates for the big four (Sysco, US Foods, PFG, Gordon), falling back to an LLM extraction pass into a strict JSON schema for unknown formats. Matching is the hard part: recalls publish brand + product description + UPC + lot codes + establishment number, while invoices carry distributor SKUs and abbreviated descriptions ("ROMAINE CHOP 4/5LB"). Pipeline: exact UPC/EST match → brand-alias table → embedding cosine similarity on normalized descriptions with a learned threshold → human confirm. Every confirmation is training data; precision matters far more than recall for trust, so tune to surface a ranked "possible" list rather than auto-asserting.

Postgres `LISTEN/NOTIFY` drives the alert fanout — it scales fine at this volume.

## v1 scope
- One distributor format (Sysco PDF) parsed.
- openFDA enforcement API only, polled hourly.
- Email alert only; no SMS, no credit emails.
- Match confirm/reject in a single admin page.

## Out of scope
- POS/inventory integrations, EDI 810 ingestion.
- Non-food recalls, pharma, pet food.
- Anything that claims to be FSMA 204 certified compliance.

## Risks & unknowns
False positives destroy trust instantly and cost the operator real inventory. Distributors may object to being cc'd by a robot. Sales motion into independent restaurants is notoriously brutal; the wedge is probably one regional distributor's rep list or a state restaurant association.

## Done means
A real recall issued this week produces a correct, lot-specific alert to a pilot restaurant within 30 minutes of publication, and the operator can print a hold tag and send a credit request without leaving the email.

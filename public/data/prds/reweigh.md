## Overview
Reweigh is a phone-first tool for small shippers who move LTL (less-than-truckload) freight and keep getting surprise invoice adjustments. It helps you assign the correct NMFC freight class *before* you ship, then audits the carrier's invoice against your bill of lading and flags reweigh/reclass adjustments, generating a ready-to-send dispute.

## Problem
LTL pricing hinges on freight class, which is largely density-driven. Carriers routinely reweigh and re-measure pallets at the terminal and reclassify them upward, adding charges days after pickup. Small shippers rarely have the documentation to contest it — no recorded dimensions, no density math, no dispute template — so they eat the fee. It's a boring, high-friction, money-losing workflow repeated thousands of times a day.

## How it works
At pickup you create a shipment: enter weight, then either type L×W×H or shoot a photo of the pallet against a reference marker for an assisted dimension estimate. Reweigh computes density (lb/ft³), maps it to a suggested NMFC class band, and stores the whole record — photo, dimensions, timestamp, density math — as your evidence packet. When the invoice arrives, you enter (or forward) the charged class and weight; Reweigh diffs it against your recorded shipment and, if the carrier bumped the class or weight, it renders a dispute letter citing your documented density and the class-density table. Everything is timestamped and exportable as a PDF.

## Technical approach
Stack: React Native (Expo) + SQLite for offline field use; a small backend (Node + Postgres) only for account sync and PDF generation. Freight-class logic is a versioned density→class rule table (the standard density brackets) shipped as JSON so it updates with NMFTA changes without an app release. Dimension assist: v1 is manual entry plus a known-size reference object (a standard 48×40 pallet) for a rough photo scale; ARKit/ARCore plane measurement is a later enhancement. Invoice ingest v1 is manual keying; later, OCR (on-device Vision framework / Tesseract) parses carrier invoice PDFs. Dispute letters from a template engine that fills your documented density, recorded vs. charged class, and the governing bracket. Hard part: the density→class mapping has real edge cases (released rates, exceptions, commodity-specific NMFC items) — v1 covers the density-based majority and explicitly flags "needs manual NMFC lookup" rather than guessing.

## v1 scope
- Create shipment: weight + manual dimensions → density → suggested class
- Attach pickup photo + timestamp; store as evidence record
- Manual invoice entry, diff vs. record, generate PDF dispute letter

## Out of scope
- AR/photo auto-measurement and invoice OCR
- Carrier API / TMS integrations, live rating
- Commodity-specific NMFC item lookup beyond density classes

## Risks & unknowns
- NMFC is proprietary/licensed; must stick to the public density-class framework and user-supplied item numbers
- A wrong class suggestion could cost the user money — needs clear confidence and disclaimers
- Disputes still require carrier cooperation; the tool arms you, it doesn't force a refund

## Done means
I can create a pallet record with weight and dimensions, get a density-based class suggestion, and when I enter an invoice showing a higher class, the app produces a PDF dispute letter that correctly cites my recorded density and the class I should have been billed.

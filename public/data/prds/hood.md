## Overview
Hood is a mobile app for kitchen-exhaust (hood) cleaning contractors—the crews who de-grease restaurant hoods and ducts. It generates NFPA 96 compliance certificates and service stickers on-site from photos, and tracks each customer's next-due date so no recurring job slips.

## Problem
After every cleaning, contractors must affix a dated service label and retain before/after photos; fire inspectors (AHJs) check these. Cleaning frequency is code-mandated by cooking volume—monthly for solid fuel, quarterly for high-volume, semiannual for moderate, annual for low. Small operators track all of this in their heads or on a whiteboard, produce ugly hand-written stickers, and lose repeat revenue because nobody reminds them (or the customer) when the next cleaning is due.

## How it works
On site, the tech opens a job for a customer, snaps before and after photos of the hood/duct/fan, and taps the appliance's cooking category. The app applies the NFPA 96 interval, generates a branded PDF certificate and a printable service sticker with a QR code linking to the photo packet, and schedules the next-due reminder. A route dashboard lists who's overdue, feeding a one-tap rebooking pipeline.

## Technical approach
React Native / Expo, offline-first with WatermelonDB (SQLite); photos stored locally with optional S3 sync. PDF generation via react-native-html-to-pdf from an HTML template. The NFPA 96 frequency table is encoded as JSON rules keyed on appliance/cooking type. QR codes point to a static signed URL for the photo packet. Reminders use local notifications plus optional email (Postmark). The genuinely hard part isn't code—it's encoding correct NFPA 96 AND local AHJ interval variations, and designing a sticker/cert that inspectors in a given jurisdiction actually accept.

## v1 scope
- Single tech, single-device
- Photo capture + cooking-type selection → PDF cert + printable sticker
- Auto next-due date and an overdue reminder list

## Out of scope
- Invoicing and payments
- Crew scheduling / multi-tech dispatch
- Multi-jurisdiction rule packs beyond base NFPA 96
- Customer-facing portal

## Risks & unknowns
Liability if a computed interval is wrong. AHJ requirements vary and some want specific sticker formats. Incumbents are generic field-service/invoicing apps—will a focused cert+reminder tool pull them away? Restaurant owners, not cleaners, may end up being the buyer.

## Done means
A contractor cleans a taqueria's hood, hands the owner a compliant dated certificate generated on the phone, and gets a push notification three months later prompting the rebooking—no whiteboard involved.

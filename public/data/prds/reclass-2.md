## Overview
Reclass is a mobile-first tool for LTL (less-than-truckload) shippers, warehouse clerks, and small 3PLs that computes the correct freight class for a shipment and generates dispute-proof paperwork. It's for the person on a loading dock who currently guesses the class off a laminated cheat-sheet and eats a surprise reclassification invoice two weeks later.

## Problem
In mid-2025 the NMFTA overhauled the NMFC, collapsing thousands of commodity codes toward a density-based system. Shippers who've used the same class for a decade are now getting reweighed-and-reclassed by carriers, with fees of $50–$300 per shipment plus billing disputes. The math (pounds per cubic foot → class band) is simple but easy to botch under time pressure, and nobody keeps the evidence to fight a wrong reclass.

## How it works
Clerk enters L×W×H and weight (or scans a pallet with the phone's LiDAR/ARKit for auto-dims). App computes density, maps it to the current density-based class band, and — for commodity-specific exceptions — looks up the item in a curated code table. Output: the class, a printable BOL line, and a timestamped "measurement packet" (photo of the pallet + tape measure, dims, density calc, date, class rule cited). If a carrier reclasses later, you export the packet as a PDF to dispute the charge.

## Technical approach
Stack: React Native (Expo) + a small FastAPI backend, Postgres. Core is a pure function `density -> class` implementing the published density bands, plus a hand-maintained JSON pack of commodity exceptions and their effective dates (versioned so old shipments resolve against the rules in force that day). LiDAR dimensioning uses ARKit's `ARMeshAnchor`/plane detection to estimate bounding box; fall back to manual entry. Measurement packets are generated server-side with a PDF library and stored in S3 with a content hash for tamper-evidence. The genuinely hard part is the exception table: density alone doesn't classify everything, and keeping the commodity overrides current and correctly date-scoped is the moat.

## v1 scope
- Manual dims + weight entry, density → class band
- Single hardcoded rule version (current NMFC density bands)
- Generate a one-page PDF measurement packet
- Copyable BOL class string

## Out of scope
- LiDAR auto-dimensioning (v2)
- Carrier API / TMS integration
- Multi-user accounts and billing dispute tracking

## Risks & unknowns
- NMFC rule text is licensed by NMFTA; need to encode the density bands without redistributing their proprietary tables — verify what's fair-use vs. licensed.
- Density bands may not cover enough commodities to be trusted without the exception pack.
- Carriers may not honor a self-generated packet in disputes.

## Done means
On a real pallet (48×40×50 in, 620 lb) the app returns the correct class and a PDF packet in under 30 seconds, and a freight broker confirms the class and BOL text match what they'd file.

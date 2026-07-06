## Overview
Reclass is a phone-first tool for small shippers, warehouse clerks, and 3PL dispatchers who tender LTL (less-than-truckload) freight. It measures a pallet, computes its density, and returns the correct NMFC freight class plus a confidence flag on whether the carrier is likely to reweigh, remeasure, and reclass it — the #1 source of surprise invoice adjustments in LTL.

## Problem
LTL pricing hinges on freight class (50 to 500), largely driven by density (lb/ft³). Shippers routinely guess the class, under-declare density, and get hit weeks later with a 'reweigh & reclass' fee that can double the bill — plus a dispute they usually lose because they have no evidence. Density math is tedious, per-item, and error-prone when done by hand on a clipboard.

## How it works
1. Clerk places the pallet in frame; the phone captures L×W×H via LiDAR/ARKit plane detection (or manual entry as fallback).
2. Clerk enters or reads weight from a floor-scale.
3. App computes density = weight / (cubic feet), maps it to the 18-class density scale, and suggests an NMFC class.
4. It cross-checks the commodity description against a bundled NMFC keyword table for items that class by exception (not density) and warns.
5. Output: a timestamped, photo-backed 'class evidence card' (PDF) with dimensions, weight, density, class, and a reclass-risk score, ready to attach to the BOL.

## Technical approach
- **Stack:** Swift + ARKit/RealityKit for on-device dimensioning; a React Native shell is possible but native LiDAR is the differentiator. Core logic in a small shared module.
- **Data:** the density→class breakpoints are public and fixed (a lookup table). A curated JSON of ~300 common NMFC commodity keywords and their exception classes ships in-app (the full NMFC book is licensed, so v1 is density-first + a keyword advisory, not a licensed NMFC lookup).
- **Algorithm:** plane-fitting to get the bounding box of the pallet stack, unit conversion, breakpoint bucketing, and a rules engine for exception flags.
- **Hard part:** reliable dimensioning of irregular, overhanging, or shrink-wrapped loads under warehouse lighting, and the legal gray zone of NMFC data — hence v1 stays advisory.

## v1 scope
- Manual dimension + weight entry → density → suggested class.
- LiDAR auto-measure for iPhone Pro.
- PDF evidence card export.
- Bundled 300-keyword exception advisory table.

## Out of scope
- Licensed full NMFC/CzarLite lookup.
- Carrier rate quoting / booking.
- Multi-pallet shipment aggregation.

## Risks & unknowns
- NMFC data licensing (NMFTA) limits how authoritative v1 can claim to be.
- Dimensioning accuracy on wrapped/overhanging freight.
- Will clerks trust a phone over their gut?

## Done means
Given a real pallet, the app produces a class within one class-step of a certified NMFC classification for 8/10 density-driven test loads, and exports a PDF evidence card in under 30 seconds per pallet.

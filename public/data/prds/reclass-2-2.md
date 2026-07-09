## Overview
Reclass is a phone-first tool for small shippers, e-commerce sellers, and rookie freight brokers who tender LTL (less-than-truckload) freight and keep getting burned by class corrections. You enter (or photograph) a shipment's dimensions, weight, and commodity, and it returns the freight class the carrier is most likely to bill—plus the density math that justifies it.

## Problem
Since the 2025 NMFTA overhaul pushed the majority of commodities onto a density-based scale, mis-classing freight is the single most common surprise fee in LTL. A shipper guesses "class 70," the carrier reweighs and re-cubes the pallet at the dock, and a reclass invoice for $80–$300 lands weeks later with no way to dispute it. The math (weight ÷ cubic feet → density bracket → class) is trivial, but nobody does it at tender time, and the density brackets are buried in a document most sellers have never seen.

## How it works
1. Enter L×W×H (inches) and weight, or point the camera at the pallet and let it estimate dimensions.
2. App computes cubic feet (rounding up partial pallets the way carriers do) and density in lb/ft³.
3. Maps density to the standard 11-bracket density scale → suggested class (50–500).
4. Optional: type a commodity description; an on-device suggestion layer flags whether the item is one of the ~2,000 still-exception-classed commodities (hazmat, unpackaged metal, etc.) that override density.
5. Outputs a shareable one-page "class rationale" PDF you can staple to the BOL to pre-empt disputes.

## Technical approach
React PWA, fully offline. Core is a lookup table of the public density brackets plus a stackability/handling-unit calculator. Commodity → likely-exception detection uses a small embedded keyword+embedding index (MiniLM via transformers.js) over a user-extensible JSON of exception commodities—NOT the licensed NMFTA ClassIT database, which we deliberately don't ship. Data model: `Shipment{dims, weight, stackable}` → `Density` → `ClassResult{class, bracket, confidence, overrides[]}`. The genuinely hard part is honesty about ambiguity: density gives one class, exceptions give another, and carriers vary—so we surface a confidence band and the exact rationale rather than a single false-precise number.

## v1 scope
- Manual dims+weight entry → density → class, with the bracket table shown
- Cubic-feet calculator handling partial/overhung pallets
- Exportable one-page rationale PDF
- Local history of past shipments

## Out of scope
- Live carrier rating/booking APIs
- Camera dimension estimation (stub the button)
- The licensed NMFC number lookup

## Risks & unknowns
- NMFTA licenses the authoritative classifications; we must stay on the public density scale + user-supplied notes to avoid IP issues.
- Carriers still reweigh; we reduce disputes, we don't eliminate them.
- Exception-commodity coverage is only as good as the community JSON.

## Done means
Given a 40×48×50" pallet at 350 lb, the app returns the correct density (≈6.3 lb/ft³), maps it to the right class bracket, and exports a PDF whose numbers a carrier's own density calculator agrees with.

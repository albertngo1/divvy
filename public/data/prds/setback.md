## Overview
Setback is a mobile-first web tool for homeowners and small contractors that answers one dreaded question: *"Do I need a permit for this, and what are the rules on MY lot?"* It decodes a municipality's zoning setbacks, height limits, and permit thresholds for common small projects — fences, sheds, decks, driveways — from a plain-English description plus a parcel address.

## Problem
Zoning code is public but unreadable. A homeowner wanting a back fence has to figure out their zoning district, find setback tables, decode "accessory structure" rules, and guess whether 120 sq ft trips a permit. Most people either call the city and wait on hold, or build wrong and get a stop-work order. Contractors eat this cost on every small job in a new town. It's a painful manual lookup repeated millions of times a year.

## How it works
1. Enter an address → tool pulls the parcel from the county GIS and reads its zoning district, lot dimensions, and existing structure footprint.
2. Pick a project template (fence / shed / deck) and a few fields (height, area, location: front/side/rear).
3. Setback runs the district's rule set and returns a verdict: **No permit needed** / **Permit required — here's which one** / **Won't be approved as drawn (violates X)**, with the exact code citation and a mini site-plan sketch showing the legal build envelope on the parcel outline.

## Technical approach
Next.js + a small Postgres store. Parcel + zoning geometry from county ArcGIS REST endpoints (`/MapServer/query?...&f=geojson`), which most US counties expose free; Turf.js for setback buffering and footprint math against the parcel polygon. The rules engine is the core asset: a versioned JSON DSL per municipality — `{district: "R-1", accessory: {maxHeight_ft: 12, rearSetback_ft: 5, permitThreshold_sqft: 200}}` — hand-encoded from the zoning ordinance. Evaluation is a pure function `(project, rules, parcelGeom) → verdict + citations + envelopePolygon`. The genuinely hard part is (a) rules vary wildly per town and change, and (b) mapping messy county GIS schemas to a normalized parcel model — start narrow, one city.

## v1 scope
- ONE city (pick one with a clean ArcGIS parcel layer)
- Three project types: fence, shed, deck
- Address → parcel → setback verdict + one code citation
- SVG site-plan showing buildable envelope

## Out of scope
- Actual permit filing/submission
- Structural/electrical/plumbing codes
- Multi-city, HOA rules, historic districts
- Legal guarantee (it's guidance, not approval)

## Risks & unknowns
- Liability if wrong — heavy "verify with your building dept" framing, cite the ordinance so users can check.
- County GIS uptime/schema drift.
- Rule-encoding is labor; hard to scale past a few cities without a template pipeline.

## Done means
For the launch city, entering a real residential address and "6 ft rear fence" returns the correct permit verdict with the right setback citation and a drawn envelope, matching what the city's own counter would tell you, for 20 spot-checked parcels.

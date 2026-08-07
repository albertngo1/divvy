## Overview
Design Day is a paid web service for residential HVAC contractors, home-performance raters, and small mechanical engineering shops. You paste an address, answer six confirmation questions, and it returns a signed PDF room-by-room ACCA Manual J heating/cooling load calculation plus a Manual S equipment selection short-list — the document an increasing number of jurisdictions require attached to a mechanical permit application.

## Problem
Most residential systems are sized by rule of thumb ("500 sqft per ton") or by copying the old unit's nameplate. A real Manual J in Wrightsoft/Elite takes 60–120 minutes of data entry per house — measuring every wall, window, and duct run. Contractors doing 15 changeouts a month can't absorb 30 hours of clerical work, so they either buy a $400 one-off calc from a freelancer, or fake it. Meanwhile IECC-adopting jurisdictions and utility rebate programs (Mass Save, TECH Clean CA, and the heat-pump 25C paperwork) increasingly reject permits without one. The niche is squeezed between a mandate and a labor cost.

## How it works
1. Address → parcel. Resolve via Census Geocoder, then hit the county assessor's ArcGIS FeatureServer for year built, conditioned sqft, stories, foundation type, wall material.
2. Geometry. Pull the building footprint from Overture Maps / Microsoft US Building Footprints; derive perimeter, orientation, and per-facade wall area (footprint edges × story height). Estimate window area by ASHRAE window-to-wall defaults keyed to vintage, overridable.
3. Envelope assumptions. Map (county, year built, wall material) → U-values and infiltration ACH50 using NREL ResStock's housing-characteristics distributions, which are literally conditional probability tables of US housing stock. Show the contractor the assumed R-values with a confidence chip; every one is one click to override.
4. Weather. ASHRAE 99%/1% design dry-bulb and coincident wet-bulb for the nearest of ~1,700 stations; solar gains from NSRDB TMY hourly DNI/DHI by facade.
5. Compute. Implement the Manual J 8th ed. residential procedure directly: HTM (heat transfer multiplier) per surface, infiltration via the AIM-2/effective-leakage-area path, internal + latent loads by occupancy, duct gain/loss by location (attic vs. conditioned). Room-by-room split proportional to exposed envelope.
6. Output. WeasyPrint PDF matching the Manual J worksheet layout, plus an AHRI Directory query returning matched indoor/outdoor pairs whose capacity at design temp lands in the 90–115% band.

## Technical approach
Python/FastAPI + Postgres (PostGIS for footprints, one table per data vintage). Assessor schemas differ per county, so ship an adapter registry — a YAML field-mapping per county — and launch with 25 metros covering ~30% of US single-family permits. The genuinely hard part is not the physics (Manual J is a deterministic worksheet); it's provenance and defensibility: every input needs a citable source and an override trail, because a plan reviewer rejecting one PDF kills the account.

## v1 scope
- 3 counties, single-family detached only, no basements
- Whole-house block load first; room-by-room later
- 6-question confirmation form, no CAD import
- PDF output + $19/calc Stripe checkout

## Out of scope
Manual D duct design, commercial buildings, drawing import, mobile app.

## Risks & unknowns
ACCA trademark/certification — uncertified output may be rejected in strict jurisdictions; the ACCA software-approval path costs money and time. Assessor data is stale and sometimes wrong. Liability if an undersized system is installed on our numbers (mitigate: contractor signs off on assumptions).

## Done means
Three real contractors submit our PDFs with actual permit applications in three different jurisdictions and all three are approved without a comment.

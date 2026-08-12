## Overview
Zone Zero is an iPhone app plus a small desktop pipeline for homeowners in wildfire country (CA, CO, OR, NM) who are being non-renewed or surcharged by their insurer and told to "prove defensible space." You capture a slow orbit video of your house; it reconstructs a metric 3D model, classifies every surface into fuel classes, and measures the actual distances the rules care about — then exports an annotated plan view, a ranked work list, and a timestamped, geotagged photo packet formatted for an insurer or a CAL FIRE inspection.

## Problem
Defensible-space rules are geometric (Zone 0: 0–5 ft ember-resistant; Zone 1: 5–30 ft lean/clean/green; Zone 2: 30–100 ft thinned), but compliance today is a tape measure, a clipboard, and a subjective inspector. Homeowners don't know if that juniper is 4 ft or 6 ft from siding, can't prove they fixed it, and pay $400+ for a consultant to say what a phone can measure. Insurers, meanwhile, want evidence, not adjectives.

## How it works
1. Guided capture: an ARKit overlay walks you around the structure, nagging when tracking drifts or coverage is thin.
2. Reconstruction: ARKit scene mesh + depth gives metric scale for free on LiDAR phones; non-LiDAR falls back to COLMAP with a printed 8.5×11 scale sheet placed on the ground.
3. Segmentation: SAM 2 masks propagated across frames, each mask classified into {siding, deck, fence-wood, fence-metal, shrub, tree-canopy, mulch, gravel, grass, woodpile, propane}.
4. Measurement: wall planes are RANSAC-fit and projected to a plan-view polygon; every fuel cluster is projected too; distance = point-to-polygon in plan view. Tree canopies also get a vertical check (branches within 10 ft of chimney, canopy-to-canopy gaps).
5. Output: SVG plan with Zone 0/1/2 rings, a violation list sorted by estimated remediation cost per violation cleared, and a PDF packet of cropped, EXIF-stamped stills per finding.

## Technical approach
Swift/ARKit for capture (export USDZ mesh + per-frame poses); Python service for the rest — SAM 2 for masks, a fine-tuned DINOv2 linear head for the fuel classes (a few hundred hand-labeled crops gets surprisingly far), Open3D for plane fitting and plan projection, shapely for the distance geometry, WeasyPrint for the PDF. Rule tiers come from the CAL FIRE FHSZ layer (public WFS) keyed on the parcel's lat/lon, so the app knows whether Zone 0 is advisory or mandatory at your address. Data model: one Scan → many Surfaces (class, mesh id, plan polygon) → many Findings (rule id, measured value, threshold, evidence frame ids). The genuinely hard part is *attachment*: a wood fence touching siding and a deck with combustible storage underneath are the highest-severity findings and both require reasoning about contact between segments, not just distance.

## v1 scope
- LiDAR iPhones only, single-story houses, daylight capture
- Three fuel classes: woody vegetation, combustible fence/deck, everything else
- Zone 0 only (the 0–5 ft ring) — the rule everyone is scrambling on
- Output: one SVG plan view + one PDF with numbered findings

## Out of scope
- Roof/gutter inspection, ember-vent assessment, drone capture
- Any claim of legal or insurance certification
- Multi-property or contractor fleet accounts

## Risks & unknowns
Scale drift on non-LiDAR phones can blow a 5 ft threshold. Vegetation segmentation in harsh noon shadow is unreliable. Insurers may not accept homeowner-generated evidence — the likelier paying customer is the mitigation contractor doing 30 assessments a week. Liability framing must stay "measurement tool," not "compliance guarantee."

## Done means
On ten real yards with tape-measured ground truth, 90% of Zone 0 vegetation distances land within ±6 inches, and every hand-labeled Zone 0 violation appears in the generated PDF with a correctly cropped evidence photo.

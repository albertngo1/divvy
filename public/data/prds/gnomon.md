## Overview
Gnomon is a single-page forensic tool for verifying *when* an outdoor photo was taken. You upload an image, click four corners of any rectangle on the ground (a paving slab, a crosswalk stripe, a parking bay) and then the base and tip of one vertical object plus the tip of its shadow. Gnomon recovers the solar elevation angle from the image geometry alone, then tells you every (date, time-of-day) pair at which the sun could have been that high at the claimed location — and whether the photo's claimed timestamp is inside that set. For OSINT researchers, insurance adjusters, journalists verifying UGC, and lawyers with a disputed site photo.

## Problem
EXIF timestamps are trivially forged, and "reverse-engineer the shadows" is a manual ritual: open SunCalc, eyeball a compass rose, argue in a thread. Nobody wants to do single-view metrology by hand. Meanwhile the physics is unforgiving and cheap: the sun's elevation at a given latitude, date, and minute is known to arcseconds. That's a hard constraint sitting unused because nobody built the bridge between "pixels" and "ephemeris".

## How it works
1. Upload photo. Gnomon reads EXIF (timestamp, GPS if present) but treats it as a *claim*, not evidence.
2. Guided click flow: mark a ground rectangle (metric rectification), then the vertical object's base, top, and shadow tip.
3. Compute solar elevation θ = atan(height / shadow length) in rectified ground units.
4. For the claimed lat/lon, sweep the year at 5-minute resolution and compute true solar elevation; render a heatmap over (day-of-year × local time) with the feasible band highlighted and the claimed timestamp plotted as a crosshair.
5. Verdict card: "Consistent (θ measured 41.2° ±2.8°, expected 39.7°)" or "Impossible: the sun was 22° lower than this shadow implies."

## Technical approach
Frontend: vanilla TS + canvas for the click flow, no framework. Backend: Python/FastAPI. Ground-plane homography from the four clicked corners via `cv2.findHomography`; object height recovered by Criminisi-style single-view metrology using the vertical vanishing point (from two clicked parallel verticals) and the cross-ratio, so the user never has to know real-world dimensions — only the *ratio* of height to shadow length matters, which is exactly what elevation needs. Solar position from `pvlib.solarposition.spa_python` (NREL SPA), plus atmospheric refraction correction. Uncertainty propagated by Monte Carlo: jitter each clicked point by ±3 px, 2000 draws, report the 5th/95th percentile elevation band. Output is a stamped PDF report with the annotated image, the feasibility heatmap, and every parameter, so it can be handed to someone skeptical.

The genuinely hard part is degeneracy: near-frontal shadows and near-noon suns make elevation ill-conditioned. Detect and refuse rather than emit a confident wrong number.

## v1 scope
- One vertical object, one ground rectangle, one photo.
- Requires user-supplied lat/lon (EXIF or typed).
- Feasibility heatmap PNG + text verdict. No PDF yet.
- Hardcoded ±3 px click uncertainty.

## Out of scope
- Inferring latitude from shadows alone (needs two shadows at different times).
- Cloudy/diffuse-shadow photos, indoor light, fisheye lenses.
- Deepfake or splice detection.

## Risks & unknowns
Most real-world photos lack a clean ground rectangle; the click flow may be too fiddly for casual users. Refraction and terrain occlusion matter near sunrise/sunset. False confidence is the reputational risk — the uncertainty band must be loud.

## Done means
Given a photo I shot at a known place and minute, Gnomon's 90% elevation band contains the true solar elevation; and given the same photo with the EXIF time shifted by three hours, it flags the timestamp as impossible.

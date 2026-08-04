## Overview
A browser tool that solves for a physical object whose cast shadow is illegible noise all year — except at the exact date and minute you pick, at your exact coordinates, when the sun's ray happens to project it into a word or silhouette. Export an STL, print it, bolt it to the wall, wait eleven months. For makers, gift-givers, and anyone who likes a machine whose output is patience.

## Problem
Sundials tell you a time you already know. Gallery shadow sculptures (Mitra & Pauly's multi-view shadow art) pick convenient arbitrary lamp directions. Nobody builds the personal version, which is the good version: the sun over *your* address on *your* anniversary is one specific ray, rays weeks apart are geometrically distinct, and the object can be solved so only that ray resolves. The waiting is the artwork.

## How it works
1. Enter an address (geocoded to lat/lon), the wall's azimuth and tilt, and one to three moments (date + local clock time).
2. The tool computes each solar vector and immediately reports feasibility — because of the analemma, June 21 at 09:00 and June 22 at 09:00 are effectively the same ray. The UI shows angular separation between moments and refuses below ~15°.
3. Draw or type a target silhouette per moment.
4. Solve. A preview sweeps the sun across the day and the shadow snaps into the word.
5. Export STL plus a mounting card listing required azimuth, tilt, standoff distance, and the exact minute it happens for the next ten years.

## Technical approach
Solar position via the NREL SPA algorithm (Reda & Andreas), accurate to ~0.0003°, which includes the equation of time so the analemma falls out for free. Convert to a unit vector in local ENU, then into object frame from the mount orientation.

Occluder: a 96³ grid of occupancy logits. Differentiable shadow rendering — for sun direction d, resample the grid along d as a sheared 3D texture read and accumulate transmittance T = Π(1−σ). Penumbra matters: the solar disc subtends 0.53°, so convolve the projected shadow with the correct angular kernel for the object-to-wall distance. Solvers that assume sharp shadows look crisp on screen and mushy on the wall; this is the difference.

Loss = Σ_k BCE(shadow_k, target_k) + λ_sparse·Σσ + λ_tv·TV. Adam on logits. Then threshold, keep the largest 6-connected component, verify with a hard raycast render, marching cubes to STL.

Hard part: connectivity and self-support. The optimizer loves floating dust. Fix with a soft connectivity penalty (differentiable dilation from the anchor voxel, penalizing mass unreachable from the mount) plus a repair pass that adds struts *parallel to the selected sun rays* — a strut parallel to the ray casts no additional shadow at that moment. That trick is why the result can look clean instead of webbed.

## v1 scope
- One moment only, not three
- Python + PyTorch, 64³ grid, STL out
- Text targets rendered from a bundled font
- Warn if solar elevation < 10°
- Static preview render, no live WebGPU

## Out of scope
Indoor lamps, rotating mechanisms, caustics/color, multi-material printing, and the print-and-ship storefront (that's v2, and that's the business).

## Risks & unknowns
FDM overhang sag blurs fine features versus simulation. A 2° mount misalignment can ruin it, so a calibration ritual is needed (print a test cross, nudge until its shadow hits a mark). Clouds. Two-moment solutions may be infeasible at high latitude in winter.

## Done means
A printed object mounted per the card casts, within ±3 minutes of the predicted time, a shadow that a person reading it cold identifies as the intended word — and cannot, on the day before or after.

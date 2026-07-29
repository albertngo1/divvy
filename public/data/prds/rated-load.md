## Overview
A paid web service that reads sliced G-code (not CAD) and runs an anisotropic structural simulation of the part *as it will actually be printed*, returning a predicted failure load, failure location, and a ranked list of plate orientations that improve it. Sold to shops and sellers who print functional, load-bearing parts.

## Problem
FDM parts are strongly orthotropic: interlayer strength is routinely 40–60% of in-plane strength, and it depends on wall count, infill angle, temperature, and orientation — none of which exist in the CAD model. So conventional FEA on the STL predicts the wrong number, and the people printing brackets, drone arms, e-bike mounts, jigs, and orthotics mostly guess and then break things in a vise. Now that cheap CF-filled nylons and multi-printer farms let non-engineers ship structural plastic to paying customers, guessing has become a liability question.

## How it works
Drop in a `.gcode` file, pick the material and printer profile, then click two faces: where the load is applied and where it's held. You get back: "Fails at 178 N, delamination between layers 41–43 at the fillet. Rotated 90° about X, the same part holds 430 N and adds 14 minutes of print time." Below that, a heat map of the printed bead geometry colored by margin against failure, plus a downloadable report you can hand to your customer.

## Technical approach
Parse G-code into per-layer extrusion polylines (Marlin/Klipper flavors; `;TYPE:` comments give perimeter vs. infill; bead width/height come from the profile or are inferred from E-per-mm and layer Z). Voxelize the swept beads onto a ~0.4 mm grid — each voxel stores a local frame from the bead tangent, a bond flag to the voxel below, and a material ID. Assign an orthotropic stiffness tensor per voxel: in-plane modulus along the bead, reduced transverse and interlayer moduli from a material table. Solve linear elastostatics on the hex grid with a matrix-free conjugate gradient and a Jacobi preconditioner (Rust + rayon; a 5 M-voxel bracket solves in seconds). Failure: max-stress in the local frame, plus a separate interlayer criterion on the bond flag. Orientation sweep re-slices headless via PrusaSlicer CLI over a coarse rotation grid and re-solves.

The hard part is calibration, and it's also the moat: anisotropy constants vary by printer, nozzle temperature, and flow. Ship a $0 calibration kit — six printed coupons in three orientations, broken with a $15 luggage scale, numbers typed into a form — and fit a per-printer profile. That's why this is a subscription and not a script someone rewrites in a weekend.

**Business:** $29/mo hobby (10 checks), $199/mo shop (unlimited + API + branded PDF reports), $2k/yr for teams doing bridge tooling. Buyers: functional-part print shops, Etsy/eBay sellers of brackets and mounts, drone and e-bike accessory makers, orthotic and prosthetic labs, machine shops printing fixtures. Why now: CF-filled filaments and Bambu-class farms put structural parts in the hands of people with no FEA and real customers.

## v1 scope
- PLA and PETG only, single load case, single material
- One printer profile, hand-calibrated from literature values
- Failure load + failure location, no orientation sweep
- Web upload, no accounts, results as a shareable link

## Out of scope
- Fatigue, creep, impact, thermal loads, multi-material, supports, nonlinear/large-deflection, actual CAD import

## Risks & unknowns
A confidently wrong number on a load-bearing part is the whole risk — every result must ship a stated confidence interval and a "not for safety-critical use" line. Voxel resolution vs. solve time is a real tradeoff at thin walls. G-code flavor coverage is grind.

## Done means
Five test brackets printed and pulled on a load cell; predicted failure load lands within ±20% of measured on at least four, and the predicted failure *location* is correct on all five.

## Overview
Streak is an exposure-planning tool for astrophotographers that predicts, for *your* exact telescope pointing and field of view, when a catalogued satellite will cross your frame and ruin a long exposure. It answers one question: "Can I open the shutter for the next 5 minutes, or should I wait?" For amateur deep-sky imagers facing an exploding low-earth-orbit population.

## Problem
SpaceX wants 100k more Starlinks; astronomers are furious because bright trails streak through long exposures. Existing tools show general satellite passes, but not whether a specific object will transit the *small cone your scope is aimed at during your specific integration window*. That per-frame prediction is exactly the gap. The arbitrage: orbital element sets (TLEs/GP data) are free and cheap to propagate; the niche can't easily turn them into a pointing-specific shutter decision themselves.

## How it works
You enter your location, target (RA/Dec, or plate-solved from a sample frame), field-of-view diameter, and exposure length. Streak propagates the full catalog of tracked objects via SGP4, converts each to topocentric alt/az, and computes angular separation from your pointing vector over the next N minutes. Any track that enters your FOV cone during the window is flagged: it renders a timeline of predicted streaks and the clear gaps between them, plus a big green/red "OPEN SHUTTER?" verdict for the immediate window.

## Technical approach
JS or Python with satellite.js / python-sgp4 for SGP4 propagation. Data: Celestrak GP element sets (active + Starlink groups), auto-refreshed daily. Pipeline: TLE → ECI position/velocity at t → topocentric ENU given observer lat/lon/alt → alt/az → angular separation from pointing unit vector; flag when sep < FOV_radius + margin. Sample at ~1s over the window; ~10k objects is fast with vectorized math. Hard part: TLE accuracy degrades with age (position error grows), so timing is second-to-tens-of-seconds fuzzy; also distinguishing a bright transit worth aborting from a faint one you'd stack out.

## v1 scope
- Manual entry of location, target RA/Dec, FOV degrees, exposure length
- Load Celestrak active + Starlink catalogs
- Timeline of predicted crossings for the next 15 minutes
- Green/red verdict for the immediate exposure window

## Out of scope
- Satellite brightness/magnitude modeling
- Mount/INDI integration to auto-pause the shutter
- Plate-solving from an uploaded frame (v2)
- Mobile app

## Risks & unknowns
- Stale TLEs push predictions off by seconds — need to surface element age
- Propagation error window may make "exact" claims overconfident
- Many streaks are removable via sigma-clip stacking, softening the need
- Catalog completeness (untracked debris) caps recall

## Done means
Given a location, target, and FOV, Streak lists upcoming satellite crossings with predicted times that match a known Starlink pass (verified against a heavens-above-style reference) to within a few seconds, and flips its verdict red exactly when a crossing falls inside the exposure window.

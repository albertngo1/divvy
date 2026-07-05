## Overview
Trainspotter is a satellite-streak forecaster for backyard and small-observatory astrophotographers. Given your target, your location, and your planned exposure sequence, it predicts which individual sub-frames will be ruined by a satellite crossing the field — especially the bright, freshly-launched Starlink "trains" — so you can dodge them instead of trashing frames in post.

## Problem
Mega-constellations have turned wide-field and long-exposure imaging into a game of chance; the ESO warnings are real and worsening. Astrophotographers already stack and sigma-clip streaks out, but a single bright train through a 300-second sub can wreck a whole exposure and you don't know until you inspect it. Existing pass predictors (Heavens-Above) answer "is anything overhead?" — not "will something cross *this* 2°×1.5° field during *this* exposure?"

## How it works
You enter target RA/Dec (or resolve a name via SIMBAD), your lat/lon, camera field-of-view, and your imaging plan (start time, sub length, number of subs). Trainspotter propagates the full public satellite catalog for your session window and computes, for each object, whether its apparent track intersects your framed field — and if so, at what time, at what angular speed, and (roughly) how bright. It emits a per-minute timeline: green subs (clear), yellow (grazing edge), red (streak through center), with a per-object callout ("Starlink-31245 train, 22:14:30, crossing NE→SW"). A nightly "sky-fouling index" summarizes how contested your patch of sky is.

## Technical approach
Stack: Python + Skyfield for SGP4 propagation; TLE/OMM data from CelesTrak (`gp.php` groups: starlink, oneweb, active) refreshed daily. Core algorithm: for each satellite, propagate topocentric alt/az across the session at ~1s steps, project onto the tangent plane at the target, and test intersection with the rectangular FOV; keep only objects above the horizon and (for streaks that matter) illuminated — compute Earth's shadow to drop satellites in eclipse, since those don't streak. Brightness estimated from a standard-magnitude + range/phase model per constellation. Output as JSON + a simple terminal/HTML timeline. Hard part: performance (thousands of sats × thousands of time steps) — solved with vectorized numpy propagation and a coarse alt/az pre-filter before the fine intersection test; plus honest brightness/eclipse modeling so warnings aren't crying wolf.

## v1 scope
- CLI: target + location + plan in, colored per-sub timeline out
- Starlink group only, daily TLE cache
- Shadow/eclipse filter and coarse magnitude estimate

## Out of scope
- Live mount/capture-software integration (NINA/KStars) to auto-pause exposures
- All-sky animated visualization
- Debris and non-illuminated flare prediction

## Risks & unknowns
- TLE accuracy degrades between updates; predictions drift for maneuvering sats
- Brightness estimates are coarse — false positives annoy, false negatives ruin frames
- Value depends on your patch of sky actually being contested

## Done means
Given a real target, my backyard coordinates, and a 60-sub × 120s plan for tonight, Trainspotter outputs a per-sub timeline whose predicted red windows match, within a couple minutes, the streaks I actually find when I inspect the captured frames.

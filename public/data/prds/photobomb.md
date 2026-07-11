## Overview
A planning tool for amateur astrophotographers that predicts, frame-by-frame, which satellites will draw a bright trail across their specific field of view during a planned imaging session — and pinpoints the clean gaps to shoot in. For anyone doing long-exposure deep-sky work from a backyard rig as SpaceX threatens 100k more Starlinks overhead.

## Problem
A deep-sky image is dozens of stacked 'subs' (2–10 min exposures). A single satellite crossing ruins a sub; sigma-clipping stacking removes some, but bright dense LEO trains (Starlink 'strings of pearls') overwhelm it. Right now imagers just gamble and discard trashed frames afterward. There is no tool that says 'from 22:14–22:19, three Starlinks cross your framing; wait, then shoot.' TLE data is public and cheap; nobody has turned it into per-frame streak prediction for a hobbyist's exact pointing.

## How it works
User enters location (lat/lon/elevation), scope pointing (RA/Dec of target, or altitude/azimuth), sensor field-of-view (from focal length + pixel scale), and a session window with sub length. The tool downloads current TLEs, propagates every catalogued object's position over the window in 1-second steps, projects each into the frame's angular footprint, and flags any that pass within the FoV while sunlit (satellites are only visible when lit but the observer is in darkness). Output: a timeline ribbon of 'clean' vs 'contaminated' seconds, a per-sub verdict, and a sky-plot animation of the trails. Optionally exports a shot list of the largest clean windows.

## Technical approach
Python + `skyfield` for SGP4 TLE propagation and topocentric alt/az; TLEs from Celestrak (`starlink`, `active` groups) cached nightly. Sun position via skyfield to compute the satellite-sunlit / observer-dark visibility condition (compare satellite altitude above Earth's shadow cone). Field footprint = gnomonic projection of the sensor rectangle around the target; test each propagated point for inclusion plus a trail-width margin. The genuinely hard part is scale + the illumination model: ~10k relevant objects × thousands of timesteps must run in seconds, so vectorize with numpy and pre-filter by great-circle angular distance before the exact projection. Frontend a single-page Flask app or a static build with pyodide; sky-plot via matplotlib or a canvas overlay.

## v1 scope
- Single target, single night, manual RA/Dec + FoV entry
- Starlink + brightest catalog only
- Text timeline of contaminated minutes + one PNG sky-plot
- Nightly TLE refresh cron

## Out of scope
- Live scope/mount integration or auto-dithering
- Multi-night planning, mosaics
- Brightness/magnitude modeling of each streak

## Risks & unknowns
- TLE accuracy degrades hours after epoch; fast-maneuvering fresh Starlinks may drift from prediction — surface an uncertainty band
- Illumination-cone math is fiddly at twilight edges
- Is the audience big enough to bother polishing? (It's niche but passionate.)

## Done means
Given a real target, location, and time, the tool outputs a minute-by-minute contamination timeline that a user can verify against their own captured subs from that night — flagged minutes contain the streaks, clean minutes don't.

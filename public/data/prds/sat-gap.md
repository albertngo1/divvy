## Overview
Sat Gap is a subscription tool for serious astrophotographers and small observatories that predicts satellite-streak-free imaging windows for a specific target, location, and camera framing. Point it at 'M31, tonight, my 400mm rig' and it returns the next stretches of sky-time when no bright satellite will cross your frame long enough to ruin a sub-exposure.

## Problem
Megaconstellations (Starlink et al.) now streak a meaningful fraction of long exposures; ESO is publicly warning the night sky is 'beyond the limit.' Astrophotographers stack dozens of multi-minute subs and toss any frame a satellite crossed — wasted clear-sky time they can't afford. The orbital data to predict this is public, but no one packages it as 'when is *my* framing clean?' The niche can't compute TLE propagation against their own field-of-view themselves.

## How it works
1. User enters location (lat/long), target (RA/Dec or object name), and optical setup (focal length + sensor → field of view), plus sub-exposure length. 2. Sat Gap propagates the full public satellite catalog for the next N hours. 3. For each timestep it computes which satellites are (a) sunlit / not in Earth's shadow and (b) projected within the framed FOV, weighted by apparent magnitude. 4. It outputs a timeline: green = clean windows ≥ your sub length, red = crossing events, with a per-event mag + 'how many subs you'll lose.' 5. Optional ICS/push alert 20 min before a long clean window opens.

## Technical approach
Stack: Python + Skyfield (SGP4) for propagation, Astropy for coordinate transforms, FastAPI + a small React timeline UI. Data: Celestrak/Space-Track TLE sets (free, refreshed daily) for Starlink, OneWeb, and the general catalog; sun position via Skyfield for illumination test (satellite sunlit AND observer in darkness). Algorithm: for each satellite, propagate to a coarse grid, cheaply reject those never near the target's alt/az, then refine survivors to per-second FOV intersection; magnitude estimate from a standard intrinsic-mag + range/phase-angle model. Hard part: doing full-catalog × fine-timestep propagation fast enough to feel instant — use spatial pre-filtering (target alt/az cone) and vectorized SGP4, and cache per-night per-region propagations so many users share compute.

## v1 scope
- Web form: location, object (manual RA/Dec), FOV in degrees, sub length.
- Next-8-hours clean/streak timeline for Starlink + OneWeb catalogs.
- Per-event magnitude + estimated lost-sub count.

## Out of scope
- Mount/camera integration, auto-capture gating, weather/cloud forecasting, faint-satellite (below naked-eye) modeling, mobile app.

## Risks & unknowns
- TLE accuracy degrades over days; predictions get fuzzy beyond ~24h — must scope to same-night.
- Magnitude models for flat-panel satellites are rough; false 'clean' calls erode trust.
- Willingness to pay unproven — may be a $5/mo hobby tool, not a business; validate with a handful of imaging forums first.

## Done means
For three real target/rig combos on a given night, Sat Gap's predicted crossing events match an independent check (Heavens-Above / a captured light frame) within ±30 seconds for ≥90% of events brighter than mag 5, and it surfaces at least one correctly-clean ≥30-minute window.

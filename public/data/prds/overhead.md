## Overview
Overhead is a tiny self-hosted job that, once a night, computes exactly which catalogued satellites passed through the cone of sky directly above your location, and paints a single thin vertical band recording that night's traffic. Over 365 nights the bands accrete into a printable barcode poster — a personal, quantitative record of the sky filling up. For anyone who read that SpaceX wants 100k more Starlinks and felt something.

## Problem
'The sky is getting crowded' is an abstraction until it's *your* sky. Existing satellite trackers (Heavens-Above, satellite map sites) are live and interactive but ephemeral — there's no artifact, no felt sense of the trend over time, no thing on your wall a year later.

## How it works
You set a lat/long and a zenith cone half-angle (say 20°). Nightly, the job pulls the current two-line element sets, propagates every object's position across the local night, and counts (a) how many distinct satellites entered your cone and (b) which were sunlit-and-visible vs merely overhead. It writes one band per night: height = time axis (dusk→dawn), each satellite pass a thin horizontal tick colored by constellation (Starlink one hue, everything else another), band brightness = total count. The bands append left-to-right into a growing SVG/PNG; a `--poster` render composits the full year with month gridlines and a running Starlink-share sparkline.

## Technical approach
Python with `skyfield` (or `sgp4`) for propagation; TLEs from Celestrak's daily bulk catalog (`gp.php?GROUP=active`) plus the Starlink group for tagging. Data model: `nightly/YYYY-MM-DD.json` with `{sat_id, group, enter_time, exit_time, peak_alt, sunlit}` per pass — append-only, so the poster is a pure function of the log. Core algorithm: for each object, sample its topocentric alt/az on a 30s grid across astronomical night, detect intervals where altitude ≥ (90° − cone) and (for visibility) the sat is sunlit while the observer is in darkness. Render with Cairo/Pillow. The genuinely hard part is honest counting: at 30k+ active objects, naive full-sky propagation every 30s is heavy, so pre-filter by orbital altitude/inclination reachability before sampling, and dedupe multi-pass objects.

## v1 scope
- Config: lat/long, cone angle, timezone
- Nightly job: pull TLEs, propagate, write one night's pass log JSON
- Render one band per night and append to a running strip PNG
- `--poster` command to composite the strip so far

## Out of scope
- Real-time/live sky view (this is deliberately a once-a-night artifact)
- Naked-eye brightness modeling beyond a sunlit/not flag
- Cloud-cover correlation

## Risks & unknowns
TLE accuracy degrades between updates; counts are 'catalogued objects', not literally naked-eye visible, and the label must say so. Compute cost at 100k future objects is the scaling question the reachability pre-filter must answer. The payoff is a year out — needs a compelling first-month preview to keep the daemon running.

## Done means
After a week of nightly runs at a real location, the strip PNG shows seven distinct bands whose Starlink tick counts match an independent spot-check against Heavens-Above for one night within ±10%.

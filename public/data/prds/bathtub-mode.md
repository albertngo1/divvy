## Overview
A browser explorable that turns live water-level gauges into an animated cross-section of a lake sloshing, and sonifies the slosh. For anyone who has wondered why Toledo floods on the same afternoon Buffalo's harbor bottoms out.

## Problem
Seiches are the most legible large-scale physics happening near where millions of people live, and they are invisible. NOAA publishes the data as seven separate sawtooth line charts on seven separate station pages. Nowhere can you see the thing itself: one standing wave, pivoting about a nodal line near Cleveland, ringing down over 40 hours. It is a textbook figure that happens to be real, live, and unrendered.

## How it works
Pick a lake. The page shows a vertical slice along the lake's long axis with the seven stations pinned at their true along-axis positions, the water surface drawn as a live curve, and a scrubber over the last 30 days. Storm events are marked; scrub into one and watch the wind pile water against the east end, release, and oscillate. A meter shows the fitted fundamental period next to Merian's prediction (2L/√(gh) ≈ 14.3 h for Erie, observed ≈ 14.2 h) — the toy validates the physics in front of you. Press play on audio: each mode becomes a sine partial shifted up by 2^22, so the fundamental lands near 82 Hz and a storm becomes a struck bell decaying over the following two days.

## Technical approach
Data from NOAA CO-OPS: `api.tidesandcurrents.noaa.gov/api/prod/datagetter` with `product=water_level&interval=6&datum=IGLD`, stations Toledo 9063085, Marblehead 9063079, Cleveland 9063063, Fairport 9063053, Erie 9063038, Sturgeon Point 9063028, Buffalo 9063020. Wind forcing overlaid from NDBC 45005. Pipeline: gap-fill, remove the annual lake-wide level trend with a 7-day rolling median, then at each timestep least-squares fit amplitudes of the first four cosine modes cos(nπx/L) evaluated at station positions — an overdetermined 7×4 solve, cheap enough to run per frame. Cross-check the mode basis with an EOF/PCA of the station covariance matrix; EOF1 should come out uninodal and EOF2 binodal, which is a nice self-test. Damping Q from the log-decrement of the mode-1 envelope after each event. Front end: plain Canvas + Web Audio, nightly Python job writing a static JSON per lake so there is no live backend.

## v1 scope
- Lake Erie only, last 30 days, mode 1 and mode 2
- One hand-picked historical storm as a permalinked demo
- Merian-vs-fitted period readout
- Audio: two partials, amplitude-mapped, one play button

## Out of scope
Other lakes and fjords, forecasting, ice-cover handling, mobile layout, harbor-scale sub-basin seiches.

## Risks & unknowns
Winter ice cover damps and detunes everything; storm surge (wind setup) and the free oscillation overlap in frequency and are genuinely hard to separate cleanly. Station datum offsets and multi-hour outages during exactly the storms you care about.

## Done means
For the November 2022 Erie event, the fitted mode-1 period lands within 5% of the published 14.2 h and the animated node sits between Fairport and Erie, and the audio render is recognizably a bell.

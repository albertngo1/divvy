## Overview
A browser screensaver-slash-instrument that takes real terrain, raises the water level from the summit down, and turns the *topology* of the flooding into a piece of music. Peaks appear as separate islands, then merge one by one; each merge is a note. It ends on a single surviving island — the last high ground of the place you chose. For people who like generative wallpapers and people who like maps of home.

## Problem
Sea-level-rise visualizations are everywhere and all say the same thing. Meanwhile the actual mathematical structure hiding in any landscape — its merge tree, the record of which summit swallowed which — is gorgeous, computable in a second, and never used as an aesthetic object. Generative music, separately, is drowning in random walks through pentatonic scales. Terrain topology is a score that is not random and not arbitrary.

## How it works
1. Pick a place (search box or drop a pin). It fetches a ~2048×2048 elevation tile.
2. Water rises from the highest point downward over ~3 minutes. Land renders as shaded relief; water as a flat, slowly brightening plane.
3. Every time the rising water crosses a saddle and two islands become one, the *lower* of the two peaks dies (elder rule) and plays a note: pitch from that peak's persistence (summit − saddle elevation), stereo pan from longitude, decay length from the drowned island's area.
4. Big mountains give long low sustained tones; noisy foothills give a shimmer of short high ones. The piece thins out as the map floods, and ends with one drone: the last island.
5. Optional poster export: the merge tree drawn as a dendrogram shaped like an upside-down river system, labeled with real summit names.

## Technical approach
TypeScript + WebGL2 (or WebGPU) + Web Audio, no backend. Elevation from AWS Open Data Terrarium tiles (`elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`, elevation = `(R*256 + G + B/256) − 32768`) — free, global, no API key; OpenTopography/3DEP as a higher-res upgrade path.

Core algorithm: sort pixels by descending elevation, sweep with a union-find; a pixel that touches no existing component births a peak, a pixel that joins two components is a merge event and emits a persistence pair `(birth=higher peak, death=this saddle)`. That is the join tree in O(n α(n)) — fast enough to compute the whole score in a Web Worker before the first frame draws. Rendering is a fragment shader thresholding the elevation texture against a uniform `waterLevel`. Audio is a small FM voice pool driven by a pre-computed event list, so playback is sample-accurate.

The hard part is musical curation: a 4M-pixel DEM emits tens of thousands of merges, mostly one-pixel DEM noise. Persistence-thresholding solves both problems at once — the same simplification that denoises the topology is what makes it playable — plus a per-second event budget that keeps only the highest-persistence merges in each window.

## v1 scope
- One hardcoded region (something dramatic, e.g. the Cuillins or Big Sur)
- Union-find merge tree in a worker
- Flood animation, sine pings, no export
- Single fixed 3-minute duration

## Out of scope
Place search, poster export, real bathymetry, actual climate claims, mobile, saving pieces.

## Risks & unknowns
Flat regions produce a boring piece (needs a "relief score" gate before letting users pick anywhere); Terrarium tiles have voids and seams over water; persistence→pitch may sound arbitrary rather than inevitable until the mapping is tuned by ear.

## Done means
Loading the page plays a 3-minute piece with 40–120 audible note events, ending on exactly one island, with no dropped frames at 1080p on a MacBook Air — and two different mountain ranges sound recognizably different.

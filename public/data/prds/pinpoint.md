## Overview
Pinpoint is a single-player deduction puzzle that turns the privacy debate into a controlled crime scene: given a de-identified location dataset (no name, just a hashed device ID and timestamped lat/longs), you reconstruct a person's life. It's a serious, uncomfortable capability — de-anonymizing 'anonymous' mobility data — rendered as a solvable, synthetic-data toy. Timed to the Virginia geolocation-sale ban and the 'American Privacy Emergency' discourse.

## Problem
Everyone's told 'anonymized location data is safe to sell.' Almost nobody has felt how false that is. A dataset stripped of your name still screams where you sleep, where you work, and where you go at 11pm on Thursdays. People need a visceral, hands-on demonstration — not another explainer.

## How it works
Each level loads a map with a cloud of pings for one synthetic person. You use analysis 'lenses' — cluster by dwell time, filter by hour-of-day, overlay a POI layer — to answer escalating questions: 'Where do they sleep?' (densest 1–5am cluster), 'Where do they work?' (densest 9–5 weekday cluster), then softer inferences ('Which clinic did they visit twice?', 'Are they job-hunting?' from midday visits to a competitor's HQ). Correct deductions unlock the person's 'card' and a one-line real-world lesson ('This is why home address is derivable from 4 timestamps' — echoing the Montjoye result). Later levels add noise, gaps, and decoys.

## Technical approach
Static web app, TypeScript + MapLibre GL (open tiles). All data is synthetically generated — a mobility simulator produces plausible trajectories from a persona template (home node, work node, routine POIs, occasional 'sensitive' visit) with Gaussian GPS noise and realistic dwell distributions, so nothing maps to a real human. Core client logic: DBSCAN over (lat, lng) weighted by dwell time to surface home/work clusters; hour-of-day histograms; and a POI reverse-geocode against a bundled synthetic POI layer. Deductions are checked against the ground-truth persona the generator emitted. The genuinely interesting part is the level generator: it must make each persona uniquely solvable-but-not-trivial, which means tuning cluster separability and decoy density per difficulty tier. Daily seeded puzzle for shared solving.

## v1 scope
- Synthetic mobility generator (1 persona archetype)
- Map + 3 lenses (dwell cluster, hour filter, POI overlay)
- Home/work/gym deduction with checked answers
- Post-level 'why this matters' lesson card
- Daily seeded puzzle

## Out of scope
- Any real or scraped location data (hard no)
- Multiplayer / accounts
- Cross-dataset linkage attacks (v2 concept)

## Risks & unknowns
Must be unmistakably synthetic to avoid being (or looking like) a doxxing tool — framing and data provenance are everything. Balancing 'solvable' vs 'too easy' is the design crux. Some may find the premise queasy; the educational framing has to carry it.

## Done means
A player loads a level of purely synthetic pings, uses the dwell-cluster lens to correctly identify home and work, answers one sensitive-inference question, and reads the lesson card — with a visible confirmation that no real-world location data was ever used.

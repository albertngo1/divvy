## Overview
A browser puzzle/sim that turns *your* repeated commute into playable traffic physics. It ingests your phone's GPS/speed traces, detects recurring "phantom jams" (stop-and-go waves with no incident cause), and lets you replay them as a Nagel-Schreckenberg cellular automaton where you control one car and try to absorb the shockwave. For commuters, traffic nerds, and anyone who's screamed "WHY are we stopping?" on an empty-looking freeway.

## Problem
The arXiv *teLLMe Why* paper does causal analysis of urban driving data at fleet scale — capability locked to researchers. Individually, you have months of your own commute traces sitting in Google Timeline / Strava / a dashcam app and no way to see the *structure* in them: that the daily slowdown at mile 7 is a self-organizing standing wave, not "traffic," and that your own late braking feeds it.

## How it works
Import a GPX/CSV of timestamped lat/lon/speed. The engine map-matches the trace to a road, bins it into a 1-D cell lane, and detects backward-propagating deceleration waves (speed troughs moving upstream against traffic flow) that recur across days at a stable location — the phantom-jam signature. Each detected wave seeds a level: a Nagel-Schreckenberg CA (cells, integer velocities, random-slowdown probability p tuned so the seeded density reproduces *your* observed wave). You drive one highlighted car; your only control is a following-distance / max-braking policy. Score = throughput restored and total brake events avoided downstream. A "replay" mode shows your real recorded drive as one of the CA cars so you can watch yourself cause the jam.

## Technical approach
Stack: plain TypeScript + Canvas, no backend. Parsing: `togeojson`/custom GPX reader. Map-matching v1 is cheap — project points onto a single user-drawn polyline (skip full OSM routing). Wave detection: build a time×position speed heatmap, run a directional gradient filter to find upstream-moving low-speed bands, cluster recurring ones by position across days. Sim: classic Nagel-Schreckenberg (accelerate, brake-to-gap, random slowdown p, move) on a ring/segment; calibrate density + p by fitting to the observed trough depth/period. Hard part: honestly mapping messy consumer GPS (jitter, tunnels, 1 Hz sampling) into a clean enough speed field to (a) prove a phantom wave exists and (b) parameterize the CA so the game feels like *your* commute, not a generic sim.

## v1 scope
- Import one GPX file; user draws the road polyline by hand
- Speed heatmap + auto-highlight of the strongest recurring upstream wave
- One playable Nagel-Schreckenberg level seeded from that wave, keyboard control
- Score + "watch the real you" replay car

## Out of scope
- Real map-matching / multi-lane / on-ramps / OSM integration
- Multiplayer, leaderboards, live navigation
- Causal claims beyond "a recurring upstream wave is present"

## Risks & unknowns
- Consumer GPS may be too coarse to resolve waves on short commutes
- CA calibration from a single trace could be underdetermined
- "You caused it" framing must stay playful, not accusatory

## Done means
Loading a provided sample multi-day GPX produces a heatmap that visibly marks a recurring upstream wave, and generates one playable CA level where a disciplined following policy measurably raises throughput versus a naive one — reproducibly, on the bundled dataset.

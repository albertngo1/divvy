## Overview
Sun Kink is a browser puzzle/sim for infrastructure nerds and train-sim fans. You run a small freight subdivision during a heat wave. Rail steel expands with temperature, and above its 'neutral' setpoint it wants to buckle sideways into a *sun kink* — the exact failure Union Pacific fights by painting rail flanks white. You keep trains moving without derailing anyone.

## Problem
The railroad-rail-heat story on HN is fascinating and totally invisible to the public: nobody knows track has a stress-free temperature, or that dispatchers issue heat slow-orders on 100°F afternoons. That hidden operational drama is begging to be a game — passive trivia turned into a tense resource-management loop.

## How it works
A map of track segments, each with a Rail Neutral Temperature (RNT), current steel temp, and a stress bar. Steel temp = air temp (from a real forecast curve) + solar gain (sun angle, segment orientation, ballast color) + friction from passing trains. As the afternoon advances hour-by-hour, stress climbs on south-facing curves first. Your moves: issue a **slow order** (halves friction gain but delays every train through it), **reroute** a train onto cooler parallel track, **paint** a segment white (permanent −albedo, costs a turn), or **hold** trains in a cool siding. Every train has a delivery deadline; blow it and you lose contract points. Let a stress bar redline under a moving train and it derails — instant loss of that scenario. Score = tonnage delivered on time minus penalties. Daily seed = today's real forecast high for a chosen city, so a brutal Phoenix day is a genuinely hard puzzle.

## Technical approach
Static React + Canvas/SVG front end, no backend needed for v1. Track network is a hand-authored planar graph (nodes = junctions, edges = segments with length, orientation, RNT, albedo). Weather: NOAA/NWS `api.weather.gov` hourly forecast for a lat/lon gives the temperature curve; solar gain from a cheap solar-position formula (NREL SPA-lite) × edge orientation. Rail temp model is a first-order lag toward equilibrium (steel thermal mass → simple exponential). Trains are agents doing shortest-path over the graph with time-windowed deadlines; A* recompute on reroute. The genuinely hard part is tuning the stress model so it's tense but fair, and making derailment feel *earned* not random — deterministic given the seed.

## v1 scope
- One hand-built subdivision (~15 segments, 2 parallel routes)
- Real hourly temp curve for a user-entered city; solar gain by orientation
- Four actions: slow order, reroute, paint, hold
- 3 trains with deadlines; win/lose + shareable score

## Out of scope
- Multiple subdivisions / campaign
- Multiplayer
- Realistic signaling / block occupancy rules
- Cold-weather pull-apart failures (winter mode)

## Risks & unknowns
- Thermal model may be too opaque; needs a clear per-segment 'why it's heating' readout
- NWS API rate limits / CORS — may need to proxy or cache
- Fun ceiling: is one subdivision replayable enough? Daily seed helps

## Done means
On a 100°F seeded day I can lose by ignoring a south curve, replay, issue the right slow order, and deliver all three trains on time — with a score I can share.

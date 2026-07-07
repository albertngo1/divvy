## Overview
Low Bridge is a routing tool for dispatchers and owner-operators hauling oversize/overweight (OS/OW) freight. You enter origin, destination, and load dimensions (height, width, weight, axle spacing); it returns a truck-legal route that avoids every low-clearance bridge, weight-posted span, and length restriction, plus a checklist of which state DOT permits you'll need and roughly what they cost.

## Problem
OS/OW routing is still done by hand: a dispatcher pulls up each state DOT's permit portal, cross-references a paper bridge list, and eyeballs Google Maps. A single missed low bridge is a bridge strike — six figures of damage, a shut highway, and a career-ending citation (see the infamous 11foot8). Consumer nav (Google/Apple) ignores vehicle height entirely; trucker GPS units cost hundreds and have stale bridge data.

## How it works
1. User enters load profile + endpoints.
2. Router runs a shortest-path over a truck-attributed road graph where any edge whose min vertical clearance < load height (with a safety margin), or whose posted weight < gross, is removed.
3. Output: turn-by-turn route, a map with every avoided/nearby restriction pinned, and a permit worksheet listing each state crossed, its OS/OW thresholds, and permit fee estimate.
4. Warnings for spans where clearance data is missing/low-confidence, so the driver knows to physically verify.

## Technical approach
- **Stack:** Python + OSMnx/NetworkX for the graph, PostGIS for spatial joins, a Leaflet/MapLibre frontend.
- **Data sources:** OpenStreetMap `maxheight`/`maxweight`/`maxlength` tags; the FHWA **National Bridge Inventory** (annual public CSV, ~620k bridges) for min vertical underclearance (item 53/54) and operating rating; state DOT OS/OW rule thresholds hand-curated into per-state JSON packs.
- **Data model:** `edges(geom, maxheight_m, maxweight_kg, source, confidence)`, `bridges(nbi_id, geom, vclear_m)`, `state_rules(state, height_threshold, width_threshold, weight_threshold, permit_url, fee_formula)`. Snap NBI points to nearest edge to backfill missing OSM heights.
- **Hard part:** clearance data is dirty and incomplete — OSM `maxheight` coverage is sparse, NBI clearance is measured inconsistently, and truck vs road datum differs. Confidence scoring and conservative defaults (treat unknown underpasses as suspect) are the whole ballgame.

## v1 scope
- One region (e.g. Ohio + neighbors) to bound the data-cleaning.
- Height-only routing (ignore weight/width at first).
- Static NBI + OSM extract, refreshed manually.
- Route + pinned-warning map; no saved trips, no auth.

## Out of scope
- Live permit filing/payment (just link to portals).
- Escort-vehicle and superload routing.
- Real-time construction/closure feeds.

## Risks & unknowns
- Liability: a wrong "clear" is catastrophic — hard disclaimers + confidence flags are mandatory.
- Data freshness; NBI updates annually, OSM continuously.
- Whether height data density is good enough outside metros.

## Done means
Given a 13'6" load between two Ohio cities where a known low bridge sits on the fastest path, the tool returns a route that provably avoids it and lists the correct state permit — verified against that state's official OS/OW map for five test corridors.

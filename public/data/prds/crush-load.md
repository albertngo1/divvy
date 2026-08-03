## Overview
A macOS menubar widget for exactly one trip: your usual stop, your usual direction. It renders live vehicle crowding as a small ordinal glyph with honest uncertainty, so you can decide whether to leave now or wait one headway. For anyone with a daily transit commute on an agency that publishes GTFS-Realtime.

## Problem
Transit apps tell you *when* the train comes, not whether you'll get a seat, and the crowding data that does exist is quietly terrible. GTFS-Realtime has an `occupancy_status` field, but agencies populate it inconsistently: some report it on 10% of vehicles, some emit stale values for hours, some never emit it at all. Apps that surface it render a confident three-bar icon regardless, which is worse than silence — you learn to distrust it and stop looking. Meanwhile "MANY_SEATS_AVAILABLE" means nothing without a baseline: the real question is whether this train is crowded *relative to this route at this hour*.

## How it works
1. Pick agency, route, direction, stop once at setup.
2. Every 30s, poll the agency's GTFS-RT VehiclePositions feed, filter to vehicles on your trip pattern approaching your stop.
3. Display a ~44×16 px glyph: a short horizontal strip where the filled portion is the *deviation from your personal baseline* for this (route, direction, stop, weekday, 15-min bin) — diverging, so "emptier than usual" and "worse than usual" read differently at a glance.
4. Missingness is drawn, not hidden: the fraction of approaching vehicles with no occupancy report (or a report older than 5 minutes) renders as a hatched region of the strip. If the agency gives nothing, the glyph is entirely hatched — you immediately know the data is absent rather than the train is empty.
5. Click for a dropdown: next three vehicles, each with its ordinal level, report age, and the headway-derived bunching proxy.

## Technical approach
Swift + `NSStatusItem`, glyph drawn in Core Graphics. Feed discovery via the Transitland feed registry API (`/api/v2/rest/feeds`) to resolve an agency to its GTFS-RT VehiclePositions URL; protobuf decoding with SwiftProtobuf against `gtfs-realtime.proto`. Static GTFS (`stop_times.txt`, `trips.txt`) is downloaded once and loaded into SQLite to map vehicles onto your trip pattern. Baselines: a rolling per-bin histogram of ordinal levels over the last 8 weeks in SQLite, with the median level as the reference point — ordinal, so no fake averaging of enum values. Fallback when occupancy is never populated: derive a crowding proxy from headway irregularity (two vehicles bunched behind a gap means the leader is packed) and mark the whole glyph as *inferred* with a distinct texture. The hard part is encoding three things — level, baseline deviation, and confidence — in 44 pixels without producing mush; it needs real iteration against a screenshot sheet at menubar scale.

## v1 scope
- One hardcoded agency (whichever local feed actually populates occupancy).
- One saved trip.
- Glyph shows raw ordinal level plus hatched unknown fraction. No baseline yet.
- Dropdown lists next three vehicles as plain text.

## Out of scope
iOS app, notifications, multi-leg trips, route planning, crowdsourced user reports, any agency without GTFS-RT.

## Risks & unknowns
Coverage is the whole ballgame — if your agency reports nothing, v1 is a hatched rectangle. Occupancy semantics differ across agencies (some derive from APC counters, some from load weight). Eight weeks to accumulate a usable baseline is a slow feedback loop for the developer.

## Done means
On a live feed, the glyph changes visibly between a 7:50 rush vehicle and an 11:30 midday vehicle on the same route, and when the agency's occupancy field goes stale during a known outage window, the glyph goes fully hatched without any code change.

## Overview
Anchorage is a play-money daily prediction game built on live vessel-tracking (AIS) data. Ship-watching at anchorages and port approaches is a genuine passive hobby (MarineTraffic has millions of watchers). Anchorage makes it competitive: each day it pits two real inbound cargo ships against each other and players stake points on which one will berth first — or whether a named vessel beats its scheduled ETA.

## Problem
Watching ships crawl toward port is oddly mesmerizing but entirely passive — there's no stakes, no reason to come back, no way to be *right*. Meanwhile supply-chain nerds obsess over port congestion but have no fun outlet. Real logistics uncertainty (tides, pilot availability, congestion, weather) is a perfect natural randomness engine for a prediction market.

## How it works
1. Each morning the system picks 2–3 'matchups': two named vessels both inbound to the same port, currently at sea or at anchor.
2. Players get a map view (last 24h AIS track, speed, distance-to-port, current status) and stake play-money points before a lock time.
3. Resolution: when one vessel's AIS status flips to 'Moored'/at-berth (or crosses a berth geofence), the market settles. Payouts are parimutuel — the pool splits among correct bettors.
4. Streaks, a global leaderboard, and a shareable 'called it' card.

## Technical approach
- **Data:** AISStream.io (free real-time AIS websocket) or the MarineTraffic/Datalastic APIs for vessel positions, status, and destination. Port berth polygons hand-drawn as GeoJSON for a few major ports (LA/Long Beach, Rotterdam, Singapore).
- **Stack:** a Node worker ingesting the AIS websocket into Postgres/PostGIS (`vessel_pings`, `markets`, `bets`); a cron picks matchups by querying vessels with `destination = port` and `status in (underway, at anchor)`; MapLibre GL front-end for the track view.
- **Resolution algorithm:** point-in-polygon test of a vessel's position against the berth geofence, debounced over N consecutive pings to avoid AIS jitter false-positives.
- **Hard part:** AIS is noisy and sparse (position gaps, spoofed/absent destination fields, ships that divert). Robust settlement — deciding when a ship has *really* berthed vs. drifting near the polygon — is the core engineering challenge.

## v1 scope
- One port, one daily two-ship matchup.
- Play-money parimutuel pool, lock time, auto-settlement via geofence.
- Map track view + leaderboard + streak.

## Out of scope
- Real money (regulatory minefield).
- Multi-leg / ETA-margin bets.
- Global port coverage.

## Risks & unknowns
- AIS feed reliability, gaps, and destination-field quality.
- A matchup that never resolves (ship diverts) needs a void rule.
- API cost/rate limits at scale.

## Done means
For one port, the system auto-selects a daily two-ship matchup, accepts play-money bets before lock, and settles correctly via berth geofence within an hour of the winning ship mooring — verified against three real arrivals.

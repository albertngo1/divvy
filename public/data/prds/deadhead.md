## Overview
Deadhead is a browser strategy-puzzle where you run a tiny trucking outfit on real-world roads. Named for trucking's term for driving empty, it's about the invisible cost that Euro Truck Simulator glosses over: the return trips with no cargo. For map nerds and logistics-optimizer types.

## Problem
Truck sims are about the *drive*; real freight economics are about the *routing* — chaining loads so you're never running empty. No game makes the deadhead-minimization puzzle the core loop, and doing it on real geography makes it tangible.

## How it works
You pick a home region (e.g. 'Ohio'). Each turn (a day), a board of available loads appears — origin, destination, weight, pay, deadline — scattered across real cities. You assign loads to your trucks and plan the route order. The game routes each truck over actual roads and charges fuel/time by distance; any leg driven without a load is a deadhead you pay for and earn nothing on. The meta-puzzle is chaining loads so each dropoff is near the next pickup, forming efficient loops. Weekly you see your deadhead % — the pro stat — and try to drive it toward zero. Weather/closures occasionally reroute you.

## Technical approach
Stack: TypeScript + MapLibre GL for the map, OpenStreetMap tiles. Routing via a hosted OSRM or Valhalla instance (self-host OSRM on the region's OSM extract from Geofabrik) for real drive-distance/time between any two points — the routing engine is the load-bearing dependency. Loads are procedurally generated between real city centroids (pull populated places from OSM/Natural Earth) with pay ~ distance × rate + noise. The optimization the *player* does is essentially a vehicle-routing/pickup-delivery problem; the game just scores it — no need to solve VRP yourself, though a 'hint' could call a simple nearest-neighbor heuristic. State in localStorage. The genuinely hard part is tuning economics so minimizing deadhead is always the dominant, legible strategy.

## v1 scope
- One region, OSRM routing, one truck
- Daily load board, assign + order loads
- Fuel cost by real distance, deadhead penalty, weekly deadhead %
- localStorage save

## Out of scope
- Fleet management / multiple trucks
- Weather, closures, traffic
- Multiplayer / global economy
- Mobile

## Risks & unknowns
- Hosting OSRM for a region is some ops lift; matrix queries can be slow at scale
- Balancing so the game isn't just 'shortest path' trivial
- OSM data quality varies by region

## Done means
Playing a week in one region, the UI correctly computes drive distances over real roads, charges deadhead legs, and reports a weekly deadhead % that drops when you chain loads more cleverly.

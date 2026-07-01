## Overview
Endling is a map game about last survivors. Sparked by the Tokyo mugicha story — a city down to two barley-tea makers — it hands you a city and a fading category (the last remaining public bathhouse, cobbler, single-screen cinema, pay phone) and challenges you to drop a pin on the one that's left. It's for map nerds, city romantics, and anyone who liked GeoGuessr but wants a melancholy twist.

## Problem
Dying crafts and civic relics vanish without ceremony, and the tools that know where they are (OpenStreetMap, municipal registries) are read-only reference data nobody plays with. Meanwhile map-browsing is pure passive scrolling. Endling turns "the last one" into something you compete to find.

## How it works
A round shows a city and a category. A clock ticks; you pan the map and drop a pin on the surviving location. Score = proximity to the true answer × speed bonus. After you guess, the map reveals the endling plus a one-line epitaph ("est. 1931, last of 40"). Daily single mode gives everyone the same puzzle for a shareable spoiler-free result grid; a party mode races friends in a room.

## Technical approach
Stack: MapLibre GL + free vector tiles, static front-end, thin WebSocket server (or fully async daily). Data: Overpass API counts tagged amenities within a city's Nominatim relation boundary; a build script sweeps curated tag sets (`amenity=public_bath`, `shop=shoemaker`, `amenity=cinema[screen=1]`, etc.) across ~50 cities and keeps only (city, category) pairs where exactly one — or provably one — result exists. Output is a static `puzzles.json`: `{city, bbox, category, answer_latlon, epitaph}`. Scoring is haversine distance mapped to points. The genuinely hard part is *truth*: OSM completeness varies wildly, so a naive count==1 produces false endlings. Mitigation: a category whitelist chosen for good OSM coverage, a count≤2 tolerance with manual spot-check, and cross-referencing Wikidata where available.

## v1 scope
- Daily single-player puzzle, ~20 hand-verified city+category pairs
- Pin-drop scored by distance, 60-second timer
- Reveal card with epitaph + shareable emoji result grid

## Out of scope
- Live multiplayer rooms
- Global/every-city coverage
- User-submitted categories or crowdsourced answers

## Risks & unknowns
- OSM data gaps create false "last ones" — verification is the whole battle
- Some categories are culturally sensitive; curate respectfully
- Anti-cheat: nothing stops a player googling — lean on the timer and daily social pressure

## Done means
A daily puzzle loads with a real city and category, you drop a pin, receive a distance-based score, see the verified survivor with its epitaph, and can share a spoiler-free result grid.

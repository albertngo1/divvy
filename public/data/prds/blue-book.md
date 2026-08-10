## Overview
Blue Book is a solo, browser-based memory game built on the real street graph of a city you choose. It borrows the structure of the London taxi Knowledge — a book of point-to-point "runs" you must recite from memory — and applies it to wherever you actually live. For people who moved somewhere new, people who navigate exclusively by blue dot, and anyone who read that taxi drivers rarely die of Alzheimer's and felt a twinge.

## Problem
Turn-by-turn navigation means you can live somewhere for five years and hold no map of it. The known fix — effortful spatial recall — has no on-ramp: staring at a map is boring and doesn't test anything. Existing geography games test country shapes, not the street network 400 m from your door.

## How it works
1. Pick a city and a radius. The app builds a run book: ~40 point-to-point runs between named landmarks 1–3 km apart, sampled to cover the network evenly.
2. A run appears: *Leave the Rialto Cinema, set down at Kenner Park.* You type the streets in order, cabbie style — one street name per line, no map, no autocomplete.
3. Scoring walks your typed sequence through the real graph: consecutive streets must share a node, the walk must start and end at the right places. Any legal route counts; you're scored on the ratio of your route's length to the optimal one. A run that connects at 1.15× optimal is a pass.
4. **The erosion.** Every junction and street carries an FSRS memory state. When a junction's predicted retrievability crosses 0.9, its labels are permanently deleted from the study map — the map you're allowed to consult gets emptier as you get better, and only failure restores a label. After enough runs you sit an "appearance": four timed runs, study map fully blank.

## Technical approach
Svelte + MapLibre GL front end; the graph is built offline with a Python script over a Geofabrik `.osm.pbf` extract via osmium — nodes for junctions, edges for `highway=residential|tertiary|secondary|primary|unclassified` carrying `name`, length, and `oneway`. Landmarks come from `amenity`/`tourism`/`shop` nodes with names. Ship the whole graph as a compressed adjacency list (a 5 km-radius city is a few MB) so scoring runs entirely client-side; state persists in IndexedDB. Optimal routes are Dijkstra on edge length. Free-text street matching uses normalized trigram similarity plus an alias table (`ref` tags: A5 ≡ Edgware Road) — no dropdown, because a dropdown leaks the answer. The hard part is generous-but-honest partial credit: a player who names 6 of 8 streets correctly with one gap should see "you lost it at Fenwick Street," which means aligning their sequence against the graph with skips allowed — Needleman-Wunsch over street names against the candidate route set.

## v1 scope
- One hardcoded city extract
- 20 runs, typed street sequence, connectivity + length-ratio scoring
- Three-stage map fade (all labels → arterials only → blank), no FSRS yet
- Pass/fail per run, no timer

## Out of scope
Turn directions ("left into…"), one-way legality, traffic, mobile GPS mode, any multiplayer.

## Risks & unknowns
Typing street names may simply be tedious — needs a playtest before the FSRS work. OSM naming is uneven outside Europe. Runs generated between obscure landmarks can be unlearnable; landmark selection needs a prominence filter.

## Done means
In a city I've never visited, I can pass three consecutive runs with the study map blank, and the app can show me the specific junctions it has permanently erased because I earned them.

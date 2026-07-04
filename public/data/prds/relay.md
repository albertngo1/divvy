## Overview
Relay is a browser puzzle game about the Van der Heyden brothers' real innovation: replacing bucket brigades with a chain of hand-pumps linked by flexible hose that could snake through streets to deliver water *directly* onto a fire. Each level is a small stylized old-Amsterdam district; you're the fire chief laying the relay before the blaze wins.

## Problem
Most firefighting/tower-defense games are about spraying, not *plumbing*. The genuinely interesting historical problem — routing limited hose and staging pumps to maintain pressure over distance — has never been made into a tight little puzzle. It's a spatial-routing itch ("factories are just rooms") dressed in canal-city history.

## How it works
A fire ignites on a building and spreads to adjacent structures on a timer (dense wood-frame blocks spread fast; canals and stone act as firebreaks). Water sources are the canals. You place a limited budget of pumps and drag hose segments from source → pump → pump → nozzle. Pressure at the nozzle is a function of source distance, number of hose bends, and how many pumps boost the line along the way; below a threshold the stream can't reach or douse. Win by soaking the fire before it consumes more than N buildings. Later levels add drawbridges (reroute), wind (biases spread direction), and frozen canals (fewer sources) — historically flavored constraints, each a new routing wrinkle. Pure puzzle: hand-designed levels with a par (fewest pumps / least hose), plus a daily seeded scenario for a shareable score.

## Technical approach
Stack: plain TypeScript + a canvas renderer (or PixiJS); no backend for v1. Map is a hex or square grid of tiles (canal/street/building/stone) authored in a JSON level format — real Amsterdam canal footprints can inspire layouts without needing live GIS. Data model: `Tile[]`, `HoseSegment{from,to}`, `Pump{tile}`, `Fire{tiles, spreadTimer}`. Key algorithms: fire spread as a probabilistic cellular-automaton step over adjacency with material weights; pressure computed by walking the hose graph from source, subtracting per-tile friction and per-bend loss, adding pump boosts (a simple longest-path/accumulation over a DAG). The hard part is tuning spread-rate vs. build-speed vs. pressure math so levels are tense but solvable, and authoring a par that the solver can verify.

## v1 scope
- Square-grid renderer, 3 material types (building/canal/stone)
- Hose-drag + pump-place with a budget
- Pressure model (distance + bends + pump boosts) gating the stream
- CA fire spread on a timer; win/lose check
- 6 hand-made levels

## Out of scope
- Real GIS/historical map import, multiplayer, campaign/story, sound design, mobile touch polish.

## Risks & unknowns
- Pressure + spread tuning is the whole game; could feel fiddly or trivial.
- Hose-routing UX on a grid is easy to make frustrating.
- Historical framing is charming but load-bearing — needs a light touch, not a lecture.

## Done means
A player can complete level 1 by building a canal→pump→nozzle relay that douses the fire before it spreads past 3 buildings, and an under-pressure (too-long, too-many-bends) chain visibly fails to reach — verified in a playthrough recording.

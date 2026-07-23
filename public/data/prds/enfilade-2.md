## Overview
Enfilade turns *A Pattern Language* — 253 architectural patterns, each explicitly referencing "larger" and "smaller" patterns — into a beautiful navigable network you can wander. It's for designers, urbanists, and software people who cite the book but have never *seen* its structure. The name is the architectural term for a suite of rooms aligned so you can see straight through them.

## Problem
The patterns form one of the most famous hand-authored graphs in design history: every pattern ends with links up (contexts it completes) and down (patterns that complete it). Yet nobody has made that graph beautiful or explorable. The book is read linearly; its actual shape — clusters from Towns to Buildings to Construction, the hub patterns everything leans on — is invisible.

## How it works
Open Enfilade and you land on a force-directed constellation of 253 nodes, colored by the book's three scales and sized by in-degree (how many patterns depend on this one). Click a pattern and the view eases into it: its summary, its "drawn from" upstream doorways and "leads to" downstream ones, and a highlighted path. A "walk" mode traces an enfilade — pick a start and end pattern and it animates the shortest chain of doorways between them (e.g. from *Independent Regions* down to *Ornament*). A "neighborhoods" toggle runs community detection and names the clusters. Everything is deep-linkable and pannable, tuned to feel like drifting through a city at dusk.

## Technical approach
Stack: a static site — the graph is fixed, so no backend. Data: transcribe the 253 pattern titles, scales, one-line summaries, and the up/down reference lists into a single `patterns.json` (nodes + directed edges); this hand-curation is the real work and the moat. Rendering: `d3-force` for layout precomputed offline into stable coordinates (deterministic seed), then drawn on a WebGL/regl canvas for smooth pan/zoom at 253 nodes + ~1000 edges. Louvain community detection (graphology) for neighborhoods; BFS/Dijkstra for enfilade walks. Typography and a muted architectural palette do the aesthetic lifting (see the dataviz color method). Hard part: a layout that reads as "city, not hairball" — likely a scale-banded radial constraint so Towns sit outside, Construction inside, mirroring the book's zoom.

## v1 scope
- `patterns.json` with all 253 nodes and their directed references
- Precomputed force layout, WebGL render, pan/zoom, click-to-focus panel
- Color by scale, size by in-degree, deep-linkable node URLs

## Out of scope
- Full pattern text (link out to the book; show summaries only)
- User-authored patterns or editing
- Mobile-optimized touch gestures beyond basic pinch

## Risks & unknowns
- Copyright: use only titles, short summaries, and the reference structure (facts), not full prose
- Transcription accuracy of 253×~8 references
- Whether the layout reads as legible without heavy manual tuning

## Done means
All 253 patterns load in under two seconds, every node's up/down doorways match the book, and "walk" mode returns a correct doorway chain between any two connected patterns.

## Overview
Skein is a browser tool + explorable explanation for edge and trail bundling — the technique that turns an unreadable node-link 'hairball' into flowing, cable-like bundles. You paste an edge list or drop a CSV and get an interactive bundled graph with a strength slider; alongside it, a short guided explainer (built from the recent bundling task-taxonomy) teaches which questions bundling helps answer and which it quietly distorts. For data journalists, analysts, and students who keep making illegible network diagrams.

## Problem
Edge bundling is beautiful and genuinely useful, but the good implementations live in academic C++ or gnarly D3 gists, and most people who'd benefit (someone with a flight-route CSV or an org co-authorship graph) can't get from data to a clean bundled image without a research afternoon. Worse, bundling *lies* a little — it implies flows that aren't there — and nobody explains the tradeoffs. It's a cheap capability trapped behind expertise.

## How it works
Upload a CSV of edges (optional node coordinates or a category column). Skein lays out nodes (given coords, or a force / radial layout) and computes force-directed edge bundling, exposing the two knobs that matter: bundling strength and a compatibility threshold (how similar two edges must be to attract). A live slider morphs from raw straight lines to tight bundles so you *see* what merges. A second panel walks the bundling task taxonomy as concrete challenges on your own data: 'find the outlier route' (bundling hides it — here's why), 'trace this trail end to end' (bundling helps — follow the cable), 'estimate total flow between regions'. Export SVG/PNG.

## Technical approach
Pure client-side: TypeScript + Canvas/WebGL (regl) for rendering, no server. Core algorithm is Holten & van Wijk force-directed edge bundling — subdivide each edge into control points, compute pairwise edge compatibility (angle, scale, position, visibility), then iterate spring + electrostatic forces between compatible subdivision points, doubling subdivisions over cycles. For large graphs, KDBundling-style spatial hashing on midpoints to avoid O(E²) compatibility, and GPU instancing to draw thousands of curved segments. Ships with sample datasets (OpenFlights US routes, a co-authorship graph). The genuinely hard part is performance: FDEB is quadratic, so the interactive slider needs precomputed bundle states at a few strength levels plus interpolation, and a hard cap with an honest 'sampled to N edges' notice.

## v1 scope
- CSV drop → bundled render with strength + compatibility sliders
- One bundled OpenFlights sample preloaded
- Two taxonomy challenges (trace-a-trail, spot-the-outlier) as overlays
- SVG/PNG export

## Out of scope
- Directed/animated flow, hierarchical (HEB) bundling, 3D
- Server-side compute or datasets over ~5k edges without sampling
- Editing the graph in-tool

## Risks & unknowns
- FDEB performance in-browser above a few thousand edges; may need aggressive sampling
- Bundled output can mislead — the explainer must land or the tool does harm
- Layout quality for graphs without supplied coordinates

## Done means
Dropping an OpenFlights-style CSV produces a legible bundled map within a couple seconds, the strength slider visibly morphs raw→bundled at interactive framerate for ≤2k edges, at least one taxonomy challenge correctly demonstrates a bundling tradeoff on the user's own data, and SVG export opens cleanly in a vector editor.

## Overview
Exploded View turns a code module into a printable Lego-style building-instruction booklet: an exploded isometric diagram plus numbered steps showing components clicking into place in dependency order. For developers onboarding to a repo, or anyone who wants a genuinely charming architecture poster.

## Problem
Architecture diagrams are either soulless auto-generated boxes-and-arrows or lovingly hand-drawn and instantly stale. The 'Lego building instructions through time' HN piece is a reminder that step-by-step *assembly* is a beautiful, universally legible teaching format — and nobody has stolen it for code. Reading a dependency graph is passive; a build manual makes you *assemble* the mental model.

## How it works
You give it a directory (or a single entry module). It parses the import/require graph, topologically orders the nodes so dependencies are placed before dependents, and lays them out as isometric 'bricks' — size by lines-of-code, color by file type/layer. It emits a multi-page manual: page 1 shows the finished 'model,' then each subsequent page adds one component (or one cohesive cluster) with a callout arrow, a step number, and a small parts-count badge (functions/exports). The final artifact is an SVG/PDF you can print. A '+1' brick highlight per step mimics the Lego 'new pieces this step' convention.

## Technical approach
CLI in TypeScript. Dependency extraction via `ts-morph`/`madge` for JS/TS (pluggable parsers later). Graph → topo sort (Kahn's), then cluster tightly-coupled files with a cheap community detection (Louvain on the import graph) so steps group sensibly. Layout: project each node onto an isometric grid; brick footprint ∝ LoC, height ∝ export count; greedy shelf-packing to avoid overlap, with exploded offsets computed along the iso Z-axis per assembly step. Rendering is hand-rolled SVG (iso projection = simple 2:1 affine transform) with a chunky flat-shaded 'instruction manual' palette. PDF via `svg-to-pdfkit`. The genuinely hard part is step *granularity* — one brick per file is too many pages, one per folder too coarse; the clustering + a target 'steps per page' knob is the real design work.

## v1 scope
- JS/TS only, single directory input
- Topo-ordered steps, LoC-sized iso bricks, type-colored
- Multi-page SVG export with step numbers + 'new this step' highlight
- One printable PDF

## Out of scope
- Non-JS languages
- Interactive/animated web viewer
- Runtime/call-graph analysis (imports only)
- 'Through time' git-history animation (tempting v2)

## Risks & unknowns
- Iso packing of large repos may overflow pages ugly-fast; needs sane max-node cap
- Import graphs with heavy cycles break clean topo order — need cycle-collapse
- Aesthetic is everything here; if it looks like Graphviz it fails

## Done means
Running it on a real ~30-file TS module produces a legible ≤8-page PDF where following the steps in order actually teaches you the module's layers, and it looks unmistakably like a Lego manual.

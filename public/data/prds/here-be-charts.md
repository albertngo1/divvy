## Overview

An explorable explanation arguing that "bar chart" and "heatmap" are not categories but *regions* in a continuous space of visual encodings. You get one fixed dataset, a map of a few thousand renderable charts of it, and the ability to drag from one named type to another and watch the unnamed intermediates. For anyone who teaches, designs, or argues about visualization.

## Problem

Every viz curriculum starts with a taxonomy — a chart chooser flowchart, a picker menu, a gallery of blessed types. That framing hides the actual structure: the grammar of graphics generates a continuum, and the named types are a historical accident of which points in it got popular enough to earn a noun. Nobody can *see* that continuum, so "what chart should I use" stays a lookup instead of a design decision.

## How it works

1. One dataset, fixed: four columns (a date, two quantitative, one low-cardinality nominal) — say daily rainfall by station.
2. We enumerate the Vega-Lite parameter space: mark ∈ {bar, point, line, area, tick, rect, arc, boxplot}, x/y channel type ∈ {quantitative, temporal, ordinal, nominal}, aggregate ∈ {none, sum, mean, count, median}, bin on/off, color channel assignment, stack ∈ {none, zero, normalize}, orientation. Cull anything Vega-Lite refuses to compile → a few thousand valid specs.
3. Each renders to a 64×64 thumbnail. Two embeddings, one toggle: **spec space** (one-hot parameter vector, Gower distance) and **pixel space** (downscaled grayscale → PCA → UMAP). The toggle is the payload — it shows charts that look identical but are specified completely differently, and specs one parameter apart that look nothing alike.
4. Named types are labeled from the Vega-Lite example gallery and drawn as translucent alpha-shape hulls. They overlap. Large valid regions fall outside every hull; those get labeled *no common name* and hovering one gives it a provisional description.
5. Drag a path between two labeled wells and the page morphs the chart along it, one spec at a time.

## Technical approach

- Offline generation in Node: `vega-lite` compile → `vega` → `sharp` for PNG, all in a build script; failures logged as invalid and used to draw the *boundary of validity*, which is itself interesting.
- Embedding with `umap-js` at build time; output is a single JSON of `{id, x, y, spec, thumbURL, namedType|null}`.
- Front-end: plain canvas scatter with a quadtree for hit-testing (thousands of points, no SVG), thumbnails as a sprite atlas so hover is instant. Morph on drag by re-running `vega-embed` on the interpolated spec sequence.
- Named-type labeling: rule-based predicates over the spec (e.g. `mark=rect ∧ x:ordinal ∧ y:ordinal ∧ color:quantitative → heatmap`), hand-written for ~15 types.
- Hard part is honest: pixel-space distance on chart images is dominated by ink coverage and axis furniture, so the map can cluster by "how dark" rather than "what encoding." Mitigation: strip axes/legends before embedding, and normalize ink density. Second hard part: many valid specs are visually useless (temporal on both axes) — I plan to keep them and mark them, since the wasteland around the named wells is part of the argument.

## v1 scope

- 1 dataset, 3 marks, ~300 specs.
- Static UMAP JSON, canvas scatter, hover shows thumbnail + spec JSON.
- 5 named-type hulls, hand-drawn if the alpha shapes look bad.
- No morph animation — clicking two points shows the spec diff as text.

## Out of scope

Upload-your-own-data, 3D marks, faceting/layering/concatenation, interactive specs, any claim that the layout is metrically meaningful.

## Risks & unknowns

The map may be trivially structured (three obvious blobs by mark type) and prove nothing. Alpha shapes over a UMAP projection are cartographic license, not math — the writing has to say so. Might read as a toy rather than an argument.

## Done means

You can click a labeled bar chart, click a labeled heatmap, and the page shows at least five valid intermediate specs between them, of which three match no named-type predicate.

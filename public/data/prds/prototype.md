## Overview
Prototype is a reflective drawing toy sparked by the 'Billions of Sketches Reveal Hidden Cultural Variation' paper. You sketch everyday concepts; it shows where your version lands in the global cloud of how humans draw that thing — how typical, how idiosyncratic, and which cultural cluster it resembles. The name nods to prototype theory: the 'most average' member of a category. For anyone curious what their unconscious defaults reveal.

## Problem
We assume our mental image of 'a cup' is universal. It isn't — handle side, silhouette, whether a 'sandwich' is stacked or open varies by culture and habit. There's no everyday way to *see* your own priors, only reassuring folk belief that everyone pictures things the same way.

## How it works
A prompt appears ('draw a teapot'). You doodle on a canvas with a timer, Pictionary-style. On submit, it places your sketch as a point in a 2D map of that concept's global sketch space, surrounded by faint sample drawings from real players worldwide. You get: a **typicality score** (how central), your **nearest cultural cluster**, and a highlighted feature that made you an outlier ('you drew the spout on the left; 80% draw it right'). Over a session it builds a personal 'default profile' — the concepts where you're most and least typical.

## Technical approach
Built on Google's Quick, Draw! open dataset (50M+ labeled sketches across 345 categories, with country metadata). Offline, precompute per-category embeddings: rasterize sketches, run a small CNN (or stroke-sequence features — stroke count, order, bounding-box aspect, ink centroid) → embeddings → UMAP to 2D, plus per-country centroids. Ship the reduced coordinates + a KD-tree per category as static assets. At runtime the user's sketch is embedded client-side (ONNX/TF.js small model), projected via the frozen UMAP transform, and nearest-neighbor'd against the tree — no server. Hard part: making a stranger's messy doodle land somewhere honest given Quick, Draw!'s own noise, and keeping the projection stable enough that the 'outlier feature' callouts feel true rather than random.

## v1 scope
- 10 concept prompts with precomputed maps
- Canvas + client-side embedding + 2D placement over sample cloud
- Typicality score + nearest-country-cluster label
- One 'what made you an outlier' feature callout per sketch

## Out of scope
- Accounts, saved history, longitudinal tracking
- Full 345-category coverage
- Multiplayer / social feed

## Risks & unknowns
- 'Cultural cluster' claims are fuzzy — must be framed playfully, not as science
- Client-side embedding model size vs. accuracy tradeoff
- Quick, Draw! label noise could make outlier callouts feel arbitrary

## Done means
A visitor draws three prompts, sees each placed in a cloud of real sketches with a typicality score and an honest, legible reason they're an outlier — fully client-side, no login, and it feels like a small mirror rather than a quiz.

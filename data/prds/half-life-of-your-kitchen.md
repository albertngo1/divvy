## Overview

Take a photo of one room (a kitchen counter, a desk), tag the objects in it, and each object gets remapped to how long its material actually persists in the environment: banana peel (2 weeks), cotton dishrag (5 months), aluminum can (200 years), porcelain mug (1 million years), granite countertop (geologic). The output is the room re-rendered as a "timeline tower" — the same scene, but objects stacked and scaled by persistence, so the ephemeral stuff sits at the bottom and the near-eternal stuff towers into deep time. One shareable PNG.

## Problem

Everyone has seen the "how long does trash take to decompose" listicle, but it's an abstract table of numbers detached from your own stuff. Nobody feels the 8-order-of-magnitude gap between the peel they'll compost tonight and the mug they're drinking from. There is no artifact that takes *your* room and re-renders it along a persistence axis — making material half-life a spatial, personal thing instead of a listicle.

## How it works

1. User uploads or shoots a photo of a scene.
2. User tags objects by picking from a curated dropdown of ~30 common household objects (each pre-mapped to a material + persistence estimate).
3. Each tagged object is placed on a logarithmic vertical time axis by its material's decomposition/persistence figure.
4. The scene re-renders as a "tower": short-lived objects clustered at the base, durable ones rising through labeled deep-time bands (weeks → years → centuries → geologic).
5. Export to one PNG with the time axis labeled.

## Technical approach — stack, data, model, hard part

**Stack:** Static SPA (Vite + Svelte), Canvas for compositing the tower, no backend. Object thumbnails cropped client-side from the upload or represented by icons.

**Data sources:** No single clean API exists for material persistence, so v1 uses a **curated JSON of ~30 objects** hand-sourced from published figures: NOAA marine-debris timelines, WRAP/EPA decomposition estimates, and materials-science persistence literature. Schema: `Material { name, objects[], persistenceYears, source, uncertaintyBand }`. Each dropdown object references a material.

**Data model:** `TaggedObject { id, label, material, persistenceYears, bbox|icon, x }`. Scene = ordered list of TaggedObjects laid out on a log axis.

**Key algorithm:** Map persistenceYears → y-position via `y = f(log10(years))` across a fixed range (2 weeks ≈ 0.04y to 10^6y). Bucket into labeled deep-time bands; jitter x to avoid overlap; draw connector from original object footprint to its tower slot.

**Hard part:** Material tagging accuracy from a real photo. v1 dodges this entirely with the curated dropdown — the user asserts the material rather than a CV model guessing. The persistence numbers themselves are wide ranges, so present them as bands, not points.

Ships as one shareable PNG.

## v1 scope (humiliatingly small)

- Curated 30-object dropdown, no photo CV/auto-detection.
- No real photo compositing — objects shown as labeled icons on the axis.
- Fixed set of deep-time bands, no zoom.
- Single scene, one tower.

## Out of scope (for now)

- Automatic object detection / segmentation from the photo.
- User-added custom materials.
- Multi-room / whole-house aggregation.
- Animation of decay over time.

## Risks & unknowns

- **Prior-art verdict: Partial.** Decomposition-timeline listicles are everywhere, but no photo → tagged-room → timeline-tower artifact exists. The novelty is the personal-scene-as-persistence-axis move, not the numbers.
- Persistence figures are contested and range-heavy (esp. plastics, "1My" for ceramics is illustrative) — must show uncertainty and cite sources to avoid pushback.
- Without real photo compositing, the "your room" hook is weaker in v1 (icons vs. actual objects).

## Done means

- User tags 5+ objects from the dropdown and a labeled log-scale tower renders with each object at its correct persistence band.
- Deep-time bands (weeks/years/centuries/geologic) are legible and sourced.
- "Export PNG" produces a single image of the tower with the axis and object labels.

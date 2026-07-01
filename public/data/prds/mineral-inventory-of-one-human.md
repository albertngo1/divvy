## Overview

A human body is ~60 chemical elements. This maps each of them not to an abstract "you contain 1.4kg of calcium" table, but to the *specific mines and deposits* that dominate global supply of that element today. A body silhouette, and from each element, a ribbon reaching out to a real pit on Earth: your iron to the Carajás mine in Brazil, your phosphorus to the Bou Craa deposit in Western Sahara. The share is one PNG: a silhouette laced with ribbons to real holes in the ground.

## Problem

"The elements in your body" is a classic science-explainer table, and USGS mine-location maps exist separately. But nobody has joined them: no artifact says *where on Earth the stuff you're made of is actually dug up*. It reframes the body not as a chemistry list but as a supply chain — your calcium, iron, and phosphorus have geographic origins, and seeing the ribbons connect a silhouette to specific pits makes materiality visceral.

## How it works

1. App loads a fixed body-composition table (~20 significant elements by mass + a few trace ones).
2. For each element, it looks up the dominant global producer(s) / flagship deposit from USGS data.
3. It renders a body silhouette; each element gets a labeled anchor point, with a ribbon arcing out to the real deposit's location on a small world map.
4. Optional: scale a ribbon's weight by the element's mass fraction in the body.
5. Export to one PNG: silhouette + ribbons + world map.

## Technical approach — stack, data, model, hard part

**Stack:** Static SPA (Vite + Svelte), SVG for the silhouette + ribbons, a lightweight world basemap (D3-geo + TopoJSON, no tiles needed). No backend — all data precompiled to JSON.

**Data sources:**
- **USGS Mineral Commodity Summaries** (annual PDF/CSV): per-commodity top producing countries and reserves. Hand-extract the dominant producer + a flagship deposit per element into JSON.
- Body-composition constants from standard reference-man figures (public-domain physiology tables).
- Deposit coordinates hand-geocoded (Carajás, Bayan Obo, Escondida, Bou Craa, etc.).

**Data model:** `Element { symbol, name, bodyMassGrams, topProducerCountry, flagshipDeposit, depositLatLon, source }`. Body = array of Elements; each maps to one ribbon.

**Key algorithm:** Anchor placement — distribute element labels around the silhouette without overlap (simple force/angular layout). Ribbon = quadratic Bézier from the silhouette anchor to the projected deposit coordinate; stroke width ∝ log(bodyMassGrams) so calcium/carbon read big and trace elements stay thin.

**Hard part:** Curating a defensible "which mine is *your* element from" mapping. Supply chains are diffuse — no single mine sources your body's iron. v1 makes an honest simplification: "dominant global producer of this commodity," clearly labeled, sourced to USGS, not a literal claim about your atoms.

Ships as one shareable PNG.

## v1 scope (humiliatingly small)

- Fixed body-composition table (single reference human, no personalization).
- ~15 elements only (the big-mass ones + a few famous traces).
- One flagship deposit per element.
- Static silhouette, no body-shape customization.

## Out of scope (for now)

- Personalized body mass / composition input.
- Full 60-element coverage.
- Real supply-chain multi-source modeling.
- Interactive drill-down into each mine.

## Risks & unknowns

- **Prior-art verdict: Partial.** "Elements in your body" tables + USGS mine maps both exist, but no silhouette → specific-pit ribbon artifact does. Novelty is the join, not the datasets.
- The "your iron is from Carajás" claim is a deliberate oversimplification — must be framed as "dominant producer" to stay honest.
- Lowest Fun/Novel scores of the round (7/7); the Wow depends entirely on ribbon-layout craft.

## Done means

- App renders a body silhouette with ≥15 elements, each connected by a ribbon to a real, correctly-placed deposit on a world map.
- Ribbon weights reflect element mass fraction; every mapping cites USGS.
- "Export PNG" produces one image: silhouette + ribbons + map, downloadable in one click.

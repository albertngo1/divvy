## Overview
Unfold is a web app that does sheet-metal *pattern development*: given a parametric duct fitting (square-to-round transition, offset, elbow, cone, breeches), it computes the flattened 2D cut pattern with fold lines and seam allowances and exports a DXF/PDF plus a materials cut list. For small HVAC and sheet-metal shops that can't justify a $5k+ seat of specialized layout software.

## Problem
Unfolding a 3D transition piece into a flat sheet is a classic, genuinely hard geometry chore — traditionally done by hand with *triangulation* on paper, or with pricey legacy CAD/CAM suites. Small shops and one-truck fabricators either eat the manual layout time (and the scrap from mistakes) or over-buy software built for enterprise. There's a wide gap for a cheap, parametric, browser-based fitting library that just spits out correct patterns.

## How it works
Pick a fitting type and fill in a short form (top W×D, bottom diameter, height, offset, throat/heel radius, gauge, seam type). The engine builds the 3D fitting as a set of ruled surfaces, subdivides them into triangles (the triangulation method every sheet-metal handbook teaches), then flattens by walking the triangle strip and preserving each edge's true length — laying triangles down one edge at a time into the plane. It adds gauge-dependent seam/lock allowances and bend-line marks, then renders the nested flat pattern. Export gives DXF (for plasma/laser/waterjet) and a printable full-scale PDF tiled across sheets, plus material area and a bounding-stock cut list.

## Technical approach
Stack: TypeScript, Three.js for the 3D preview, a pure-geometry core (no CAD kernel needed). Data model: fitting = parametric spec → array of quad/triangle faces with 3D vertices. Flattening: triangulate each ruled band; compute true edge lengths; unfold via successive triangle placement (each new triangle solved by two-circle intersection from the two already-placed shared vertices) — this is exactly hand triangulation, made exact. Seam allowance = offset polygon by gauge table (K-factor for bend deduction on brake-formed edges). DXF export via a small writer (LINE/ARC/POLYLINE entities on CUT and FOLD layers). Hard part: correctness across fitting types and matching real bend-allowance/K-factor conventions so the folded part actually closes to spec.

## v1 scope
- One fitting: concentric & offset square-to-round transition
- True-length triangulation flattening with live 3D preview
- Gauge-based seam allowance + fold lines
- DXF + tiled full-scale PDF export

## Out of scope
- Elbows, tees, breeches, cones (later fitting library)
- Nesting-for-yield optimization across many parts
- Direct machine/postprocessor integration

## Risks & unknowns
- Bend-allowance/K-factor accuracy — needs validation against real folded test parts
- Whether shops trust a browser tool enough to cut metal from it
- DXF layer conventions vary by machine/shop

## Done means
A fabricator enters a real offset square-to-round spec, cuts the exported DXF, brakes it on the marked fold lines, and the piece closes to the intended dimensions within one gauge thickness — no hand rework.

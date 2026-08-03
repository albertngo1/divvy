## Overview

A browser toy-slash-tool for people who bend wire: jewelers, luthiers, model builders, bike tinkerers, anyone with a spool of music wire and a pair of round-nose pliers. You sketch the shape you want; it simulates elastic-plastic bending and tells you the shape you must bend to *get* that shape after release.

## Problem

Wire is a liar. Bend 1.2 mm music wire 90° around a 3 mm mandrel and let go, and you get about 78° — the elastic core unloads and drags the plastic hinge back. Makers handle this by bending, measuring, cursing, and over-bending by feel, one spool at a time, and the feel doesn't transfer when the diameter or alloy changes. Meanwhile the physics is a solved 19th-century problem sitting in textbooks nobody bending wire has read.

## How it works

Canvas: draw a polyline centerline, drag to fillet corners into real bend radii. Pick material and gauge from a dropdown (304 stainless, ASTM A228 music wire, 1018 mild, 6061-T6, C260 brass) and a tool radius (your pliers, a mandrel, a dowel). The sim shows two overlaid curves live: **as-bent** (dashed, what your hands do) and **as-released** (solid, what you get). You edit the *target*, and the tool inverse-solves the as-bent curve — so the dashed ghost drifts past your drawing, angle by angle.

Output: a per-bend table (`bend 3: form to 104° to land 90°`), and a to-scale PDF jig — peg coordinates on a ¼-inch pegboard grid plus the bend sequence — that you tape to the bench.

The feature that makes it real: **one-point calibration.** Bend one 90° test tab from your actual spool, photograph it against the printed protractor sheet, type the measured angle. The tool back-solves the effective yield strength for *that* wire and rewrites every number. Drawn wire work-hardens unpredictably; one measurement beats any table.

## Technical approach

TypeScript + three.js, no backend. The forward model is a discrete elastic rod (Bergou et al. 2008) for large-deflection shape, with a per-node elastic-plastic moment–curvature law rather than pure Hooke: for a circular section the shape factor is 1.7, so the section fully yields at M_p = 1.7·M_e, and the released curvature is κ_final = κ_applied − M/(EI). Springback angle follows from integrating the unloaded curvature over the bend arc.

Material data: E and σ_y hand-entered from public mill datasheets, plus Shigley's spring-wire relation σ_ut = A·d^(−m) (A228: A=2211 MPa·mm^m, m=0.145) so yield scales correctly with diameter instead of using one wrong number for the whole gauge range.

Inverse solve: Newton iteration on applied bend angle per hinge, 5–8 iterations to hit the target within 0.1° — cheap because the map is monotone and nearly linear away from the fully-plastic knee. Calibration is a 1-D secant solve on σ_y.

The hard part is the Bauschinger effect and springback *of the springback*: over-bending past target then relieving is a reverse-loading path the monotone model gets wrong by several degrees on tight radii, and tight radii are exactly where people need it.

## v1 scope

- Single bend, not a whole shape
- Three materials, six gauges, hardcoded constants
- Analytic circular-section springback formula — no rod sim yet
- Number in, number out; a static SVG of the two arcs
- No jig PDF, no photo calibration (type the measured angle)

## Out of scope

Sheet metal, tube bending, 3D non-planar shapes, torsion springs, CNC bender G-code export, an alloy database beyond five entries.

## Risks & unknowns

Hand tools apply uncontrolled bend radius, so predictions may fall inside the noise of human technique. Coiled wire arrives with residual curvature. Reverse-bend accuracy is the open question — may need a two-surface hardening model.

## Done means

Bend ten 90° targets in 1.2 mm music wire using only the tool's over-bend numbers after a single calibration bend; eight of ten measure within ±3° of 90°, versus a by-feel control group of the same ten that lands within ±10°.

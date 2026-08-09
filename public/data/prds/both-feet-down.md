## Overview

An explorable explanation of earthing grids: you lay out buried copper conductors and ground rods on a plan view, dial in soil resistivity and fault current, and the surface potential field renders live as contours. A draggable mannequin reports the actual voltage across its two feet and between hand and foot, against the IEEE Std 80 tolerable limits for its body weight and the fault clearing time. For anyone who read that a mesh of buried wire "doubles the strength of the ground" and wanted to feel why.

## Problem

Grounding is the least intuitive part of electrical engineering and is taught almost entirely as algebra. The counterintuitive facts — that a single deep rod can be *worse* than a shallow mesh, that four inches of crushed rock is worth more than tons of copper, that the deadly gradient is at the grid's corners and edges rather than its center, that standing with your feet together is a legitimate life-saving technique — are all spatial, and there is no toy that shows them.

## How it works

Canvas plan view of a fenced yard. Tools: draw conductor runs on a snapping grid, drop 3m/10m rods, set burial depth, paint a crushed-rock surface layer. Sliders: upper/lower soil resistivity and layer thickness (with presets — wet clay, dry sand, permafrost), fault current, clearing time, whether the fence is bonded. Output: a heatmap of surface potential as a fraction of ground potential rise, isopotential contours, and two derived overlays — step-unsafe and touch-unsafe regions — recomputed on drag. Scenario mode scores you: pass the fault with every walkable square safe, using the least copper. A mischief button injects the classic mistakes (unbonded fence, grid too shallow, rods only at the center) and shows the body current in milliamps.

## Technical approach

TypeScript + WebGL for the field render, physics in a Rust→WASM module. Discretize every conductor and rod into ~1m line segments carrying unknown leakage current; assemble the mutual resistance matrix between segments using the point-current Green's function for a two-layer half-space, evaluated as a truncated image series with reflection factor K = (ρ2−ρ1)/(ρ2+ρ1) (20–30 image terms converges for realistic K). Solve the dense system for equal-potential conductors — a few hundred unknowns, LU in milliseconds — which yields grid resistance Rg and the leakage distribution directly, no empirical Schwarz formula needed. Superpose segment contributions onto a 256×256 surface sample to get the potential map. Tolerable limits from Dalziel: E_step = (1000 + 6·Cs·ρs)·0.116/√t, E_touch = (1000 + 1.5·Cs·ρs)·0.116/√t, with the surface-layer derating Cs computed from its own image series. The hard part is numerical: near-field self-resistance of a segment needs the finite-radius correction, and the image series is slow to converge for high-contrast layers — validated against the worked examples in IEEE 80 Annex B, which give published Rg, Em and Es numbers to match within a few percent.

## v1 scope

- Uniform soil only (no second layer)
- Rectangular mesh generated from spacing sliders, not freehand drawing
- Static heatmap + step/touch overlays + mannequin readout
- One scenario with a pass/fail check

## Out of scope

Transient/lightning response, soil ionization, transferred potential off-site, 3D view, split fault current factor.

## Risks & unknowns

Two-layer image series may need acceleration to stay interactive. Real practitioners will demand CDEGS-grade accuracy this will not have — framing must stay "explorable, not design tool."

## Done means

The Annex B example grid reproduces published Rg, mesh voltage and step voltage within 5%, and dragging the mannequin from grid center to an outside corner visibly flips the touch overlay from safe to unsafe.

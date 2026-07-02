## Overview
Die Set is a 2D physics toy sparked by the 'how do wombats poop cubes' story: it turns out cube pellets form because intestinal walls have regions of differing stiffness that pinch soft material into facets. Die Set lets you paint a stiffness/contraction map around a cross-section and watch the emergent shape. It looks like a giggle-worthy poop-shape generator; it's secretly a lightweight design sandbox for extrusion dies and pelletizing (pharma tablets, catalyst pellets, pasta).

## Problem
Shape-forming from soft matter under non-uniform confinement is deeply unintuitive — engineers who design extrusion dies or pill presses iterate expensively in the physical world. There's no cheap, playful place to build intuition for 'this stiffness pattern → that cross-section.' Meanwhile the wombat result is a perfect, funny hook that nobody has turned into a tool.

## How it works
You see a soft blob (mass-spring / particle field) inside a ring you can paint: brush stiffness, brush contraction strength, place rigid pins. Hit 'squeeze' and a peristaltic contraction cycle runs; the blob deforms and, over cycles, faceted regions emerge where stiff bands meet soft ones. A readout shows the resulting cross-section outline, corner sharpness, and symmetry. A 'toy mode' framing (wombat cubes, star pasta) and a 'design mode' framing (label axes in mm, export the outline as SVG/DXF) share one engine. Challenge presets: 'make a square', 'make a hex pellet'.

## Technical approach
Stack: TypeScript + a 2D soft-body solver (Verlet mass-spring lattice or position-based dynamics) on canvas/WebGL; no server. Data model: a radial stiffness field (array around the ring), particle positions/velocities, spring rest-lengths modulated by the painted contraction map. Core loop: apply peristaltic contraction as time-varying rest-length shrink on boundary springs, integrate PBD constraints, then trace the settled outline via marching-squares on the particle density field. Export outline to SVG/DXF. The genuinely hard part is numerical stability under strong non-uniform contraction (springs love to explode) plus getting facets to actually emerge rather than a mushy circle — likely needs plasticity (rest-length hysteresis) so deformation sticks.

## v1 scope
- One 2D blob, paintable stiffness ring, squeeze button
- Facet emergence visible for a square and a hexagon preset
- Outline trace + corner-sharpness readout

## Out of scope
- 3D extrusion, flow rate, real material constants
- DXF export (SVG only in v1)
- Multi-material blobs

## Risks & unknowns
- Whether a cheap solver produces convincing facets or just blobs
- Solver stability without heavy damping killing the effect
- 'Secretly useful' claim may not survive contact with real die design

## Done means
A user paints a 4-fold stiffness pattern, hits squeeze, and the settled cross-section is a recognizable rounded square (corner-sharpness metric above threshold) that exports as a clean SVG outline — reproducibly, without the sim blowing up.

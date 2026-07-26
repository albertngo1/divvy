## Overview
A browser toy/screensaver that runs a real 2D dry-foam coarsening simulation and sonifies its topological events. It is a generative art piece with a physics law load-bearing inside it: the von Neumann–Mullins law, which says a 2D bubble's area changes at a rate proportional to (n − 6), where n is its number of neighbors. Five-sided bubbles must shrink and die. Seven-sided bubbles must grow. Nobody codes that rule in — it emerges from surface tension alone, and the piece is the sound of it emerging.

## Problem
Generative art is usually noise dressed as structure: Perlin fields, particle drift, a palette. Meanwhile there are physical systems whose *statistics* are gorgeous and inevitable — foam coarsening is self-similar, decelerates as √t, and produces an avalanche structure no random walk gives you. Nothing pretty renders it, and nothing lets you *hear* a scaling law.

## How it works
Seed ~4000 tiny cells. Curvature-driven boundary motion begins: films straighten toward Plateau's 120° junctions, small cells collapse. Two event types drive the audio bus:
- **T1** (neighbor swap, two films exchange partners) → a dry click, panned by x-position.
- **T2** (a cell vanishes) → a plucked tone; pitch mapped to the dying cell's final side count (3-sided = high and brittle, 5-sided = mid), amplitude by its lifetime.
Because total cell count falls as 1/t, the event rate collapses over the run: minute one is a shimmering hiss, minute eight is sparse and funereal. A side panel plots live dA/dt vs n for every cell; the point cloud collapses onto a straight line through (6, 0) as the foam matures — the toy validating its own law in front of you. New seed → new piece, every time.

## Technical approach
Cellular Potts (Glazier–Graner–Hogeweg) on a 512² lattice, Hamiltonian = Σ J(1 − δ_στ) over the neighborhood with **no** area-constraint term (pure boundary energy ⇒ curvature flow ⇒ Mullins). Metropolis spin-copy at fixed kT. WebGPU compute shader, checkerboard-partitioned so parallel flips never touch adjacent sites. Every 50 MCS: connected-component label pass, adjacency graph from lattice boundaries, per-cell area and n. T2 = label disappears; T1 = an edge appears/disappears in the adjacency graph. Events go into a ring buffer consumed by a Web Audio scheduler; render is just the label texture through a Voronoi-ish palette shader.

The genuinely hard part is three things: (1) parallel Metropolis can *fragment* a cell into two blobs — needs a per-flip local connectivity check or a periodic repair pass; (2) label flicker at boundaries produces phantom T1 events, so events need hysteresis (edge must persist k frames); (3) at t=0 the event rate is thousands/sec — the audio needs a voice budget that routes the excess into a statistical noise bus whose density tracks the true rate.

## v1 scope
- 256² lattice, CPU Rust→WASM, single-threaded, no GPU
- T2 events only, one plucked sine voice, no T1 clicks
- The dA/dt vs n scatter plot (this is the payoff — ship it first)
- Fullscreen canvas + a seed in the URL hash

## Out of scope
- 3D foam (the law becomes Mullins' 3D version, much messier)
- Wet foam / drainage / rupture
- Screensaver packaging, export to video

## Risks & unknowns
CPM at low kT freezes (lattice pinning); at high kT it looks like TV static. The usable window may be narrow and hardware-dependent. The audio may just sound like rain — sonification often does. Mitigation: tune pitch mapping so the *last* 20 deaths are individually memorable.

## Done means
On a fresh seed, the scatter plot's fitted slope is within 15% of the theoretical 2πσM/3 over the last third of the run, side-count distribution peaks at 6, and the run produces a distinct 8-minute audio piece that a listener can tell apart from a second seed.

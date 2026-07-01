## Overview
Beamline is a browser physics-puzzle inspired by CERN retiring the LHC for Long Shutdown 3. You are the accelerator operator: given a fixed ring geometry and a budget of magnets, you must guide two beams around the loop and collide them at the detector. For puzzle-game players and physics-curious tinkerers who'd never read a beam-dynamics textbook but will happily tune magnets to beat par.

## Problem
Particle accelerators are the most expensive machines humans build and almost nobody has intuition for *why* they're hard — the beam wants to diverge, drift, and smear itself into the pipe walls. The itch: turn that invisible engineering into a tactile, losable puzzle.

## How it works
Each level gives a ring track, an injection point, a detector, and a palette of magnets you drag onto beamline slots: dipoles (bend the path), quadrupoles (focus/defocus the beam width), and drift sections (nothing). You release the beam and watch a bundle of particle rays propagate; if the envelope hits the pipe wall, that fraction is lost ('beam dump'). Score = fraction of particles surviving one full turn AND overlapping the opposing beam at the detector. Par is a hand-tuned reference solution; beating par unlocks harder rings with chicanes and energy ramps.

## Technical approach
Stack: TypeScript + Canvas (or Pixi.js), no backend. The core is a 2D transfer-matrix beam-optics sim: represent each particle as a state vector [x, x', y, y'] and each element as its 4x4 (or paraxial 2x2 per plane) transfer matrix; propagating the beam is just matrix multiplication down the lattice. The 'beam envelope' comes from tracking the Twiss/sigma matrix (σ' = M σ Mᵀ) so you draw a smooth width band, not just rays. Collision quality at the detector is the overlap integral of the two beams' Gaussian profiles. Data model: `Level {ring_path, slots[], magnet_budget, par}`, `Element {type, strength}`. The genuinely hard part is authoring levels that are solvable-but-not-trivial and giving legible feedback about *where* focusing went wrong — a per-slot 'this is where you lost the beam' overlay.

## v1 scope
- One straight-then-curved lattice with ~8 slots
- Two element types: dipole (fixed bend) and quadrupole (adjustable focus strength slider)
- Single beam that must survive one pass and hit a target box
- Live envelope rendering + win/lose (beam dump) states

## Out of scope
- Two-beam collision physics (v1 is single-beam target practice)
- Energy ramping, RF cavities, synchrotron radiation
- Level editor / sharing
- Mobile touch

## Risks & unknowns
- Transfer-matrix optics may be too abstract to feel visceral without great animation.
- Balancing 'par' difficulty by hand is slow.
- Real beam dynamics is nonlinear; the linear approximation might make clever solutions feel fake to anyone who knows the field.

## Done means
A player can drag two magnets into a lattice, drag a quadrupole slider, watch the beam envelope narrow and thread through a target the previous configuration missed, and see a survival-percentage score compared against par — entirely client-side in one HTML page.

## Overview
Tap Test is a browser toy that turns the elastic tensor dataset of the Materials Project into something you can hear and rotate. Pick a compound — Si, MgB₂, some obscure DFT-relaxed perovskite nobody has synthesized — and it draws the directional stiffness surface for that crystal and lets you strike a virtual bar made of it. For materials-curious people, students, and anyone who has ever wondered why a bronze bell and a steel bell sound different in a way that has nothing to do with shape.

## Problem
The Materials Project publishes computed full 6×6 elastic tensors for over ten thousand crystals. It is one of the great open scientific datasets and it is presented as a table of numbers. Elastic anisotropy — the fact that a crystal is stiffer along one axis than another — is genuinely hard to picture from `C₁₁ = 165.7, C₁₂ = 63.9, C₄₄ = 79.6`, and its most visceral consequence, the sound a material makes, is nowhere in the interface. Meanwhile the coin-tap test is a real, century-old NDT technique: hit metal, listen for cracks. Nobody has connected the serious dataset to the ear.

## How it works
Search or roll the dice for a material. The left panel renders the directional Young's modulus surface — the classic lumpy star glyph where radius along direction **n** is E(**n**) — colored by anisotropy, spinnable, with the crystal's unit cell ghosted inside. The right panel is a workbench: choose a shape (free-free bar, disc, tine), set length and thickness with sliders, and click to strike it. You hear the modal ring. Switch to a different material with the same geometry and the pitch and timbre change purely from stiffness and density. A "crack it" toggle detunes and splits the modes the way a real flawed casting does, which is exactly what the tap test listens for. A compare mode lets you A/B two materials on one keystroke.

## Technical approach
Static site: TypeScript, three.js, WebAudio, no backend. Data pulled once at build time from the Materials Project API (`mp-api`, the `materials/elasticity` endpoint) — elastic tensor, density, formula, spacegroup — into a ~15MB gzipped JSON shard set, chunked by first element so the initial load is small.

Math: invert C to get compliance S, then E(**n**) = 1 / (S_ijkl n_i n_j n_k n_l) evaluated over an icosphere of ~10k directions, computed in a worker and uploaded as vertex positions. Bulk wave speeds come from the Christoffel matrix Γ_ik = C_ijkl n_j n_l, whose three eigenvalues are ρv² for one quasi-longitudinal and two quasi-shear branches — this gives the second, more physical visualization: three nested velocity sheets. Audio uses Euler–Bernoulli free-free bar modes, f_n = (β_n² h / 2πL²)·√(E/12ρ) with β = 4.730, 7.853, 10.996, 14.137, driven by a short filtered noise exciter into a bank of decaying sine oscillators; Q is a user slider because damping is not in the dataset.

The hard part is data hygiene. DFT elastic tensors include a nontrivial share of garbage: tensors that fail the Born stability criteria, negative eigenvalues, physically absurd moduli. Everything must be filtered through eigenvalue-positivity and a sanity band before it becomes a sound, or a third of the library will scream. The second hard part is honesty — the ring is a *model* of an idealized bar, not a simulation of a real object, and the UI has to say so without being a killjoy.

## v1 scope
- 50 hand-picked materials, JSON checked into the repo
- Free-free bar geometry only, one length slider
- E(**n**) surface only; no Christoffel sheets
- One strike sound, fixed Q

## Out of scope
- Uploading your own CIF, FEM modal analysis of real shapes, plate/disc modes
- Anisotropic ring (using the direction-dependent E rather than the Voigt-Reuss-Hill average) — v2
- Any claim of usefulness for real NDT

## Risks & unknowns
MP API terms and attribution for bulk redistribution need checking. Bad tensors may be more common than expected. There is a real chance every material just sounds like a slightly different marimba bar, which would make it pretty but boring — worth prototyping the audio first before building any UI.

## Done means
Side-by-side, diamond and lead at identical geometry produce audibly and dramatically different pitch and decay, the E(**n**) surface for cubic Si visibly bulges along ⟨111⟩, and a stranger can find a material, strike it, and hear it in under fifteen seconds from a cold page load.

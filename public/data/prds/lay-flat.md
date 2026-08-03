## Overview

An in-browser physical-generative art piece. Each run picks a random *growth field* for a flat disk of virtual paper — how much each point wants to expand — and then minimizes elastic energy. Because the target metric isn't embeddable in the plane, the sheet has no choice but to leave it: it ruffles, frills, saddles, and curls. You never author the shape. You author the *wanting*, and physics picks the form.

Then it exports the flat cut pattern as SVG. Print it, cut it, and the real sheet buckles the same way.

For: generative-art people bored of noise-and-shaders, and anyone who has ever wondered why kale looks like that.

## Problem

Generative art is mostly procedural *drawing* — the artist encodes the look. Physical-simulation art is mostly rigid bodies and cloth, which look like what you'd expect. Non-Euclidean elasticity produces forms that are genuinely surprising *and* genuinely real: the ruffle count of a lettuce leaf is not a design choice, it's an energy minimum. Almost nobody has made a toy out of it, and the ones that exist stop at the render.

## How it works

1. Triangulate a flat disk (~20k vertices).
2. Sample a random **target metric**: assign each edge a rest length `L̄ᵢⱼ = Lᵢⱼ · (1 + γ(x))`, where `γ` is a Perlin-modulated radial growth field. Radially increasing `γ` → hyperbolic disk → circumference outruns the plane → ruffles.
3. Minimize `E = E_stretch + E_bend` over vertex positions in ℝ³.
4. Render. Export mesh + flat pattern.

`E_stretch = Σ k_s(‖pᵢ−pⱼ‖ − L̄ᵢⱼ)²` with `k_s ∝ t`; `E_bend` is the discrete-shells hinge energy `Σ k_b(θₑ − θ̄ₑ)² ‖ēₑ‖/h̄ₑ` with `k_b ∝ t³`. The thickness `t` is the whole game: it sets the stretch/bend ratio, which sets the wavelength, which sets how many frills appear. Same growth field, thinner sheet, more waves.

## Technical approach

Rust → WASM for the solver (`argmin` L-BFGS with analytic gradients; the hinge-angle gradient is the fiddly bit), three.js + WebGPU for render, all client-side, no backend.

**The branch-selection problem is the hard part.** Energy minimization from a flat start falls into whatever wave-number basin it lands in, and it's usually wrong — you get a 5-fold ruffle where the true minimum is 9-fold. Fix: *thickness annealing*. Start thick (bend-dominated, smooth, one clean basin), converge, then halve `t` and re-converge, repeatedly. Each step nucleates the next order of waves from the previous solution. This mirrors how the real physics selects wavelength, and it's the difference between "blobby mesh" and "looks like a real leaf."

**The fabrication export** is the second hard part and the reason this is more than a screensaver. A flat sheet can't actually grow — so encode `γ(x)` as *auxetic kirigami*: a lattice of slits whose local density controls effective in-plane expansion. Build a homogenization lookup by simulating one unit cell at ~20 slit lengths under uniaxial load, fit effective stretch vs. slit ratio, then invert it per-cell to place cuts. Emit SVG at Cricut/laser scale.

## v1 scope

- Radial growth only, `γ(r) = αr`, no Perlin
- Fixed 8k-vertex disk
- Two sliders: `α` and thickness
- Thickness annealing, 4 steps
- Render + PNG export. **No kirigami, no SVG.**

## Out of scope

Self-collision (v1 sheets will happily pass through themselves). Anisotropic growth. Animation of growth over time. Any physical fabrication.

## Risks & unknowns

Self-intersection may be visible enough to ruin the look at high `α`, which pulls a repulsion term into v1 scope. The kirigami homogenization may not hold at large strains where cells rotate rather than stretch. 20k-vertex L-BFGS in WASM might be too slow for interactive sliders — fallback is a WebGPU compute Jacobi smoother for the interactive preview and L-BFGS only for the final frame.

## Done means

Sweeping `α` with fixed thickness produces a monotonically increasing ruffle count that matches the predicted `n ∝ √(α/t)` scaling within 20%, and two runs with different seeds are visibly, structurally different shapes — not the same shape rotated.

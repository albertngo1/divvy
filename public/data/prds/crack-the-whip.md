## Overview
A browser physics sandbox with a short puzzle campaign, built around one principle: when momentum flows into a shrinking mass, velocity explodes. You draw the mass profile of an articulated chain, drop it, and watch whether the tip goes supersonic. For anyone who watched a gravity-only trebuchet break Mach 1 and wanted to fiddle with the knobs.

## Problem
The supersonic-trebuchet result is a spectacle you can only watch. The underlying idea — energy funneling down a taper — is teachable, deeply visual, and has an obvious optimization landscape, but there's no toy that lets you feel it. Every whip-crack simulation online is a passive animation with no budget, no failure mode, and no score.

## How it works
Each level hands you a budget: total mass M, drop height h, a link count cap, and a per-link tensile limit. You draw a taper curve (mass per link) and set joint damping, then release. The chain falls, the cascade runs, and a HUD shows kinetic energy per link as a stacked area chart collapsing rightward into the tip. Cross 343 m/s and you get a shock cone and a boom. Exceed a link's tensile limit and it snaps mid-swing, which is its own kind of win. Score is peak tip Mach number. Twelve levels ratchet the constraints: fewer links, a mass floor that forbids a vanishing tip, then air.

## Technical approach
TypeScript, WebGL2, no engine. Physics is a planar n-link chain under XPBD with distance and angular constraints, adaptive substepping — the effective stiffness scales with the mass ratio between neighbours, so the tip needs sub-10-microsecond steps while the root is happy at a millisecond. Per-link aerodynamic drag is ρv²A·Cd(M) with a transonic Cd rise around Mach 0.9; that bump is the real ceiling and is what punishes naive infinite tapers. Link tension comes straight out of the constraint Lagrange multipliers and is compared against a per-link yield stress. A running total-energy audit (potential converted, kinetic present, drag dissipated) is displayed to the player, not hidden.

The hard part is honest numerics. At mass ratios above ~1.3 per link, naive integration injects energy and hands you a fake Mach 3. Symplectic integration plus a visible drift meter turns a correctness problem into a game mechanic: a run with >2% drift is marked unofficial.

## v1 scope
- Eight-link chain, one level, one fixed drop height
- Per-link mass sliders, no curve drawing
- Tip speed readout and energy-drift number
- No drag, no breakage, no sound

## Out of scope
3D, actual trebuchet arms/slings/counterweights, materials library, leaderboards, mobile.

## Risks & unknowns
Whether a gravity-only supersonic tip is reachable in-sim at plausible mass ratios, or whether it needs a taper so extreme it looks absurd. Numerical blowup at high ratios. The energy chart may be more interesting than the game.

## Done means
A hand-tuned taper reaches over 343 m/s tip speed with under 2% total energy drift across the run, and flattening that same taper to uniform mass drops the tip below Mach 1.

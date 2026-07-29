## Overview

Racemize is a single-page science toy that simulates the Frank model of spontaneous mirror-symmetry breaking: a well-stirred flask of achiral precursor producing left- and right-handed product, where each enantiomer autocatalyzes its own formation and *mutually annihilates* with its mirror image. Start it perfectly balanced and it will not stay balanced — noise picks a winner and the system runs away to near-total homochirality. It's for anyone who's read the sentence "life is homochiral and nobody fully knows why" and wanted to poke it.

## Problem

Homochirality is one of the great open questions in origin-of-life chemistry, and it's usually presented as either a bare fact ("all biological amino acids are L") or an impenetrable set of rate equations. The thing that makes it *click* — that symmetry breaking is a dynamical inevitability once you have autocatalysis plus mutual inhibition, and that the direction is genuinely a coin flip — is a behavior you have to watch happen, several times, with different seeds, before it lands. There is no good interactive version of this. There are plenty of Lorenz attractors and Game of Life boards; there is nothing that lets you feel a chiral bifurcation.

## How it works

A flask fills the screen. Molecules are drawn as small tetrahedral glyphs, cyan for L and amber for D, with achiral substrate as grey dots. Below, a live **enantiomeric excess** readout: `ee = (L−D)/(L+D)`, a needle that starts pinned at zero and jitters.

You run it. For a while nothing happens — ee wanders around zero. Then it *goes*, hard, to +0.98 or −0.98, and the flask floods with one color. You reset and it may go the other way.

Then the sliders:

- **Autocatalytic order** (1 → 2): at order 1 the symmetry break never happens; at order 2 it always does. Watching that threshold is the payoff.
- **Mutual annihilation rate**: the L+D → inert reaction. Turn it off and homochirality dies.
- **Substrate flux**: open vs closed system — closed systems break symmetry and then freeze; open, driven ones can be pushed back.
- **Chiral bias** — a tiny thumb on the scale (the parity-violating energy difference is ~10⁻¹⁷ relative; the slider goes from 0 to a comically large 10⁻³). The lesson: even absurd bias only shifts the *probability*, it doesn't guarantee the outcome, and you can watch a biased system lose.

A **run histogram** accumulates across resets: 47 left, 53 right. Crank the bias and watch it skew.

## Technical approach

Vanilla TS + WebGL2 (or WebGPU with a canvas2d fallback), no framework. Two coupled layers:

**Stochastic layer (the truth):** Gillespie SSA over the Frank/Soai reaction network with species `{S, L, D, P}` and reactions:
- `S → L`, `S → D` (rate k₀, uncatalyzed, symmetric)
- `S + L → 2L`, `S + D → 2D` (rate k₁, autocatalytic; order slider interpolates toward `S + 2L → 3L`)
- `L + D → P` (rate k₂, mutual annihilation)
- optional inflow `→ S` (rate φ) and outflow for the open-system case

Exact SSA is essential rather than an ODE integrator — the whole phenomenon is *noise-driven*, and a deterministic ODE started at exactly ee=0 sits at the unstable fixed point forever. That's the pedagogical trap this toy exists to avoid. Tau-leaping kicks in above ~10⁶ molecules to keep it interactive.

**Render layer (the lie that helps):** particles are not the SSA molecules. Maintain ~4,000 GPU instances whose L/D/S proportions are resampled from the SSA population each frame, with a Brownian drift in a circular boundary. Cheap, and honest as long as the readout comes from the SSA.

Eigenvalue analysis of the linearized system around the racemic fixed point is computed live to draw a stability marker — showing the user *when* the racemic state goes unstable as they drag the order slider, rather than making them discover it by trial.

**Hard part:** keeping SSA interactive. Near the bifurcation, reaction propensities are large and events are tiny, so a naive SSA does millions of steps per simulated second. Needs the next-reaction method (Gibson–Bruck, indexed priority queue over dependency graph) plus adaptive tau-leaping with a Poisson approximation once molecule counts exceed threshold — and switching between them without introducing a bias that fakes the symmetry break is the subtle correctness trap. Test: with bias=0 and 500 runs, the L/D win rate must be statistically indistinguishable from 50/50 (binomial test, p > 0.05).

## v1 scope

- Closed system only (no inflow/outflow).
- Three sliders: autocatalytic order, annihilation rate, chiral bias.
- ee needle + run histogram.
- SSA only, capped at 10⁵ molecules — no tau-leaping.
- Particle render as flat colored dots, no tetrahedral glyphs.
- One paragraph of prose explaining Frank 1953 and the Soai reaction, with links.

## Out of scope

- Spatial simulation (a reaction-diffusion version where chirality domains form and compete is the obvious and much cooler v2).
- Real molecular structures or any actual chemistry rendering.
- Crystal-based mechanisms (Viedma ripening, attrition-enhanced deracemization).
- Sound.

## Risks & unknowns

- The bifurcation may be boring to watch if it happens too fast — needs tuning so the pre-break wander lasts 10-20 seconds, long enough to build tension.
- Explaining "autocatalytic order" to a non-chemist in slider-label space is hard; may need the slider to be labeled by its effect ("how much a molecule helps make copies of itself") rather than its name.
- Risk of overclaiming: this is *a* model of homochirality's origin, not the answer. The prose has to say so without deflating the toy.

## Done means

With bias set to zero, 500 automated headless runs produce a left/right win split that passes a binomial test at p > 0.05; with autocatalytic order set to 1.0, 100 runs produce |ee| < 0.1 in every run; with order 2.0, 100 runs produce |ee| > 0.9 in every run. And a person who does not know what "enantiomer" means can drag the annihilation slider to zero, watch homochirality fail to appear, and explain why.

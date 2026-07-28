## Overview

**Boiling Point** is a solo, deterministic-seed roguelike about surviving a hydrothermal vent as a microbial lineage. You never control a body. You control a *proteome budget* — a fixed number of amino-acid "points" divided among cellular subsystems — and then the physics of a hot spring decides whether your descendants persist. Each run is ~15 minutes, 200 generations, one gradient.

For people who bounce off idle games because nothing is real, and bounce off educational sims because nothing is a game.

## Problem

Extremophile biology is genuinely one of the most game-shaped fields that exists — hard tradeoffs, sharp thresholds, non-obvious dominant strategies — and it is universally rendered as a static diagram in a textbook. Meanwhile roguelikes have exhausted "dungeon, HP, weapon." The itch: make thermodynamics the antagonist.

## How it works

A run is a 1D spatial gradient: 40 tiles from vent mouth (~121°C) to outflow (~35°C), with per-tile pH, dissolved O₂, and sulfide. Your lineage occupies a tile distribution.

Each generation you spend **Proteome Points** (start: 100) across six investments:

- **Chaperones (HSP70/GroEL)** — raises the temperature at which protein misfolding accelerates
- **Lipid saturation** — membrane stays intact hotter, but slows nutrient transport (a real tradeoff, not a fake one)
- **DNA repair (reverse gyrase)** — reduces mutation load at high temp
- **Ribosome count** — raw growth rate
- **Motility** — how many tiles you can migrate per generation
- **Spore/dormancy** — survive a shock event at zero growth

Every point spent on one is a point not spent on ribosomes, so max-hardiness lineages are outcompeted by fast-growing ones in the mild zone — and then annihilated by a vent surge.

The run's drama comes from **events**: vent surges (+30°C for 3 generations), pH crashes, sulfide pulses, and a slow secular warming that makes the mild zone shrink. Survive a surge and you get a **Horizontal Gene Transfer** draft — pick 1 of 3 trait cards scavenged from dead lineages (yours or other players' seeds), which is the roguelike unlock loop.

Death is a specific, legible sentence: "Generation 143: membranes held, but ribosome throughput fell below maintenance at 4.2 mM sulfide. Starved."

## Technical approach

Browser, TypeScript + Canvas 2D, no engine. State is small enough to be a plain object; the whole game is a pure `step(state, choices) → state` so runs are replayable from a seed string.

The simulation core:

- **Growth rate** per tile via a **Ratkowsky square-root model** (√μ = b(T − T_min)·[1 − exp(c(T − T_max))]) — the standard microbiology growth-vs-temperature curve, with T_max shifted right by chaperone investment.
- **Protein denaturation** as two-state thermodynamics: ΔG_unfold(T) via the **Gibbs–Helmholtz** equation, fraction folded = 1/(1+exp(−ΔG/RT)). Chaperone points raise ΔG_ref. This gives the cliff-edge feel for free — folded fraction is flat then falls off a wall.
- **Membrane** modeled as a lipid melting temperature that rises with saturation investment while a transport-efficiency multiplier falls (a simple linear penalty is enough).
- **Population** per tile is a discrete logistic map with the computed growth rate; migration is a diffusion kernel weighted by motility.

Real grounding: parameterize the initial gradient from a published Yellowstone hot-spring transect (temperature/pH pairs are in the literature and in NPS datasets), and seed the trait cards from actual thermophile adaptations (reverse gyrase, tetraether lipids, thermosome).

**The genuinely hard part** is balance, not code. Coupled exponential systems tend to be either trivially survivable or instantly lethal, with a razor-thin interesting band. Mitigation: build a headless run harness that plays 10,000 seeds against 30 scripted strategies and reports a win-rate histogram — tune until no single strategy exceeds ~40% and none is below 5%. That harness is the real deliverable of week one.

## v1 scope

- 40-tile gradient, temperature only (no pH, no sulfide)
- Three investments: chaperones, lipids, ribosomes
- 200 generations, one surge event at a random generation
- Canvas render: gradient bar + population histogram + a scrolling generation log
- Seed in the URL; a death screen naming the cause

## Out of scope

HGT card draft, meta-progression, other players' seeds, sprites, audio, mobile layout, any multiplayer.

## Risks & unknowns

The biggest risk is that the optimal play collapses to a single formula a spreadsheet solves in one sitting — killing replay value. Secondary: watching numbers evolve may simply be boring without the visual language of a shrinking habitable band, so the render is load-bearing, not decoration. Also, real Arrhenius/Ratkowsky constants produce dynamics on wildly different timescales than fun does; expect to fudge rate constants and be honest in an in-game note about which numbers are real and which are tuned.

## Done means

A stranger loads a URL, plays three runs without reading instructions, loses all three to *different* causes, and can articulate the chaperone-vs-ribosome tradeoff unprompted. The headless harness confirms no scripted strategy wins more than 40% of 10,000 seeds.

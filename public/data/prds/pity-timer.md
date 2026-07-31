## Overview
A browser drum machine whose UI is a control panel for stochastic processes. Every voice (kick, snare, hat, perc) is a point process; the only things you can touch are its density, its memory, its refractory period, its gacha-style pity timer, and how it correlates with the other voices. For producers bored of drawing 16 boxes, and for anyone who has read about "random that feels fair" and wanted to hear it.

## Problem
Step sequencers make you an author of individual events. Randomize buttons make you a bystander. There's nothing in between — no instrument where you specify *the shape of the chance* and the pattern is a sample from it. Meanwhile game developers have spent twenty years building rich vocabulary for correlated randomness (shuffle bags, pity timers, bad-luck protection, streak breakers) and none of it has ever been wired to a drum voice, where clumpiness and anticorrelation are literally what "groove" means.

## How it works
Each voice gets five dials:
- **Density** — expected hits per bar.
- **Memory (Hurst)** — from 0.1 (anti-clumped, near-regular) through 0.5 (Poisson) to 0.9 (bursty, long streaks of activity and silence).
- **Refractory** — minimum steps between hits; a hard lockout.
- **Pity** — after k consecutive misses the hit probability ramps; at N it's guaranteed. Set N=4 on the kick and you get a floor under the groove without ever placing a note.
- **Coupling** — a matrix of correlations ρ with per-pair lags: hat at ρ=−0.6 lag 0 from kick (they avoid each other), snare at ρ=+0.8 lag 2 from kick (it echoes two steps later).

Under the transport is a live raster of the last 32 bars plus an autocorrelogram per voice, so you can *see* the statistics you're dialing and watch the pity timer fire.

## Technical approach
Svelte + Web Audio, scheduling in an AudioWorklet with a seeded xoshiro128** so a pattern is reproducible from (seed, params).
- Correlated events come from a latent Gaussian field, not from independent coin flips: generate fractional Gaussian noise per voice via Davies–Harte circulant embedding (FFT-based, exact, cheap for 512-step blocks) to get the Hurst behavior, then couple voices through a Gaussian copula with correlation matrix R.
- R must be positive semi-definite; users will drag it somewhere illegal, so project to the nearest PSD matrix by eigenvalue clipping and animate the dials snapping to the legal value.
- Thresholding the latent field at the per-voice quantile keeps the marginal density *fixed* while correlation changes — otherwise every coupling tweak also changes loudness, which is the thing that makes naive versions of this unusable.
- Refractory and pity are applied as a post-hoc hazard modifier with a compensating threshold shift so density stays honest.
- Export: MIDI clip + a permalink encoding the full parameter vector and seed.

## v1 scope
- Four voices, sample-based, one 4/4 tempo.
- Density + refractory + pity only (no Hurst, no coupling).
- Live event raster.

## Out of scope
Pitched instruments, swing/microtiming, VST/AU build, sample import, saving to an account.

## Risks & unknowns
The fixed-marginal trick may still produce audibly "wrong" densities at extreme Hurst values; the deeper risk is that pure statistical control feels like gambling rather than playing — mitigate by making the pity timer visible and tactile.

## Done means
A listener can hear a clear, repeatable difference between H=0.2 and H=0.8 at identical density, and the autocorrelogram display matches the theoretical curve for the chosen parameters.

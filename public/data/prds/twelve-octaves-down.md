## Overview
A browser instrument that turns crystals into timbres. Every solid has a phonon spectrum — the frequencies at which its atomic lattice can vibrate — sitting in the 1–50 THz range. Shift that down by 2^40-ish and it lands squarely in the audible band. This toy fetches precomputed phonon data for real materials, synthesizes a struck-object sound from the actual mode frequencies and their density of states, and maps them to a keyboard. For anyone who has ever tapped a rock to hear whether it's good.

## Problem
Materials science is taught entirely through the eyes — band diagrams, DOS plots, ball-and-stick models. But phonons are literally sound: they are the quantized vibrations that carry heat and stiffness. The single most intuitive channel for that information is the one nobody uses. There is no way to *hear* why diamond has a Debye temperature of 2200 K and lead has 105 K, even though the difference is exactly a pitch difference.

## How it works
Search or browse a shelf of ~200 curated materials (quartz, halite, diamond, ice Ih, olivine, graphite, gold, MgO). Click one and the app strikes it: a short percussive attack, then a decaying spectrum built from that material's real phonon modes. Stiff, light-atom crystals ring high and long; heavy, soft ones give a low dull knock. A slider transposes the whole shift factor so you can move a material in or out of a comfortable register. A second panel shows the phonon DOS with the audible mapping overlaid, so the plot and the sound are the same object. Two-material comparison mode plays them as an interval — diamond over lead is roughly four and a half octaves, and you can hear it. Sequencer mode: lay minerals on an 8-step grid and the shelf becomes a drum machine made of rocks.

## Technical approach
Data: the Materials Project API (`mp-api`, free key) exposes precomputed phonon bandstructures and DOS for several thousand materials, plus the phononwebsite / PhononDB (Togo) datasets as fallback. Prefetch and cache a curated subset as JSON at build time — no live API in the hot path. Stack: vanilla TS + Web Audio API, no framework; charts via a small canvas renderer.

Synthesis is additive with a modal bank: take the Γ-point optical modes plus peaks extracted from the DOS (find local maxima with prominence thresholding), map each to `f_audio = f_THz × 10^12 / 2^N` with N ≈ 40, and drive one biquad-resonator-fed impulse per mode. Amplitude per mode ∝ DOS weight; decay time is the honest fudge — real anharmonic phonon lifetimes aren't in the dataset, so v1 approximates Q from the Grüneisen parameter where available and a per-material constant otherwise. Acoustic branches near Γ go to zero frequency and must be low-cut or they become DC thumps.

The genuinely hard part: a DOS is a *statistical* spectrum, not the impulse response of a struck object. Naively summing every mode gives white-ish noise. The trick is aggressive peak selection (8–20 partials) plus a stretched-partial detune so the result reads as a struck body rather than a filtered hiss.

## v1 scope
- 12 hardcoded materials, JSON checked into the repo
- One strike sound per material, one global transpose slider
- DOS plot with the picked partials marked
- No sequencer, no comparison mode

## Out of scope
- Live Materials Project queries, arbitrary CIF upload, on-the-fly DFPT
- Temperature dependence, isotope effects, defect modes
- Anything claiming to be a scientifically valid auralization

## Risks & unknowns
- Peak-picking may make chemically distinct materials sound identical
- Phonon coverage in Materials Project is patchy for the famous minerals people actually want
- Web Audio resonator banks with 20 partials × 8 voices may glitch on mobile

## Done means
Clicking diamond and clicking lead in the same session produces two obviously different pitched strikes, the DOS plot's marked partials line up with what I hear, and the pitch ratio between any two materials is within a semitone of the ratio of their Debye temperatures.

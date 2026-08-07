## Overview

Cat's Eye is a browser-based wallpaper generator for people who are tired of "gradient + noise" generative art. It runs an actual 2D incompressible shear-flow solver and lets a Kelvin–Helmholtz instability grow the image. The novelty is the seed: you type a phrase, and the phrase's character statistics become the initial perturbation spectrum injected into the shear layer. The physics does the rest. Output is a deterministic, display-resolution PNG plus a shareable seed string.

## Problem

Almost all generative wallpaper tools are noise fields with a palette bolted on — they look procedural because they *are* procedural, with no underlying process that produces structure. Meanwhile the genuinely beautiful patterns in nature (the cat's-eye vortices in the Sun's shear layers, cloud billows, ocean fronts) come from instabilities, not from noise. Nobody has made an art tool where the input text is physically load-bearing rather than just an RNG seed hashed into a number.

## How it works

1. Pick two colors. Their relative luminance becomes the density ratio (Atwood number) of the two fluids; their hue distance sets the velocity shear.
2. Type a phrase. Bigram frequencies of the phrase are mapped to Fourier mode amplitudes k=1..32 along the interface, with character positions setting phases.
3. Hit go. The solver integrates until vorticity growth saturates; you scrub a timeline and freeze any frame.
4. Export at your screen resolution. The seed string (`colors + phrase + freeze-time`) regenerates the exact image forever.

Because KH growth rate scales with wavenumber, short punchy phrases produce a few huge billows and long ones produce fine filamented curls — the visual signature of the sentence is legible before you read it.

## Technical approach

- Vanilla TS + WebGL2 (or WebGPU with a WebGL2 fallback). No framework.
- Solver: 2D incompressible Navier–Stokes in vorticity–streamfunction form on a periodic 1024×512 grid. Pseudo-spectral: FFT for the Poisson solve (streamfunction from vorticity), RK4 in time, 2/3-rule dealiasing. All in fragment shaders with ping-pong FBOs; the FFT is a Stockham radix-2 pass chain.
- A passive scalar field advected alongside vorticity carries the two colors — that's what you actually see.
- Seeding: `perturbation[k] = bigramCount(k) / total`, phase from a FNV-1a hash of the character index. Deterministic across machines given float32 shaders (verify).
- Hard part: numerical stability at high Reynolds number without the pattern turning to mush. Needs hyperviscosity (∇⁴ damping) tuned so filaments stay crisp for 2000+ steps, and a CFL-adaptive timestep. Second hard part: bit-identical determinism across GPUs — likely needs to relax to "perceptually identical" and store the freeze frame's PNG hash rather than promising exactness.

## v1 scope

- Two-color picker, one text box, one "grow" button, one time slider.
- 512×256 sim upsampled to 2560×1440 for export.
- Seed string in the URL fragment.
- Five hand-tuned palette presets.

## Out of scope

- Animation export, 3D, audio, accounts, mobile layout, live desktop wallpaper daemon.

## Risks & unknowns

- The bigram→mode mapping may be perceptually flat (all phrases look the same). Mitigate by testing 50 phrases early and stretching the mapping until a human can sort them.
- WebGL2 float FFT precision on integrated GPUs.
- Saturation may always converge to the same visual attractor regardless of seed — if so, freeze earlier in the growth phase by default.

## Done means

A stranger types their name, gets a 2560×1440 PNG in under 4 seconds, and when a second person independently types the same name with the same colors they get a visually indistinguishable image — while ten different phrases produce ten images a human can reliably match back to their text.

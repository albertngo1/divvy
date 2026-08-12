## Overview
A single-page web toy about one of the most delightful sounds in nature: throw a rock onto thick lake ice and you hear a science-fiction *pew* — a rapid downward pitch glide. That glide is not a gimmick of the rock; it is the ice plate itself acting as a dispersive waveguide, where high-frequency bending waves outrun low-frequency ones. Sounds Thin lets you build that sound from the physics, drag sliders, and hear the equation. Then it flips: feed it a real phone recording of ice, and it estimates the plate thickness from the shape of the chirp.

## Problem
Dispersion is taught as a line in a textbook and heard by almost nobody. Meanwhile the one everyday phenomenon that makes dispersion *audible* is treated online as a viral curiosity with no explanation attached. There is no toy where you can turn ice from 4 cm to 40 cm and hear the sound change, and no tool that closes the loop back onto a real recording.

## How it works
The user sets four sliders: ice thickness `h`, distance to the impact `r`, water depth `H`, and ice temperature (which sets Young's modulus `E`). The app computes the flexural-gravity dispersion relation for a thin elastic plate floating on water:

`ω² = (g·k + (D/ρw)·k⁵)·tanh(kH) / (1 + (ρi·h/ρw)·k·tanh(kH))`, with `D = E·h³ / (12(1−ν²))`.

Synthesis happens entirely in the frequency domain, which is the whole charm: take a flat broadband impulse spectrum, and for each bin solve `k(ω)` by Newton iteration, then multiply by `exp(−i·k(ω)·r)` for propagation phase and a distance/absorption amplitude term. Inverse FFT that spectrum and you *have* the chirp — no oscillator, no envelope hand-tuning. Feed it into Web Audio, draw the spectrogram, and let the user hear that doubling `h` steepens the glide.

Listen mode: record via `getUserMedia`, compute a reassigned spectrogram, ridge-track the dominant instantaneous frequency, fit `t(f)` against the group-velocity prediction `t = r / cg(f, h)` by least squares over `(h, r)`, and report `h` with a confidence interval.

## Technical approach
TypeScript, Web Audio API, WebGL2 for the spectrogram (one fragment shader over a ring-buffer texture), a hand-rolled real FFT so there is no build-step dependency. Data model: `{h, r, H, E, nu, rho_i, rho_w}` fully encoded in the URL hash, so every sound is a shareable link. The hard part is the inverse fit: `h` and `r` are partially degenerate (a thin plate nearby sounds much like a thick plate far away), so the fit must exploit *curvature* of the chirp, not just its slope, and must be honest when a recording carries too little bandwidth to separate them — in that case it returns a hyperbola in `(h, r)` space rather than a single number.

## v1 scope
- Forward synthesis only, four sliders, click-to-play, live spectrogram.
- Three presets: "skipping stone, 15 cm ice", "cracking rink, 3 cm", "deep boom, 60 cm".
- URL-hash state sharing and one paragraph explaining why high notes arrive first.

## Out of scope
- Listen/estimation mode, WAV export, non-uniform or cracked ice, mobile mic calibration.

## Risks & unknowns
- Dispersion gives the glide but not the *timbre*; real recordings carry lake-basin reverb and air-coupling colour that pure plate theory will miss, so v1 may sound too clean.
- Numerical care needed: `k⁵` blows up dynamic range and the Newton solve for `k(ω)` needs good bracketing near the flexural/gravity crossover.
- Estimation mode has an obvious safety hazard. It must be labelled a toy in large type — nobody should walk onto ice because a web page said 20 cm.

## Done means
Moving the thickness slider from 5 cm to 30 cm audibly and visibly changes the chirp's downglide rate, the shipped presets are distinguishable in a blind listen against three real recordings pulled from public field audio, and every parameter round-trips through the URL.

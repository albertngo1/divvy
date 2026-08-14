## Overview

Dot Gain turns a photo into print-ready per-ink separations for **risograph, screenprint, and letterpress** — but instead of the classic rotated line screen everyone fights moiré with, it generates each ink's dot field as a blue-noise point set produced by simulated annealing, then pre-compensates for how much your actual paper and press spread the ink. For small print studios and one-person riso operations who currently guess in Photoshop and eat the failed runs.

## Problem

Two problems collapse into one. (1) **Moiré**: multi-ink riso is registered by hand, so any periodic screen beats against itself and the second pass looks like a plaid. (2) **Dot gain**: a 40% dot in your file prints as a 62% dot on cheap uncoated stock with a soy-ink drum, so every midtone comes out mud, and the correction curve is specific to your machine, ink, paper, and humidity. Commercial RIPs solve both for thousands of dollars and assume offset presses nobody in the room owns.

## How it works

1. Load an image, choose your inks (riso pigment spot colors: Fluorescent Pink, Federal Blue, …). Separation solved in a real color space, not RGB channels.
2. For each ink, place N dots and **anneal** them: dots repel each other, are attracted to darkness in that channel, and the Metropolis temperature schedule cools until the point set has a blue-noise spectrum — a flat low-frequency floor with an energy ring, so there is no periodic structure to beat against the next layer.
3. Each ink gets an independent random seed, so layers are mutually incoherent: rotate the paper, no plaid.
4. **Calibrate**: print the built-in 21-step wedge, scan it on any flatbed, drop the scan in. The app fits a per-ink dot-gain curve and bakes it into the next export.

## Technical approach

Stack: Rust core compiled to WASM, thin browser UI, `<canvas>` preview; no server.

Annealing: treat the dot set as a Gibbs ensemble over a hex lattice of candidate sites. Energy = pairwise repulsion (Gaussian kernel, radius from target dot density) + a data term pulling dots toward high-density image regions. Sample by Metropolis swap moves — pick an occupied and an empty site, swap, accept by exp(−ΔE/T). Neighbor queries via a uniform grid; ~50 sweeps at 300 dpi over a 5×7" area is a few seconds in WASM. Validate output by radially-averaging the FFT power spectrum and asserting the blue-noise ring.

Calibration: scan alignment by locating four fiducial corners (contour detection), sample each of the 21 patches, convert scanner RGB → reflectance density with a known white patch, fit Yule-Nielsen modified Murray–Davies to recover effective dot area, invert to a 1D LUT per ink.

Hard part: the scanner is not a densitometer. Its own gamma, white balance, and auto-exposure need neutralizing before the curve means anything — hence the fixed white/black reference patches printed on the same sheet.

## v1 scope

- Single ink, grayscale in, 1-bit PNG at 300 dpi out.
- Annealer with a temperature slider and a live FFT spectrum readout.
- Printable 21-step wedge PDF + scan-in calibration producing one LUT.
- Side-by-side preview: ordered dither vs annealed, at simulated dot gain.

## Out of scope

- CMYK/offset workflows, ICC profiles, trapping, imposition.
- Vector/line art separations.
- Anything that talks to a printer driver directly.

## Risks & unknowns

- Riso drums have real ink-spread limits; a mathematically perfect blue-noise field may still plug at high coverage.
- Annealing quality vs. speed at poster resolutions (11×17 at 600 dpi is 70M sites) may force a tiled void-and-cluster fallback.
- Studios may not care and just want the Photoshop preset.

## Done means

One physical two-color riso print exists where the annealed version has visibly no moiré against a hand-registered second pass, and its midtones match the on-screen soft proof after calibration — while the same file screened with a 45°/15° line screen shows the plaid.

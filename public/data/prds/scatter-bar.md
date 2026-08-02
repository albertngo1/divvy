## Overview
Scatter Bar is a browser puzzle game about optical proximity correction — the black art that lets 193nm light print 20nm transistors. Each level gives you a target polygon layout and a fixed "scanner" (wavelength, numerical aperture, illumination source shape). You edit the *mask*, not the target, and a real partially-coherent imaging simulation shows what actually prints. For anyone who has ever wondered why chip masks look nothing like chips: EE/physics students, semiconductor-curious hackers, puzzle players who liked TIS-100 and Opus Magnum.

## Problem
Lithography is the most consequential optics on earth and it is invisible to everyone outside the industry. Existing litho simulators (PROLITH, Sentaurus, academic Python notebooks) cost five figures or require reading a textbook first. Nobody has made the core intuition — *the mask must be wrong so the wafer can be right* — into something you can feel in sixty seconds. Meanwhile China standing up domestic immersion DUV is front-page news and the average reader has no mental model of what those machines do.

## How it works
You get a target shape (a contact array, a T-junction, dense lines with an isolated line beside them). Press Print: the sim computes the aerial image, thresholds it into resist, and overlays printed-vs-target with an XOR error area score. Line ends pull back, corners round off, the isolated line prints thinner than the dense ones. Your tools: drag polygon edges (bias), attach hammerhead/serif corrections, and drop scatter bars — thin lines *below the resolution limit* that never print themselves but change the neighborhood's contrast. Scoring isn't a single print: it's the process window. The game sweeps dose ±5% and focus ±100nm, prints a Bossung curve, and scores you on the *area* of the dose-focus region where every feature stays within tolerance. Later levels take away tools, add off-axis annular/dipole illumination you must choose yourself, and cap mask complexity (a real fab constraint — mask writing time is money).

## Technical approach
Stack: TypeScript + WebGL2 (or WebGPU where available) + React shell. Imaging uses the Hopkins partially-coherent formulation, precomputed via SOCS (sum of coherent systems): build the transmission cross-coefficient matrix from source shape × pupil for a given NA/σ/wavelength, eigendecompose it offline in Python (numpy) for each level's optical setup, ship the top ~12 kernels as float textures. Runtime is then just 12 FFT-based 2D convolutions of the mask against complex kernels, magnitude-squared and summed — trivially a fragment-shader loop on a 512×512 grid; GPU FFT via Stockham autosort. Resist model v1 is a constant-threshold cutline; v2 adds a Gaussian diffusion blur (acid diffusion length ~20nm) before thresholding. Defocus is a Zernike Z4 phase term on the pupil, so the dose-focus sweep is 5×5=25 re-renders — still under 16ms. The genuinely hard part is *authoring good levels*: a puzzle needs a solution reachable in ~8 edits that is meaningfully better than the naive one, which means running an inverse-litho optimizer (level-set / gradient descent on the mask) offline to know the par score, and constraining the tool palette so par is discoverable rather than fiddly.

## v1 scope
- One optical setup: 193nm, NA 1.35, annular source, fixed.
- Five levels: isolated line, dense lines, iso-dense pair, line end, contact array.
- Three tools: edge bias, hammerhead, scatter bar (snap to grid).
- Score = XOR error area at nominal dose/focus, plus a 3×3 process-window ring.
- Par score baked into level JSON.

## Out of scope
- Vector/full-EMF mask topography effects, 3D resist, EUV, multi-patterning decomposition, real GDSII import, level editor, leaderboards.

## Risks & unknowns
- Fun risk: this may read as homework. Mitigation is the Print button being instant and the failure being *visually funny* (your square prints as a circle).
- Physical accuracy vs. playability — a scalar Hopkins model with a threshold resist is qualitatively right and quantitatively wrong; label it as a toy, cite the model.
- Scatter bars only pay off when they're genuinely sub-resolution; if grid snapping is too coarse the core mechanic dies.

## Done means
A stranger loads the page, sees a square print as a blob, adds four serifs and two scatter bars, watches the XOR error drop below par, and the Bossung curve visibly flattens — all within three minutes and with no reading.

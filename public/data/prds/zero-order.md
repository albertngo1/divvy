## Overview
A browser tool that converts any black-and-white image into a printable computer-generated hologram (CGH). You get a PDF sized to the millimetre, print it on inkjet transparency film at 1200+ dpi, tape it in front of a $3 red laser pointer, and your image blooms on the far wall as real diffracted light. For makers, physics teachers, generative artists, and anyone who wants an art object that only exists as interference.

## Problem
Holography is treated as either a lab-grade optics project or a novelty sticker. But the Lohmann detour-phase hologram — encode phase by *shifting* apertures inside a cell grid — was designed in the 1960s for plotters with far worse resolution than a modern printer. Nobody has made a friendly tool that goes image → correctly-scaled printable pattern → accurate preview of what the wall will actually look like, including the ugly parts.

## How it works
1. Upload/draw a binary image, choose laser wavelength (650 nm red default, 532 nm green) and throw distance.
2. Run an iterative Fourier transform algorithm (Gerchberg–Saxton): random initial phase, forward FFT, replace the far-field amplitude with the target, inverse FFT, replace the aperture-plane amplitude with unity, repeat ~50 times.
3. Encode the resulting phase field as Lohmann cells: each 8×8 printer-pixel cell contains one rectangular open aperture whose lateral offset encodes phase and whose height encodes amplitude.
4. Simulate reconstruction by FFT-ing the *encoded bilevel pattern* — not the ideal phase — so the preview shows the real speckle, the conjugate twin image, and the blinding zero-order spot in the middle.
5. The app offsets the target off-axis by default so the twin and zero order fall outside your picture, and prints a card: pattern pitch d, diffraction angle sinθ = λ/d, resulting image width at your chosen distance.

## Technical approach
Pure client-side: TypeScript + WebGPU compute shaders for a 2048×2048 complex FFT (Stockham radix-2 ping-pong, ~50 GS iterations in well under a second). Encoding and preview in the same pipeline. Export via a Canvas → PNG at exact pixel dimensions wrapped in a PDF with `pdf-lib` at a locked physical size, plus SVG/DXF export for laser cutters and photoplotters.

The hard part is the physical scale chain: printer dpi sets the cell pitch, cell pitch sets the diffraction angle, and the ink dot gain of a consumer inkjet on transparency film blurs the apertures enough to kill contrast. v1 handles this with a printed test strip — five cell sizes, you photograph which one still resolves — and calibrates the encoder to your printer.

## v1 scope
- Binary image upload, fixed 650 nm, fixed 1024×1024 GS
- Lohmann encoding at one cell size, off-axis by default
- On-screen reconstruction preview (the honest one)
- Exact-scale PDF export + one-page instruction card
- Printer dot-gain test strip generator

## Out of scope
Colour/multi-wavelength holograms, 3-D or volume holograms, phase-only SLM output, animation, cloud rendering.

## Risks & unknowns
Consumer inkjets may not hold 8-pixel apertures cleanly on film — laser printers on film may be required, which raises the barrier. Amplitude holograms are dim; needs a dark room. Laser-safety copy must be prominent and unskippable.

## Done means
A printed transparency from the tool, lit by a class-2 red laser pointer at 2 m in a dark room, projects the input glyph recognisably on the wall, and the on-screen preview visibly matches the photographed result including the position of the zero-order spot.

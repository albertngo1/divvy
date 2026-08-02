## Overview

A browser image editor whose document model is a baseline JPEG's coefficient array. You don't paint pixels that later get compressed — you paint the compressed representation directly, and the decoder shows you the consequence. For glitch artists, demoscene-adjacent people, and anyone who wants compression artifacts as a deliberate medium instead of an accident.

## Problem

Every "glitch" tool works by corrupting bytes and praying, or by re-encoding a PNG at quality 3. Both are indirect: you can't aim. The artifacts people actually love — ringing around hard edges, mosquito noise, blocking, chroma bleed — are precise consequences of specific coefficients, and no tool lets you address them. Meanwhile every normal editor destroys your work on save, because it re-runs a forward DCT over your carefully-built artifact.

## How it works

Open a JPEG. The canvas shows the decoded image with an optional 8×8 block grid. Brushes operate on the coefficient array under the cursor:

- **Basis stamp** — pick one of the 64 8×8 DCT basis functions, stamp it into blocks at an amplitude. This is drawing with the codec's own alphabet.
- **Ringing** — scale high-frequency coefficients up within touched blocks; edges bloom into the classic mosquito halo.
- **Quantize** — locally raise the effective quantizer for touched blocks (zero out coefficients below a rising threshold), painting detail *away* in codec-native steps.
- **DC shift** — move whole-block mean luma/chroma, giving the flat-tile blocking look.

Save writes a real `.jpg` whose coefficients are exactly the ones on screen. No round trip, no drift.

## Technical approach

TypeScript + Vite, no framework needed. Parse with a forked `jpeg-js` decoder cut off before the IDCT so it hands back per-component `Int16Array` blocks plus the quantization tables — model: `{components: [{blocksPerLine, blocksPerColumn, coeffs: Int16Array, quantTableId}], quantTables: Uint16Array[]}`.

Rendering: WASM (Rust, `wasm-bindgen`) IDCT with a dirty-block set, so only touched 8×8 blocks recompute and blit into an `ImageData` backing a canvas. That keeps a 24MP photo interactive because a brush stroke touches tens of blocks, not millions.

The hard part is **saving**. Mainstream encoders only expose "give me pixels, I'll DCT them." Writing coefficients straight out means implementing the entropy-coding half yourself: zigzag, DC differential prediction per component, run-length of AC zeros, and Huffman coding — plus a symbol-frequency pass to emit optimized tables, the way `jpegtran` does for lossless transforms. `jpegtran`'s coefficient API is the reference implementation to read.

Second hard part: **chroma subsampling**. At 4:2:0 one cursor position lands on a different block index per component, so brushes need per-component grid mapping and a UI hint for which plane you're editing. v1 sidesteps this by only accepting 4:4:4.

## v1 scope

- Load baseline, non-progressive, 4:4:4 JPEGs only. Reject anything else with a clear message.
- Three brushes: basis stamp, ringing, DC shift.
- Block-grid overlay toggle and a single-level undo.
- Export a valid `.jpg` via the hand-rolled Huffman encoder.

## Out of scope

- Progressive JPEG, 12-bit, arithmetic coding, CMYK.
- Layers, selections, filters, anything a real editor has.
- Video / MPEG coefficient editing.

## Risks & unknowns

- Hand-rolled Huffman encoding is fiddly; an off-by-one in DC prediction silently smears the whole image and is miserable to debug. Mitigation: round-trip test against `djpeg` from the first commit.
- Decoders disagree slightly on IDCT rounding, so the in-app preview may differ from Preview.app by ±1 LSB. Fine for art, worth stating.

## Done means

Load a photo, stamp a mid-frequency basis function across a region, export, and `djpeg -verbose` on the saved file dumps coefficients matching the editor's array exactly — while the image opens normally in Preview and Chrome showing the painted artifact.

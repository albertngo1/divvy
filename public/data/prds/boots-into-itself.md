## Overview

A browser tool that converts any image into a **CHIP-8 ROM whose bytes are the image**. Hex-dump the file and render each byte as pixels: you see the picture. Load the same file into any unmodified emulator: it runs, and draws that picture. For demosceners, esolang people, zine-makers, and anyone who liked the "valid DOS COM made of emoji" trick and wished it were a tool instead of a stunt.

## Problem

Polyglot files — a thing that is validly two formats at once — are hand-crafted one-offs by a handful of people. There is no generator. Meanwhile "generative art" has settled into shaders and noise fields; a piece whose *medium is the instruction encoding* is a genuinely unexplored constraint space, and it's small enough to actually search.

## How it works

CHIP-8 is the right target because its sprites are 1 bit per pixel, laid out as raw bytes — the image data format and the code live in the same flat address space at 0x200.

1. Upload an image. It's resized to 64×32 (or a taller scrolling canvas) and dithered to 1-bit.
2. The first ~48 bytes are the **carrier**: a hand-written loop that clears the screen, then `DXYN`-blits the rest of the ROM — itself — to the framebuffer row by row, then halts on a self-jump.
3. Every remaining byte must satisfy two constraints at once: it is a pixel row of the target image, *and* the byte stream must decode as legal, inert CHIP-8 instructions (strict mode) or be provably jumped over while still decoding legally (lazy mode).
4. Encoder: an inert-opcode table (register-to-register moves into scratch registers, `8XY0` family, no-op-equivalent arithmetic) defines the set of byte pairs that are safe. A beam search over dithering choices picks, for each 16-bit instruction slot, the safe encoding whose bit pattern is closest to the target pixels.
5. Preview runs live in an in-page emulator; download `out.ch8`; a side panel shows the hex dump styled as the image so you can see both readings at once.

## Technical approach

TypeScript + Vite, canvas rendering, a ~200-line CHIP-8 interpreter for preview. The encoder is the interesting part: error-diffusion dithering (Floyd–Steinberg) **restricted to the reachable byte set**, wrapped in a beam search (width ~64) over instruction-slot choices, scored by summed per-pixel error plus a penalty for opcodes that touch state the carrier depends on.

The hard part is that "legal decode" ≠ "harmless". Thousands of inert instructions still mutate registers, and a stray `00EE` return or a jump into the raster region wrecks everything. So the safe set has to be closed under execution: no control flow, no memory writes, no register the carrier reads. That shrinks the palette of usable byte pairs enough that fine detail may be unsatisfiable — hence lazy mode as the escape hatch, where the raster region is skipped by a jump but still decodes cleanly.

## v1 scope

- CHIP-8 only, 1-bit, 64×32, strict mode only
- One upload → one download, no gallery, no accounts
- Live preview in-page
- Side-by-side hex-as-image view

## Out of scope

DOS `.COM` and x86, color, animation, sound, embedding a real payload, self-modifying tricks.

## Risks & unknowns

Strict mode may be infeasible for busy images — need a graceful "here's the best I got at 78% fidelity" rather than a failure. The safe-opcode table is hand-derived and could be subtly wrong. And the charm has to survive the second look: if the output picture is unrecognizable mush, the trick dies.

## Done means

Upload a photo, download `out.ch8`, run it in a third-party emulator you did not write — it displays a recognizable version of the photo, and the hex dump rendered as pixels matches what's on screen.

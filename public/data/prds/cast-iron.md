## Overview
Cast Iron is an explorable explanation shaped like a map. The territory is the entire 32-bit float space; the terrain is what happens when you cast each one to `int`. Pan and zoom like a slippy map, click any pixel to see the float and a table of what six real targets return. For anyone who has read "it's undefined behavior out of range" and never seen the *shape* of that statement.

## Problem
Float-to-int conversion UB is transmitted as folklore: everyone repeats the rule, almost nobody knows that x86 hands you `INT_MIN` as a sentinel, ARM saturates, wasm traps or saturates depending on opcode, Rust saturates since 1.45, and JS `|0` wraps modulo 2^32 — nor that clang at `-O2` will constant-fold an expression into an answer the same binary's runtime path won't produce. The divergence is real, reproducible, and completely invisible in prose.

## How it works
The canvas is a 65536×65536 grid laid out along a Hilbert curve over the uint32 bit pattern, so neighboring pixels are neighboring floats and zooming in is genuinely zooming into numeric space. Color encodes a classification enum: *exact*, *truncates identically everywhere*, *targets disagree* (hue picks which cluster), *sentinel*, *saturates*, *wraps*, *traps*, and the spicy one — *compiler disagrees with its own runtime*.

A sidebar scrolls prose that drives the camera: "here is 2^31 exactly — watch the continent split," "here is the denormal coastline where everyone agrees," "here is where -O2 lies to you." A search box takes a literal (`2147483648.0`, `0x4F000000`, `nan`) and flies to it.

## Technical approach
Probe programs per target: C compiled by clang for x86-64 (`cvttss2si`), aarch64 (`fcvtzs`), riscv64 via `qemu-user`, plus wasm via `wasmtime` (`i32.trunc_f32_s` and `_sat_f32_s`), Rust (`as` vs `to_int_unchecked`), Java `(int)`, C# checked/unchecked, and JS `|0` under node. Constant-folding divergence is caught by emitting the same expression twice — once as a compile-time constant in a separate TU, once behind an `-O0` opaque function pointer — and diffing.

The trick that makes this buildable: **never render four billion pixels.** Each target's behavior is piecewise-constant over a handful of intervals in bit-pattern order, so you find boundaries by bisection (a few thousand probe calls, not 2^32), store an interval list per target as JSON of maybe a few hundred entries, and render tiles *analytically* — a tile's color at any zoom is a interval-list intersection query, computed in a canvas worker in milliseconds. The whole dataset is a file you could paste in a gist.

The genuinely hard part is Hilbert↔interval math: interval boundaries in linear bit order become jagged fractal regions on the curve, so tile rendering needs a fast "which linear ranges intersect this Hilbert tile" decomposition rather than per-pixel inverse mapping.

Frontend: plain canvas + a small custom tile layer, no map library; d3-zoom for transform; prose panels in Markdown.

## v1 scope
- Three targets only: x86-64 `-O0`, x86-64 `-O2` constant-folded, aarch64
- Positive finite floats only (half the map is blank and that's fine)
- Three fixed zoom levels, pre-rendered PNG tiles
- One scrollytelling passage, one search box

## Out of scope
- float64→int64 (same code, 2^64 space, later)
- Live in-browser compilation
- Any claim of standards authority — this shows behavior, not law

## Risks & unknowns
- Emulated targets (qemu) may not reproduce silicon exactly; must be labeled as emulated.
- Compiler versions matter; boundaries could shift between clang releases, so the dataset needs a version stamp.
- Risk that the map is beautiful but the prose fails to make anyone care — the writing is the product.

## Done means
A visitor types `2147483648.0`, the map flies to it, and a table shows x86 returning `-2147483648`, aarch64 returning `2147483647`, and clang's constant-folded answer differing from its own runtime answer — with a copy-pasteable C snippet that reproduces it locally.

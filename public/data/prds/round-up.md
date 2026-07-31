## Overview
An explorable explanation of allocator slop — the gap between the bytes you asked for and the bytes actually reserved. A single log-scale plot from 1 B to 4 MB showing the size-class staircase of glibc malloc, tcmalloc, jemalloc, and mimalloc side by side, plus a mode where you drop in your own program's allocation histogram and see what each allocator would have cost you. For systems programmers and the merely curious.

## Problem
Everyone knows "allocators round up to size classes" and nobody can picture it. The tables are buried in source (`tcmalloc/size_classes.cc`), the shape is genuinely interesting — a sawtooth of waste that spikes to ~25% just past each class boundary — and the practical consequence (shave 8 bytes off a hot struct, drop a whole size class, save 20% of RSS) is invisible without measurement. There is no picture of this on the internet.

## How it works
The main view is a step function per allocator on a log-x axis, with a waste-ratio ribbon underneath. Hovering reads out: `1025 B → 1280 B · 24.9% slop · tcmalloc class 47 · 32 objects/span, 96 B page leftover`. A diff mode overlays two allocators and shades where one wins. The second view is BYO data: run a tiny `LD_PRELOAD`/`DYLD_INTERPOSE` shim under your program, get a `size → count` histogram JSON, paste it in, and get total slop per allocator plus a ranked "top 10 allocation sites by wasted bytes" and a shave-simulator slider — pull your struct down by N bytes and watch which classes the histogram falls into.

## Technical approach
Crucially, don't transcribe tables from source — *measure*. A small C harness links each allocator in turn, calls `malloc(n)` for every n in 1..4 Mi (stepping by 1 below 64 Ki, then by 64), and records the true reservation via `malloc_usable_size` / `tc_malloc_size` / `mi_usable_size` / jemalloc's `malloc_usable_size`, emitting NDJSON. Run-length-encode the step function; the whole thing collapses to a few hundred intervals per allocator, so the front end is plain d3 + SVG with no sampling or canvas tricks. The shim is ~60 lines: `dlsym(RTLD_NEXT, "malloc")` in a constructor, an exact-size hash bucket for n < 4096 and log₂-with-8-subbuckets above, dumped at `atexit` — no symbolization needed for v1.

The genuinely hard part is honesty: `usable_size` is a *lower* bound on cost. Real waste includes per-span page leftovers (tcmalloc packs k objects into a span of p pages; `p*4096 - k*class_size` is stranded), thread-cache high-water marks, and metadata headers (glibc's 8-16 B chunk header is already folded into usable_size; jemalloc's is not, and lives out-of-band). The viz has to model span packing per size class or it will confidently understate waste by several percent and be worse than no chart.

## v1 scope
- glibc and tcmalloc only
- Static pregenerated JSON committed to the repo, no harness in CI
- One chart, hover tooltip, no diff mode, no upload, no shim

## Out of scope
- Fragmentation over time, free-list behavior, lifetime/arena effects
- Go, Rust (`std` just wraps the system allocator anyway), and JS engine allocators
- Anything requiring the user to install a profiler

## Risks & unknowns
Measured `usable_size` may hide exactly the interesting part, in which case the span-packing model becomes the whole project rather than a footnote. Numbers are per-build and per-platform — a macOS reader will see a chart that doesn't describe their libmalloc at all, so platform labeling has to be loud. Audience may be small and already know the answer.

## Done means
Hovering 1025 B on the published page reports usable sizes matching what a two-line C program prints on a machine with the same allocator builds, for both allocators, at ten spot-checked sizes — and a sample histogram from a real program shows a >10% total-slop difference between the two.

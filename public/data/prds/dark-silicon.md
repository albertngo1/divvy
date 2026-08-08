## Overview

A macOS menubar app for anyone who thinks their laptop is more mysterious than their laptop lets on. It spends idle cycles executing randomly chosen 32-bit ARM64 encodings inside a disposable sandbox process and records what happened: illegal instruction, segfault, silent no-op, register mutation, hang. Over days it fills in a picture of *your specific chip's* instruction space, rendered as a Hilbert-curve heatmap you can set as your desktop background.

## Problem

There is no beautiful map of an instruction set. Sandsifter did this for x86 and produced a legendary but ugly scatter plot; nobody has done it for Apple Silicon, and nobody has made it *ambient*. The ISA manual describes the encodings ARM documented — the space is 2^32 wide and most of it is unallocated, reserved, or implementation-defined, and only your own silicon can tell you which. It is a dataset that exists in every machine and has never been made pretty.

## How it works

The menubar item shows a tiny live thumbnail and a percentage: `0.0031% mapped`. On idle (no user input for 30s, on AC power), a worker `fork()`s a child, `mmap`s a page RWX, writes `[candidate_instruction, brk #0]`, snapshots all 31 general registers plus NZCV to known sentinel values, jumps to it, and reports the outcome over a pipe. The parent classifies via wait status and the child's register delta: `SIGILL` (undefined), `SIGSEGV/SIGBUS` (executed, touched memory), `SIGTRAP at brk` (executed and returned — then diff the registers), timeout (hung). Results append to a SQLite table keyed by encoding. A background renderer maps encoding → Hilbert curve position → color by outcome class, writes a PNG, and (optionally) sets it as wallpaper. Sampling is stratified: walk the ARM ARM's top-level `op0` decode groups so the picture fills in evenly rather than as noise, and bias toward the *boundaries* of known-allocated regions, where the interesting stuff lives.

## Technical approach

Swift + AppKit for the menubar, a small C core for the probe loop. The hard parts, honestly:

1. **W^X on Apple Silicon.** You cannot have a page writable and executable at once — use `MAP_JIT` plus `pthread_jit_write_protect_np()`, and sign the app with `com.apple.security.cs.allow-jit`.
2. **Not wedging the machine.** Every probe runs in a forked child with `setrlimit`, an alarm-based timeout, and a hard cap of one probe in flight; a hung child is `SIGKILL`ed and its encoding recorded as `hang`. Probes never run while on battery or under memory pressure.
3. **Distinguishing "unallocated" from "privileged".** EL0 will `SIGILL` on plenty of encodings that are perfectly real at EL1 — the legend has to say `undefined *to you*`, which is arguably a nicer fact anyway.

Data model: `probe(encoding INTEGER PRIMARY KEY, outcome TEXT, reg_delta BLOB, chip TEXT, os_build TEXT)`. Optional opt-in export merges results across users so `M1 vs M4` diffs become a thing.

## v1 scope

- Menubar icon, percent-mapped counter, pause switch
- Probe loop over a single decode group (data-processing immediate) — a few million encodings, not the whole space
- Four outcome classes, no register-delta analysis
- PNG render on a timer; "Set as wallpaper" button
- SQLite file the user can find and delete

## Out of scope

x86/Rosetta probing, multi-instruction sequences, crowd-sourced merge, any claim of finding a real undocumented instruction.

## Risks & unknowns

Code-signing friction for JIT entitlement; kernel panics from pathological encodings (rare on ARM, not impossible — ship with a big warning and idle-only defaults); Gatekeeper will hate this; usefulness is aesthetic, not practical, which is the point.

## Done means

After one overnight idle run on an M-series Mac, the wallpaper shows a recognizably structured Hilbert map — contiguous colored blocks where the ISA allocates encodings, black voids where it doesn't — and the app has never required a force-quit or a reboot.

## Overview

A command-line tool and small web UI that generates abstract, De Stijl–ish color-block images which are also executable Piet programs. You give it a string; it gives you a 2560×1440 PNG that looks like it was composed on purpose and, run through `npiet`, prints that string. For people who like generative wallpapers but find them decorative and weightless.

## Problem

Generative art is almost always inert: pretty pixels with no constraint behind them except the artist's taste. Esolang art (Piet) is the opposite: programs that technically render as images but look like exploded confetti, because nobody optimizes the layout for anything but compiling. Nobody has treated "must execute correctly" as an aesthetic constraint and then searched the remaining freedom for beauty. The constraint is what makes the composition non-arbitrary — you can see, looking at it, that it couldn't have been otherwise.

## How it works

1. Choose output text (fixed string, today's date, a days-until countdown) and a composition style.
2. The tool compiles the text into a Piet op sequence, lays those ops out as colored blocks along a routed path through a grid, anneals the layout against an aesthetic objective, verifies by actually running an interpreter, and writes a PNG.
3. Optional: a launchd job regenerates it each morning so the wallpaper is a program that prints the current date.

## Technical approach

Rust (or Python + numpy for v1, honestly fine). Piet semantics: 20 colors — 6 hues × 3 lightnesses, plus black and white. The instruction executed is determined *only* by the hue-step and lightness-step between consecutive codel blocks, and `push` pushes the block's area. That gives a precise search space:

- **Codegen**: emit a stack program producing each character code then `outchar`. Because push cost equals block area, large char codes are built by factorization (`push 8, push 13, mul` → 104) — a small DP over factorizations minimizes total area, which is what keeps blocks from becoming enormous ugly slabs.
- **Coloring**: once the op sequence and one starting color are fixed, every subsequent block color is fully determined. The only global color freedom is the 20 palette rotations — cheap to brute-force, and it's what lets you bias the piece warm or cool.
- **Layout**: route a serpentine path through a grid; each block must have area ≥ its required push value and must be entered/exited on the correct edges (direction pointer + codel chooser rules). Simulated annealing over block shapes and path routing with an objective combining color-histogram balance, aspect ratios near φ, block-size rhythm, and a penalty for same-color adjacency that would silently merge two blocks into one — the bug that eats most naive Piet generators.
- **Verification**: subprocess `npiet`, compare stdout, reject and re-anneal on mismatch. Never ship an unverified image.

The genuinely hard part is the dead space. A wallpaper is mostly not on the execution path, and decorative filler can hijack the pointer. v1 fences the live path inside black borders (black blocks stop the pointer, which is provably safe) and treats the remaining regions as free canvas.

## v1 scope

- One style (rectangular grid, black gutters)
- Fixed ASCII output string, ≤ 24 chars
- Single fixed canvas size, codel size 8px
- `npiet` verification in-loop; PNG out

## Out of scope

Animation, GIF, quines, self-printing images, macOS wallpaper daemon, input-reading programs, any non-Piet esolang.

## Risks & unknowns

Piet's 20-color palette is loud and may be unsalvageable at wallpaper scale; the mitigation is palette rotation plus generous black/white negative space, and if that fails the project is a poster generator, not a wallpaper. Codel-chooser edge cases around non-rectangular blocks are the classic source of "compiles on my interpreter only" — test against two interpreters.

## Done means

`npiet out.png` prints the exact intended string for 20 random 24-char inputs, and in a blind test 5 of 8 people pick the generated image over a random-color Piet program of the same size as "looks deliberately composed."

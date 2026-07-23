## Overview
Half-Space is a solo, offline puzzle game about building the graphics pipeline by hand. You wire up vertex sources, transforms, a half-space triangle rasterizer, and a per-fragment stack VM to reproduce a target raster, then golf your solution down. For programmers who've skimmed tinyrenderer or LearnOpenGL and nodded along without ever *feeling* how a triangle becomes pixels.

## Problem
The rasterization pipeline stays abstract for most people who use it. Edge functions, barycentric interpolation, depth testing, and blend order are 'magic that GPUs do.' No game makes you internalize the half-space test the way SpaceChem made you internalize reaction pipelines. The recurring HN love for software-rendering tutorials proves the appetite; nobody's turned it into play.

## How it works
Each level shows a small target raster (e.g. 32×32) and a node canvas. You place: vertex sources (positions, per-vertex attributes), transform nodes (matrix mul, viewport), a rasterizer node exposing the edge/half-space coverage test, and per-fragment ops on a fixed-cycle stack VM — interpolate attribute, compare-depth, blend, discard, write. You tune constants and wire the graph; the framebuffer updates live. A level is solved when output matches the target within a pixel/SSIM threshold. Three leaderboards per level: instruction count, node count, cycles. Later levels escalate: gouraud gradients, z-fighting traps, correct transparency ordering, and golf challenges ('paint this gradient with ≤3 triangles').

## Technical approach
TypeScript + Canvas2D for UI, a deterministic software rasterizer running in a Web Worker so scoring is byte-reproducible across machines. The node graph compiles to bytecode for a fixed-cycle stack VM (à la TIS-100), which is what makes the cycle metric fair and the optimization real. Targets are authored plus procedurally generated; the match gate uses exact pixel diff for hard levels and MS-SSIM for tolerance levels. Hard part: designing an instruction set expressive enough to be fun yet constrained enough that minimizing instructions/cycles is a genuine, satisfying puzzle rather than trivia — and a cycle-cost model that mirrors real GPU intuition without lying.

## v1 scope
- 8 hand-authored levels: flat triangle → gouraud → depth test → one transparency-ordering puzzle
- Node editor with ~10 node types and the fragment VM
- Deterministic worker rasterizer + pixel-diff gate
- Local best-score tracking (no server)

## Out of scope
- Textures, mipmaps, perspective-correct interpolation
- Online leaderboards, accounts, sharing
- 3D scenes / real depth buffers beyond 2 layers

## Risks & unknowns
- Instruction set could land either too fiddly or too shallow; needs playtesting
- Making 'match the image' feel like logic, not pixel-hunting
- Onboarding non-graphics players to barycentric ideas without a lecture

## Done means
A player can open the game, solve the flat-triangle level, and see three separate scores; re-loading a saved solution reproduces the exact same framebuffer and cycle count on a different browser.

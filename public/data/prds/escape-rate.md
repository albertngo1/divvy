## Overview
Escape Rate is a small WebGPU physics toy and puzzle game about open chaotic scattering. You drop circular mirrors into an open arena, fire a wave pulse in, and the game measures how fast energy leaks back out to infinity. Your score is that decay rate, and lower is better. It is unwinnable by construction: the fractal uncertainty principle says an open system whose trapped rays form a fractal always has a strictly positive spectral gap, so the leak never reaches zero. For anyone who likes explorable explanations, chaos, or a leaderboard with an asymptote.

## Problem
Chaotic scattering, trapped sets, and spectral gaps are gorgeous and completely locked inside papers and Julia notebooks. There is no artifact where you can *feel* that a fractal set of trapped trajectories forces a leak. Also: the standard demo (three-disc scatterer) is always shown as a static picture, never as something you build.

## How it works
- **Build:** place 3–8 circular mirrors on a plane. A rule-of-thumb readout updates live: obstacle separation vs radius controls how thin the trapped set is.
- **Ray layer:** the game shoots ~200k rays and box-counts the survivors after N bounces to estimate the trapped set's dimension δ. That fractal dust is drawn as a glowing filigree between the discs — it *is* the picture of what you built.
- **Wave layer:** a 2D scalar-wave FDTD with a PML absorbing frame runs a pulse and logs total interior energy E(t). Fit log E(t) → the escape rate γ.
- **Score:** γ against the classical bound. When δ < 1/2 the bound is essentially 1/2 − δ; the fun is that pushing δ past 1/2 (thicker trapped set) *still* leaves a gap, which is the new theorem. The gauge shows your γ and the floor beneath it, and the floor never reaches zero.
- **Generative mode:** every launch seeds a fresh mirror arrangement, renders its filigree as a still, and captures the wave's ringdown as an impulse response — a screensaver that leaves behind a new convolution reverb every day. Drop the WAV in any DAW and the cavity you never saw becomes a room you can sing in.

## Technical approach
TypeScript + WebGPU compute. FDTD on a 1024² grid, Yee-style leapfrog for the scalar wave equation, split-field PML 32 cells deep, mirrors as Dirichlet masks (stair-stepping is the accuracy sin — mitigate with 4× supersampled masks). Energy integral reduced on-GPU per 64 steps, decay fit by least squares on the log tail after the transient. Ray tracer is analytic circle intersection in a separate compute pass; box-counting on a 512² occupancy grid over survivors. IR export = pressure at a probe cell, normalized, written as 48 kHz WAV via a Blob. Hard part: separating true escape-rate decay from PML absorption artifacts and grid dispersion — calibrate against the three-disc scatterer, whose gap is known in closed form.

## v1 scope
- Fixed arena, 3 movable discs of fixed radius
- One pulse source, one energy plot, one γ number
- Ray filigree render, no dimension estimate yet
- Screenshot export

## Out of scope
3D, dielectric or partial mirrors, quantum-resonance eigenvalue solving, levels/progression, multiplayer.

## Risks & unknowns
FDTD may be too coarse to show a clean exponential in the time a browser tab tolerates; the map from measured γ to the theoretical gap involves constants that hand-waving will not survive; the theorem's actual statement is subtler than the game's framing and a physicist will say so.

## Done means
Three discs in the classic equilateral configuration produce a visibly exponential energy decay whose fitted γ matches the published three-disc value within 10%, and sliding one disc outward makes γ rise on screen while the filigree visibly thins.

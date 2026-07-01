## Overview
Echo Field is a survival game where your eyes lie. You can't tell what anything is made of by looking — every object renders as an ambiguous grey blob in fog or low light. You carry a handheld mmWave radar and must read each object's echo signature to know whether that berry, beam, or pool is food, fuel, or poison. Identification itself is the core loop.

## Problem
Every survival game on the Steam charts (Raft, Sons of the Forest, Don't Starve) identifies materials by sight — you see wood and you *know* it's wood. That makes gathering a rote checklist. The mmWave material-classification demos on HN suggest a fresher loop: what if reading the signal were the gameplay, and looking told you almost nothing?

## How it works
Objects look alike. You aim the scanner, hold to sweep, and get an echo trace: metal rings bright and sharp, water absorbs into a flat return, organic matter scatters into noise, plastic "ghosts" with a weak double-peak. You learn to read waveforms and build a personal signature library. Scanning costs battery and time while threats close in, so every scan is a small gamble: identify before you commit to eating, burning, or building with a thing.

## Technical approach — be specific and technical
Stack: web build for reach — TypeScript + a lightweight engine (Phaser 3 for 2D, or Three.js if it goes 2.5D). Signal visualization on `<canvas>` overlaid on the game view. No real hardware; the radar is simulated.

The echo model is the heart. Each material has an archetype return synthesized from a small physically-motivated model: a base reflectivity (proxy for dielectric permittivity — metal high, water high-but-absorptive, organics low/scattered, air-gap plastic weak), plus characteristic peak count, peak sharpness (Q), and noise floor. The trace is an amplitude-vs-range 1-D array: a sum of Gaussians at material-specific ranges, scaled by reflectivity, plus per-scan random noise so no two sweeps are identical. `Material { id, name, reflectivity, peaks:[{range,amp,width}], noiseFloor, class:'food'|'fuel'|'poison' }`.

Classification is the *player's* skill, but a "codex" match-assist can score a live trace against stored signatures via normalized cross-correlation or RMS distance over the resampled array — used later for a scanner-upgrade auto-ID feature. v1 just draws the trace and lets the player guess.

Rendering the trace: a 256-sample Float32 array → polyline on canvas, with a sweep animation revealing samples left-to-right. Battery is a per-scan cost timer.

The genuinely hard part: designing echo archetypes that are *distinguishable enough to learn* but *ambiguous enough to be a skill* — noise, peak overlap, and confusable pairs (plant-that-echoes-like-poison) must be hand-tuned so the read-the-signal intuition clicks in two or three scans, not fifty.

## v1 scope (humiliatingly small)
- One room, three objects, all identical grey blobs
- Point scanner at one → show a 1-D echo trace with a characteristic peak per material
- Player types/guesses the material; correct guess reveals it
- No survival, threats, map, or battery

## Out of scope (for now)
- Threats, hunger, crafting, world generation
- Battery/time pressure, scanner upgrades, auto-ID
- 3D world, inventory, multiplayer
- Sound/haptics for the sweep

## Risks & unknowns
- Traces may be too similar (frustrating) or too obvious (trivial)
- Real mmWave physics is complex; the simplified model may feel fake
- "Type the material" is clumsy — may need a wheel/picker UI

## Done means — concrete, testable
A player who has never seen the game can, after two or three scans, correctly distinguish metal from water from plant purely by the shape of the echo trace — the read-the-signal skill clicks.

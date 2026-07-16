## Overview
Uptake is a live wallpaper (macOS/Windows/Linux) for the ambient-computing hobbyist who likes their machine to quietly make something. It renders a growing crystalline lattice modeled on a metal-organic framework (MOF) — the porous 'miracle materials' that adsorb gases into a cage of metal nodes and organic linkers. Each day it captures one slice of your local air, and over a year the crystal accretes into a unique, printable art object.

## Problem
Ambient artifacts that generate over a year (satellite barcodes, length-of-day rings) are compelling but rarely tied to something *you* physically inhabit. Air quality data is abundant and personal but consumed as a boring AQI number you glance at and forget. There's no keepsake made of the air you actually breathed.

## How it works
Every night Uptake pulls the day's air metrics for your location and 'grows' the framework accordingly. High CO₂/particulates fill more pores (guest molecules render as tiny spheres nested in the cages); clean days grow open, airy cells. Pollutant *mix* drives node/linker geometry (a zinc-carboxylate cube for one profile, a copper-paddlewheel for another), so a smoggy week looks structurally different from a crisp one. Color maps to temperature; growth *rate* maps to wind. The lattice extrudes outward like a coral, one unit cell per day, always visible on your desktop. On Dec 31 it exports a high-res still and a rotating 3D turntable.

## Technical approach
Stack: Rust + wgpu (or a Tauri app wrapping a WebGL2 canvas) for the persistent renderer; a small nightly job for data. Data sources: OpenAQ API and/or PurpleAir for outdoor PM2.5/PM10/O₃/NO₂; optionally a local CO₂ sensor (SCD40 over serial) for indoor mode. Data model: an append-only SQLite table of daily readings; the crystal is deterministically regenerated from the full log each launch (so it's reproducible and seed-stable). Geometry: instanced rendering of a small library of real MOF unit-cell topologies (pcu, sod, dia nets) — nodes and linkers as instanced meshes, guest molecules as billboarded spheres. Key algorithm: map a normalized feature vector (pollutants, temp, wind) → (topology choice, pore-occupancy fraction, cell color, growth vector). The genuinely hard part is making a year of daily cells cohere into one *beautiful* structure rather than mush — needs a growth heuristic that biases new cells to attach along a pleasing space-filling curve, not random accretion.

## v1 scope
- One MOF topology (pcu cubic net), instanced rendering
- OpenAQ nearest-station pull, nightly, SQLite log
- Pore occupancy from PM2.5; color from temperature
- Desktop wallpaper on one OS (Tauri + WebGL2)
- Manual 'export PNG' button

## Out of scope
- Multiple topologies / structure-from-pollutant-mix
- Indoor CO₂ sensor integration
- 3D turntable export, print pipeline

## Risks & unknowns
- OpenAQ station coverage is sparse in rural areas (fallback to a modeled AQI API)
- Deterministic regen from a growing log could get slow near day 365 — cache the mesh
- Aesthetic risk: MOFs are visually busy; may look like clutter, not a jewel

## Done means
After 14 real days of running, the wallpaper shows a 14-cell lattice whose pore density visibly tracks the AQI history, the SQLite log has 14 rows, relaunching reproduces the identical crystal, and 'export PNG' yields a shareable image.

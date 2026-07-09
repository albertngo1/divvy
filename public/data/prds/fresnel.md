## Overview
Fresnel is a browser-based daily puzzle for 3D artists, shader nerds, and the merely curious. Each day it names a real-world material ("anodized aluminum," "cooked ham," "old vinyl record") and shows a reference photo; you sculpt a live-rendered sphere with a handful of PBR sliders to match it, then get scored on how close your guessed physical parameters are to the measured ground truth.

## Problem
Everyone who touches a PBR workflow secretly guesses material values. Roughness 0.4 or 0.6? Is skin metallic (no) and what's its IOR (~1.4)? There's now a beautiful open reference — physicallybased.info — cataloging measured albedo/roughness/IOR/specular for hundreds of materials, but nobody drills those numbers into muscle memory. Reference tables are passive. A daily scored game turns "looking it up" into "knowing it."

## How it works
One material per UTC day (seeded, everyone gets the same). You see the name + a reference render/photo and a control panel: base color (picker), metalness, roughness, IOR, specular tint. A real-time WebGL sphere updates as you drag. Submit locks your guess; score = weighted distance between your parameters and the database's measured values (color in perceptual ΔE, scalars normalized). You get a Wordle-style emoji share (🟩🟨⬛ per parameter) and a global percentile. Streaks and a "hard mode" that hides the reference photo (name only).

## Technical approach
Static site: Vanilla + Three.js/`MeshPhysicalMaterial` (or a raw GLSL Cook-Torrance shader for accuracy). Ground-truth data ingested from physicallybased.info's public JSON into a bundled `materials.json` (attribution + license honored). Daily selection = hash(date) → index. Scoring: color distance via CIE ΔE2000 on the base albedo; scalar distance via clamped normalized L1 with per-parameter weights (roughness matters more than specular tint). Share string and streaks in `localStorage`; optional global leaderboard via a tiny Cloudflare Worker + KV keyed by date hash. Hard part: making the scoring feel *fair* — measured metalness is binary-ish while artists think in gradients, so the rubric needs playtest tuning and forgiving bands.

## v1 scope
- 30 hand-picked materials with clean measured values
- One WebGL sphere, 5 sliders, submit + score
- ΔE + L1 scoring, emoji share string
- Streak counter in localStorage

## Out of scope
- User accounts, global leaderboard (stub only)
- Custom lighting environments / HDRIs
- Non-sphere geometry, texture maps, anisotropy

## Risks & unknowns
- License/attribution terms of the source database must be respected
- Scoring fairness (metalness cliff) is the main playtest risk
- Niche appeal — may land with graphics folks but bounce off everyone else

## Done means
On a fresh browser I can load today's puzzle, adjust sliders to match a rendered target, submit, and receive a 0–100 score plus a shareable emoji grid that reproduces identically on another machine for the same date.

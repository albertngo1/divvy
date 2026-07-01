## Overview
Confluence is a live desktop wallpaper (and screensaver) that runs a slow, year-long cell culture. It starts as a single synthetic cell on a dark petri-dish field. Roughly once per real day the culture attempts to divide, but *how* it divides — direction, color, mutation, health — is driven by signals from your own computer usage. By month twelve you have a dense, branching colony that is a legible ambient artifact of your year, no two people's alike. It's for people who love Wallpaper Engine but are tired of loops that reset every reboot.

## Problem
Ambient desktop art is either static or a short loop — it has no memory. Meanwhile our machines log a rich, mostly-invisible record of how we spend our days that we never get to *feel*. Confluence turns that exhaust into a single slow-growing living thing you glance at all year.

## How it works
Each cell has genes: split-angle bias, hue, division rate, apoptosis threshold. Every day the engine reads a rollup of local activity (active hours, app categories, keystroke/commit volume, late-night vs morning). High-focus days grow healthy daughter cells along a coherent front; fragmented days sprout scattered off-shoots; a day you never opened the laptop leaves a visible dead ring (a "varve" of absence). Cells inherit parent genes with small mutations, so streaks compound into recognizable structures. Confluence — the point where cells fill the dish — triggers a gentle die-back and a new generation, marking seasons.

## Technical approach
Rust + wgpu for the renderer so it can be a real wallpaper backend (Linux via a layer-shell surface, macOS via a desktop-level NSWindow, or shipped as a Wallpaper Engine web wallpaper using WebGL2). Growth is a lightweight agent-based sim on a hash grid, not per-pixel CA, so 50k cells stay cheap. Local signals come from ActivityWatch's REST API (`localhost:5600/api/0/buckets`) for app/afk data, plus optional git-commit counts via a watched folder. State is a single append-only JSONL of daily snapshots (seed, gene pool, day index) so the whole year is deterministically replayable from ~a few hundred KB. The genuinely hard part is *legibility*: making the mapping from activity → morphology feel meaningful and pretty rather than random noise — that's a tuning/aesthetics problem, solved by seeding with a fixed PRNG and hand-designing a handful of growth "rules" per activity archetype.

## v1 scope
- Single-window WebGL2 build (skip native wallpaper integration)
- One input signal only: daily active-minutes from ActivityWatch
- Deterministic daily tick you can fast-forward with a scrub slider
- Export the current colony as a PNG

## Out of scope
- Cross-machine sync, multi-device colonies
- Real native wallpaper backends for all three OSes
- Social/sharing gallery

## Risks & unknowns
ActivityWatch dependency limits reach (mitigate with a manual CSV importer). Aesthetics could read as a smear instead of a story. A year is a long feedback loop — needs a compressed sim mode to iterate.

## Done means
Running the scrub slider over 365 fake activity-days produces a distinct, replayable-from-seed colony, and two different activity logs visibly produce two different colonies.

## Overview
Packrat is an ambient desktop/menubar toy that inverts the entire 'clean up your disk' genre — tools like Leaves, ncdu, DaisyDisk, and every Marie-Kondo storage app exist to help you delete. Packrat exists to make you hoard, and to make deletion feel like a small ecological crime. For digital packrats, media hoarders, and anyone who resents being nagged to free up space.

## Problem
Storage tools frame accumulation as failure: red blocks, 'reclaim 40GB,' shaming you into rm. But lots of people genuinely enjoy their archives — the ripped CDs, the 4TB of 'someday' projects. There's no tool that celebrates a growing hoard as a living, beautiful thing instead of a mess to purge.

## How it works
Packrat watches a folder tree and renders it as a slowly-growing generative reef/moss terrarium in a small always-on window. Each subtree is a coral colony; file count and total bytes drive polyp growth; file age becomes patina and calcification (old files = venerable, encrusted structures). New downloads spawn bright new growth with a little animation. Deleting files triggers visible bleaching, a colony receding, and a deadpan reproachful line ('You had that since 2019. It was almost mature.'). Over a year the reef accretes into a keepsake of your accumulation, exportable as a poster.

## Technical approach
Stack: a small cross-platform app in Tauri (Rust core + web canvas) or an Electron menubar app. A Rust filesystem walker (jwalk) periodically snapshots the tree: per-directory bytes, count, min/mean mtime, extension histogram. That feeds a deterministic L-system / reaction-diffusion growth model (seeded by directory path hash so structure is stable) rendered on a WebGL/canvas layer; growth increments are tweened between snapshots. A tiny local ruleset maps extension clusters to species (video = kelp, code = branching coral, photos = anemones). Guilt lines pulled from a small static quip table keyed by the age/size of what was deleted. Hard part: making growth feel organic and legible at a glance while staying performant on huge trees (sample + aggregate deep directories rather than render every file).

## v1 scope
- Watch one user-chosen folder
- Reef grows on file add, bleaches on delete, with tween animation
- 4 species mapped from extension buckets
- Menubar window + a snapshot 'poster' PNG export

## Out of scope
- Multi-folder / whole-disk mode
- Cloud sync, sharing, social features
- Actually blocking deletions (we only mourn them)

## Risks & unknowns
- Perf on multi-million-file trees
- Whether guilt-tripping reads as charming or annoying
- Keeping the art from looking like generic procedural noise

## Done means
With a demo folder, adding a 500MB file within ~10s spawns visible new growth in the matching species, and deleting an old file bleaches its colony plus surfaces an age-aware guilt line — verified live over three add/delete cycles.

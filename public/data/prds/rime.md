## Overview
A tiny always-on daemon plus a live wallpaper/menubar that grows a field of frost crystals seeded by your shell command history. Commands you run often accrete thick, fern-like dendrites; one-offs stay as thin spikes. Over a year it becomes an ambient self-portrait of how you actually spend your days. For terminal-dwelling devs.

## Problem
Your shell history is the truest record of your working life, but `history` is a dead scroll you never look at. Tools like the `reaction` daemon *act* on repeated output; nobody turns the repetition itself into something you'd want to frame. There's no ambient feedback on your own patterns.

## How it works
A background daemon captures each command via a zsh `preexec` hook. Each command is normalized to a "species" (e.g. `git commit`, `docker build`, `kubectl apply`) — args stripped, verb+subcommand kept. Every occurrence drops a seed particle at a deterministic coordinate (hash of species → position), so the same command always grows in the same spot. A diffusion-limited aggregation (DLA) model grows dendritic frost from those seeds; seeds deposited per day scale with that day's usage, so hot commands bloom into thick crystals while rare ones stay sparse. Renders to a desktop wallpaper that thickens each morning, and a menubar showing today's "coldest" (busiest) region.

## Technical approach
Rust or Go daemon. Capture via zsh `preexec`/`precmd` or tail `~/.zsh_history` with kqueue/inotify. Tokenizer buckets commands into ~200 species. Per-species counts and growth state in SQLite. Growth: DLA on a 2048² grid — each seed random-walks until it sticks to existing crystal. Render offscreen with Skia/wgpu to PNG; set as wallpaper (macOS `desktoppicture`, feh on Linux). RNG seeded by species-hash + day-index so runs are deterministic and resumable from the log. Hard part: DLA is O(walk length) and slows badly at high density — needs a hierarchical grid to keep daily updates under a second — plus a thickness/color mapping that stays legible after 365 days of accretion instead of turning to mush.

## v1 scope
- zsh `preexec` hook logging normalized command + timestamp to SQLite
- ~30 hardcoded species buckets, rest = "misc"
- DLA growth on a 1024² grid, one batch per day
- PNG export + manual "set as wallpaper"
- menubar listing today's top-3 busiest species

## Out of scope
Multi-shell support, cloud sync, sharing/leaderboards, real-time growth, fancy shaders, mobile.

## Risks & unknowns
DLA performance at density; whether the image stays legible or muddies over months; privacy (history is sensitive — must stay 100% local); willingness to run a persistent daemon.

## Done means
After a week of real use, the wallpaper shows visibly thicker crystals where you ran `git`/`docker` most and thin spikes for one-offs, updates automatically each morning, and re-running growth from the SQLite log reproduces a pixel-identical image.

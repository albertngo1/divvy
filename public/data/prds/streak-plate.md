## Overview
Streak Plate is a desktop wallpaper (macOS/Linux) that renders your coding activity as a growing microbial culture on an agar plate. It's for developers who like ambient quantified-self toys and find contribution graphs sterile. Sparked by the Quanta piece on a synthetic cell that grows and divides — here the 'cells' are your commits.

## Problem
The GitHub contribution grid is a dead green ledger. It rewards streaks but says nothing about the shape, clustering, or decay of your work. There's no *living* artifact of a year at the keyboard — nothing that feels alive on your screen while you work.

## How it works
Each commit inoculates a new colony at a pseudo-random plate coordinate seeded by the commit hash. Colonies grow radially over subsequent hours following a logistic growth curve; large commits (by diff size) seed faster-growing strains with different pigments. Colonies near each other compete for nutrients and form contact-inhibition boundaries — the classic look of a streaked plate. Crucially: nutrient depletes daily. Go 24h without a commit and starved colonies stop growing; 72h and they lyse (fade, leave a ghost ring). Over a year the plate becomes a dense, legible map of your rhythm — sprints bloom into confluent lawns, vacations leave clear zones.

## Technical approach
A single Rust or Go daemon polls `git log --all` across a configured list of repo paths every 15 min, diffing against a local SQLite state of seen commit SHAs. Growth is simulated as a 2D reaction-diffusion / logistic field on a grid (e.g. 512×512), stepped once per real hour and persisted so the sim survives reboots. Rendering: a GLSL fragment shader colors the nutrient/biomass fields; on macOS drive it via a `SKScene` or a `wallpaper`-setting helper writing PNGs on an interval; on Linux use `swaybg`/`hyprpaper` reload. The genuinely hard part is making colony boundaries read as *biological* (Voronoi-ish contact inhibition + subtle fractal edges) rather than as circles, and keeping the yearlong sim numerically stable and cheap.

## v1 scope
- Watch a hardcoded list of repos
- One strain, one pigment, logistic growth
- Daily nutrient decay + lysis
- Render a static PNG wallpaper refreshed hourly
- Persist sim state to SQLite

## Out of scope
- Multi-strain / diff-size pigments
- Live animated shader wallpaper
- Cross-machine sync of one plate
- Windows support

## Risks & unknowns
- Reaction-diffusion tuning is fiddly; may need a simpler cellular-automaton fallback
- Wallpaper-setting APIs are OS-specific and brittle
- 'Punishing' decay might feel demoralizing — needs a gentle curve

## Done means
After making 5 commits across two days then skipping a day, the wallpaper visibly shows 5 colonies of appropriate sizes, the oldest starting to fade, with sim state that correctly reloads after a reboot.

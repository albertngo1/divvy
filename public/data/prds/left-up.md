## Overview
A macOS menubar app that generates your desktop wallpaper from an evolving population of shader genomes. There is no rating UI, no thumbs-up, no gallery. There is exactly one control: a hotkey meaning *get this off my screen*. Everything else is inferred from how long you left it up.

## Problem
Every generative-wallpaper toy dies the same way: it asks you to curate. Interactive-evolution systems (Picbreeder, and every "pick your favorite of 9" descendant) need a human clicking, and the clicking stops on day four. Meanwhile you *are* continuously expressing preference — by not changing your wallpaper — and nothing captures it. Also: most people cannot describe their own visual taste, and would find a family tree of it genuinely interesting.

## How it works
At each rotation (default every 4 hours of active use) a new individual is drawn from the population and set as the wallpaper. The clock starts. If you press ⌥⌘W, it dies young — a strong negative signal. If it survives to rotation, mild positive. Reproduction happens nightly: tournament selection over the archive, crossover plus mutation, offspring enter the population.

Once a month a window opens uninvited showing the phylogeny — every ancestor as a thumbnail, sized by survival time, with the lineage edges drawn. That's the whole product: a slow reveal of a preference you never articulated.

## Technical approach
Swift + Metal. Genome is 32–48 floats feeding a fixed parametric shader family (layered value noise, banding/warp, palette). Palette parameters live in **OKLCH**, not RGB — mutating raw RGB channels reliably produces mud, while perceptual-space mutation keeps offspring plausible. Rendered offscreen at display resolution per space, written to a cache dir, installed via `NSWorkspace.setDesktopImageURL`.

SQLite schema:
- `individual(id, genome BLOB, parent_a, parent_b, born_at, thumb)`
- `exposure(individual_id, shown_at, ended_at, end_reason)` where reason ∈ {`killed`, `rotated`, `sleep`, `logout`}

The interesting bit is fitness, and the naive version is wrong: "hours displayed" rewards whatever was up when you closed the lid at midnight. This is right-censored survival data, so compute fitness as **restricted mean survival time from a Kaplan–Meier estimator** over that genome's exposures, treating every non-`killed` end as censored. A wallpaper that survived three 4-hour windows and was censored twice is genuinely better-evidenced than one that survived one overnight.

Active-use time comes from `CGEventSource.secondsSinceLastEventType` so idle hours don't count as tolerance. Selection is tournament size 3 with a mutation rate tuned so the population doesn't collapse to one lineage inside a week — track lineage entropy and bump mutation when it drops.

## v1 scope
- 8-gene shader family, mutation only, no crossover
- Fixed 4-hour rotation, kill hotkey, SQLite exposure log
- Naive mean-survival fitness (KM comes second)
- No phylogeny window — just a menubar item showing generation number

## Out of scope
Multi-monitor genome divergence, genome sharing/import, iOS, any "why did you kill it?" prompt (asking is the thing this exists to avoid).

## Risks & unknowns
Signal starvation is the real threat — a few kills per week is thin evolutionary pressure, so rotation cadence is the tuning knob that makes or breaks it. The shader family may not span enough of aesthetic space for evolution to find anything surprising. And some users will simply never press the kill switch, in which case the population drifts randomly and the phylogeny is a lie — detect zero kills after 30 exposures and say so honestly in the menubar.

## Done means
After 100 logged exposures, a blind held-out test — 10 evolved genomes shuffled against 10 random ones, shown one at a time, pick keep-or-kill — where evolved individuals are kept at least 70% of the time versus random.

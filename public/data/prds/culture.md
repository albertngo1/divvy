## Overview
Culture is a tiny idle/incremental game where you tend a single synthetic cell that grows, accumulates organelles, and divides — but the growth medium is refilled by *your* real activity data, so the sim advances at the pace of your actual life. For quantified-self tinkerers who bounced off dashboards and want their step count to *mean* something.

## Problem
Health dashboards are graphs you glance at and forget. Idle games are dopamine with no stakes. Neither leaves a residue. Culture fuses them: a soft, ambient organism that visibly thrives on your movement and quietly stalls when you don't — guilt-free, but honest.

## How it works
Each cell has resources (ATP, lipids, nucleotides) that tick up passively but slowly. Real activity injects bursts: every 1,000 steps drips nutrient into the medium; an elevated-HR workout unlocks a division event. When resource thresholds are met the cell undergoes mitosis, splitting into a rendered daughter with slight mutations (color, membrane texture). Over weeks you get a small dish of descendants — a living scrapbook of your active days. Idle days show the medium clouding and division stalling. A daily headline scraper picks a real bio story to flavor that day's "lab log" entry.

## Technical approach
Stack: a single-page app (Svelte + Canvas/WebGL for the dish) with a small Python/FastAPI backend on the homelab. Activity from Garmin Connect MCP / Strava (already wired locally) polled nightly into SQLite: `days(date, steps, active_minutes, hr_zones)`. Game state is a deterministic reducer: `state = fold(events, seed)` so the whole colony is reproducible from the event log — no server-authoritative sim needed. Mitosis mutations use a seeded PRNG keyed on date so replays are stable. Cells render as metaballs (signed-distance blobs) shaded with cheap fresnel. The genuinely hard part: pacing the resource curve so a normal-activity human sees a satisfying division every few days without it becoming either trivial or a chore — needs a tunable curve and a week of self-play.

## v1 scope
- One dish, one lineage, no upgrades tree
- Garmin/Strava steps → nutrient, workouts → division trigger
- Deterministic replay from event log
- Daily bio-headline flavor line

## Out of scope
- Multiplayer / shared petri dishes
- Genetics minigame, selective breeding
- Mobile-native app (PWA only)

## Risks & unknowns
- Pacing: too slow feels dead, too fast feels fake
- MCP data gaps on days with no sync — need graceful stalling, not crashes
- Metaball rendering perf once the dish has 50+ cells

## Done means
After a week of real wear, the dish shows a division count matching my logged workouts, an idle day visibly clouds the medium, and reloading the page reproduces the exact same colony from the event log.

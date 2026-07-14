## Overview
Foot Traffic is a daily browser deduction puzzle. You're shown a top-down grayscale wear/scuff heatmap of an unlabeled indoor space — no walls labeled, no people — and you reconstruct what it is and what happened there. It's for the crowd that loves GeoGuessr, Wordle, and reading forensic detail out of mundane surfaces.

## Problem
Most daily puzzles test vocabulary or trivia. Almost none exercise *spatial inference from indirect evidence* — the delightful detective skill of reading a space from the marks people leave. Inspired by the idea that you can estimate a person's height from their scuff marks, Foot Traffic makes 'reading wear patterns' into a five-minute game with a shareable result.

## How it works
1. Daily puzzle shows a wear heatmap: dark bands = high foot traffic, hot spots = where people pause, drag marks near a doorway, a worn arc where a door swings.
2. Round 1 — multiple-choice: what is this space? (classroom, subway platform, bakery, ER waiting room…)
3. Round 2 — pin the hotspots: click where the counter/entrance/queue was; scored by proximity.
4. Round 3 — reconstruct the day: order 3–4 event cards ('morning rush', 'a spill got mopped', 'line formed here') into the sequence the wear implies.
5. Reveal shows the annotated 'ground truth' and an emoji share grid (🟩 exact / 🟨 close).

## Technical approach
Stack: static site + a small generator; no backend needed beyond a daily seed. The core is a procedural wear simulator: place fixtures (door, counter, seating) on a grid, sample agent paths with a simple A*/random-walk crowd model weighted by a daily 'story' script, and accumulate a wear field (Gaussian-splatted footfall density) rendered to a heatmap. Data model per puzzle: `layout`, `fixtures[]`, `event_script[]`, `answer_key` (space_type, hotspot_coords, event_order). Scoring: exact match on type, radial distance for hotspots, Kendall-tau on event ordering. The genuinely hard part is making wear maps that are *solvable but not obvious* — legible enough that a clever player deduces 'this arc is a door swing' but ambiguous enough to feel earned. Tune with a difficulty knob on crowd noise and fixture count; pre-generate 60 puzzles and human-playtest for solvability.

## v1 scope
- Procedural wear generator (door swing, queue, counter, seating archetypes)
- One daily puzzle, three rounds, seeded so everyone gets the same one
- Emoji share grid
- ~20 hand-vetted launch puzzles

## Out of scope
- User-submitted / real-world scanned floors
- Accounts, streaks, leaderboards
- 3D or perspective views (top-down only)

## Risks & unknowns
- Solvability is fragile — procedural maps may be unfair or trivially readable without heavy playtesting.
- Space archetypes may be too few to stay fresh; needs a growing library.
- 'Reconstruct the day' round may be too hard to communicate — might cut to two rounds.

## Done means
A player loads today's puzzle, correctly identifies the space, pins the entrance within tolerance, orders the day's events, and copies an emoji grid to share — with the same seed producing an identical puzzle for everyone that day.

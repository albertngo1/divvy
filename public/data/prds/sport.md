## Overview
Sport is an ambient desktop screensaver + slow-growing gallery for people who love Conway's Game of Life but have never *found their own* rule. It mutates cellular-automata rulesets nightly, keeps only the interesting mutants (a "sport" is a plant that spontaneously mutated), and builds a dated herbarium you can flip through at the end of the year.

## Problem
The Lobsters post about someone *accidentally* discovering a new automaton captures a truth: the rule space is enormous and almost nobody explores it. Manual exploration is tedious — you tweak a birth/survival mask, watch it fizzle or explode, and give up. There's no patient background process that just keeps hunting while you sleep, and no artifact that accumulates the finds.

## How it works
Each night a cron job runs a batch of candidate rules seeded from last night's survivors plus random mutations. Each candidate is simulated from several random seeds; a fitness function rewards "interesting" dynamics — activity that neither dies nor saturates, high spatial entropy, long transients, gliders/oscillators detected via period-finding. The top 1–3 survivors get a name, a thumbnail, a rule-string, and a calendar date, then become tonight's live wallpaper. Over a year you accumulate a pressed-specimen book: one row per week, hover any tile to replay it.

## Technical approach
Rust/WGPU or plain WebGL2 fragment-shader CA on a GPU texture (ping-pong framebuffers) so millions of cells run cheaply. Rule genome: outer-totalistic birth/survival masks generalized to N states + neighborhood radius, encoded as a compact bitstring. Fitness: run K seeds for T steps, measure population variance over time (kill monotone die-off and saturation), Shannon entropy of the final frame, and lz4 compressibility as a proxy for structure; period detection via hashing frame states in a ring buffer. Mutation = bit-flips + occasional radius/state-count changes; selection = tournament. Store specimens as JSON (genome, seed, score, date) + a WebP thumbnail. The genuinely hard part is a fitness function that correlates with *human* "ooh that's cool" rather than just entropy — needs hand-tuning against a labeled seed set.

## v1 scope
- Binary outer-totalistic rules only, radius 1, single machine
- Nightly cron picks 1 winner, sets it as macOS wallpaper via a rendered video loop
- Local JSON + thumbnail archive, dead-simple HTML grid viewer
- Three hand-tuned fitness terms

## Out of scope
- Multi-state / larger neighborhoods
- Cloud sync, sharing, a rule marketplace
- ML-learned aesthetics

## Risks & unknowns
- Fitness may converge on visually similar mazes every night (diversity pressure needed)
- GPU wallpaper drains battery on laptops; needs an idle/AC gate
- "Interesting" is subjective — may need a thumbs-up/down feedback loop

## Done means
After 30 unattended nights the archive contains 30 dated, replayable rules, at least 5 exhibit non-trivial structure (detected oscillator or glider), and no two winners share an identical genome.

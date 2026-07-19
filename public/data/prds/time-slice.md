## Overview
Time Slice is an ambient desktop toy that renders your machine's live process table as a tiny aquarium. It takes a deadly-serious tool — the OS scheduler — and turns it into a glanceable pet ecosystem, so you *feel* your laptop's CPU contention instead of reading a number in Activity Monitor. For people who like a living wallpaper that also happens to reveal when Slack is quietly eating a core.

## Problem
The CPU scheduler is invisible until something's wrong, and by then you're in `top` hunting a PID. Activity Monitor is a spreadsheet nobody keeps open. There's no *ambient* sense of what your machine is actually doing — which processes are starving, which are hogging, when a build kicks off a feeding frenzy. The Lobsters "metrics matter" scheduler piece is the itch: scheduling is fascinating and completely unfelt.

## How it works
A menubar/desktop panel shows a tank of creatures, one per process. Size = memory footprint, color = process group/user, swimming speed = recent CPU%. Each scheduler quantum, processes that got CPU time dart toward drifting "food" (a visual proxy for time slices); a low-priority (high `nice`) process is a slow bottom-feeder; a starved process visibly stalls and pales. A runaway process balloons and crowds the tank — clicking it reveals PID/command and a "cull" (kill/renice) button. Over an hour the tank breathes with your workload: idle at night, a swarm when a `cargo build` spawns.

## Technical approach
Stack: a small Swift or Rust menubar app. Sample the process table every ~1s via `host_processor_info`/`proc_pidinfo` (macOS) or `/proc` (Linux port) — PID, %CPU, RSS, nice value, state. Map deltas in CPU jiffies to "food eaten" per creature; use a lightweight physics/boids layer (Metal or just Core Animation) for movement. The genuinely hard part is making it *legible and calm*: a naive 300-fish tank at 1Hz sampling is noise. Aggregate small processes into schools, cap creature count, exponentially smooth CPU deltas, and animate transitions so the tank reads as a mood, not a strobe. Persist nothing except a tiny config; zero network.

## v1 scope
- macOS menubar popover, single tank
- Creatures = top N processes by CPU+RSS, rest pooled as a background school
- Size/speed/color mapping + click-to-inspect PID
- No kill/renice button yet (read-only)

## Out of scope
- Linux/Windows ports
- Historical playback / recording
- Per-core or scheduler-internals visualization

## Risks & unknowns
- Could be pretty but useless; needs at least one genuine "aha, *that's* the hog" moment to justify existing.
- Sampling overhead must stay negligible.
- Fitting a readable ecosystem into a small menubar canvas.

## Done means
With a CPU-heavy build running, the responsible process visibly balloons and out-eats the tank within a couple seconds, and clicking it reveals the correct PID and command — all while the app itself stays under ~1% CPU.

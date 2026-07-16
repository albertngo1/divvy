## Overview
Jetsam is a self-hosted TUI game (and, secretly, a real disk-cleanup tool) that grafts Raft's core loop — hooking resources drifting past your platform before a circling shark forces your hand — onto homelab storage retention. It's for hoarders with a Jellyfin/downloads box who never actually prune anything.

## Problem
Disk cleanup is a chore everyone defers until the drive hits 98% and something breaks at 2am. Retention policies are invisible and joyless; `du -sh` shaming doesn't motivate. Meanwhile Raft made the tedium of scavenging *fun* by putting resources on a current you have to actively catch.

## How it works
Jetsam scans a watched directory and floats each stale file/folder toward your raft as a piece of debris on a scrolling current, sized by bytes and aged by mtime. As debris drifts into hook range you press to grab (KEEP) — kept items get pinned and excluded from any purge. Debris you *don't* hook drifts to the far edge and enters the 'jettison queue.' A shark (your fill level) circles closer as free space shrinks; when it bites, it auto-selects the largest un-hooked drift for deletion — but only moves it to a trash holding pen first, never `rm` outright. You spend 'planks' (earned by making decisions promptly) to build storage upgrades that widen your hook range. A run ends when you've triaged the backlog or the shark clears enough space.

## Technical approach
Stack: Go + Bubbletea for the TUI, or Python + Textual. Core scan: `os.walk` with stat, bucketed by mtime and size; a background goroutine feeds the 'current' (a priority queue ordered by staleness × size). Data model: SQLite tracking each path's state (drifting/hooked/jettisoned/trashed) so sessions resume. Safety: nothing is deleted — jettisoned files are `mv`'d to a dated trash dir with a manifest; a separate `jetsam empty-trash` command (with a confirm + age gate) does the real removal. Integration hooks: read Sonarr/Radarr APIs to tag files that are still 'monitored' so the game floats them in a protected color. The genuinely hard part is the pacing model — the current must feel like a game (steady, catchable) while still surfacing the highest-value cleanup decisions first, which is a scheduling problem, not just newest-first.

## v1 scope
- Scan one directory, float debris by size×age
- Hook-to-keep, drift-to-jettison, trash holding pen (no real delete)
- Fill-level 'shark' that auto-queues largest drift when disk >90%
- SQLite session resume

## Out of scope
- Sonarr/Radarr protected-file integration
- Plank economy / storage upgrades
- Multi-directory oceans

## Risks & unknowns
- Gamifying deletion risks a fun-driven mistake — the trash-pen gate is load-bearing
- Pacing may feel either frantic or boring; needs tuning
- Could be *too* much game for a 5-minute chore

## Done means
Pointed at a real 50GB junk directory, Jetsam floats every stale file, lets you hook keepers and jettison the rest into a dated trash dir with a manifest, the watched dir's real free space is unchanged until `empty-trash` runs, and closing/reopening resumes the exact session state.

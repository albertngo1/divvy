## Overview
Driftwood is a desktop toy that turns cleaning your Downloads (or Desktop, or any junk-drawer folder) into Raft. Files float by on an ocean current sorted by age; you grab the ones worth keeping with a hook and drop them into labeled crates (Move/Rename/Keep), and everything you leave alone drifts toward the horizon and is auto-archived or deleted. For pack-rats whose Downloads folder is a 4,000-item shame pit. Steam's Raft (hook floating debris off a current before it's lost) applied to the least oceanic chore imaginable.

## Problem
Manual folder cleanup is a wall of identical rows in Finder that you'll 'do later,' forever. The friction is that triage is boring and reversible-feeling, so nobody starts. Gamifying the *loss* — junk visibly sinks if you don't act — creates gentle, playful urgency without a scary 'delete 4000 files?' dialog.

## How it works
Files enter from the left on a scrolling current, spaced and sized by age and file size, icon by type. You hook a file to pause and inspect it, then fling it into a crate: Keep (whitelist, never sinks), Sort-to (choose/create a destination folder, remembered per file-type), or Trash. Files you never touch drift right; past the 'horizon' they enter a Deep holding tank (a staging folder) for N days before real deletion — fully undoable. Sharks = disk pressure: when free space drops, the current speeds up and a shark fin appears, nudging you to clear faster. A session ends when the current is empty; you get a tally of MB reclaimed and a streak.

## Technical approach
Electron or Tauri desktop app (Tauri for tiny footprint). Scan target folders, sort by mtime, stream into a canvas/WebGL current (PixiJS) with simple buoyancy physics. All destructive actions are two-phase: 'sink' moves to an app-managed `.driftwood-deep/` staging dir with a manifest (original path, timestamp, action); a background sweep hard-deletes only after the grace window, and an Undo pane can restore any item. Type→destination rules persisted in SQLite so repeated sorting (all `.dmg` → Trash, all invoices → ~/Docs/Invoices) gets one-flick fast. Disk-pressure = poll `statfs`/`df`. Hard part: making destruction feel safe — the whole thing lives or dies on nobody ever losing a file they wanted, so the staging tank, manifest, and undo must be bulletproof and obvious.

## v1 scope
- One target folder (Downloads), age-sorted current
- Hook + three crates: Keep / Move-to / Trash-via-deep-tank
- Grace-window staging with an Undo list
- End-of-session MB-reclaimed tally

## Out of scope
- Disk-pressure sharks / dynamic speed (fun, later)
- Multi-folder, scheduled auto-runs
- Cloud/remote folders, mobile

## Risks & unknowns
- 'Junk sinks if ignored' must never feel like data loss — grace window tuning
- Could be a one-time novelty you play once and uninstall
- Physics-y UI might be slower than just using Finder for power users

## Done means
A folder of 200 mixed files can be fully triaged in one drift session, every 'sunk' file is recoverable from the Deep tank until its grace window elapses, and a restored file lands back at its original path byte-for-byte.

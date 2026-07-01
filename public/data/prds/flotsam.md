## Overview
Flotsam is a screensaver/idle-app that borrows *Raft's* core loop — debris floats toward you on an ocean current, you hook the good stuff, the rest drifts away — and points it at the most universally neglected chore: cleaning out `~/Downloads` and `~/Desktop`. For people whose Downloads folder is a 12GB sediment layer they'll never open.

## Problem
File cleanup is pure downside: no reward, infinite decision fatigue, so nobody does it. Meanwhile everyone happily spends hours in a survival game hooking barrels of scrap. The pleasure of *scavenging* is exactly what chore apps lack. Flotsam smuggles the chore inside the pleasure.

## How it works
When idle, the screen becomes a slow ocean. Each stale file in the watched folders spawns as a piece of flotsam — a crate, a bottle, a barrel — floating left-to-right on a current, sized by file size and weathered/barnacled by age (a 2-year-old DMG is encrusted; yesterday's PDF is shiny). You aim a hook (mouse or trackpad flick) and grab a piece to *keep* it (moves to a `~/Keep` folder you choose) or just let it drift off-screen, where it sinks into an `Archive` (a dated zip, reversible). A gentle scoring layer: 'reclaimed 340MB this session,' streaks for daily play. Big files are 'treasure chests' that splash. Nothing is ever hard-deleted — sinking = archived, so the game is guilt-free.

## Technical approach
Electron or a Tauri app (Rust core) with a full-screen canvas/WebGL layer (PixiJS) for the ocean. A watcher enumerates the target dirs, `stat`s each file for size/mtime, and maps them to sprites; physics is a simple current field + Verlet bob, no engine needed. 'Keep' = `fs.rename` into the Keep dir; 'sink' = append into a monthly `flotsam-archive-YYYY-MM.zip` and remove the original (with a trash-first safety net via `trash` npm so it's recoverable for 30 days). Data model: a local SQLite of `{path, size, mtime, seen_at, action}` so a file already judged doesn't respawn. The genuinely hard part is *trust*: users must believe nothing is lost. That means an always-available 'undo last sink' and a visible archive browser; the game is worthless if it feels like it might eat a tax return.

## v1 scope
- watches one folder (Downloads) only
- files older than 30 days spawn as flotsam
- hook-to-keep, drift-to-archive-zip, with undo
- a session summary: MB reclaimed, files judged

## Out of scope
- multi-folder, cloud storage, deletion of anything nested/recursive
- real Raft-style crafting/base-building
- multiplayer

## Risks & unknowns
Screensaver integration is OS-specific and fiddly (macOS `.saver` bundles can't easily run Electron — likely ships as a manually-launched idle app in v1). Grabbing precision on a trackpad. Making 'let it drift' feel intentional, not accidental data loss.

## Done means
Point it at a Downloads folder with 50+ old files; in one idle session you can hook 5 keepers into `~/Keep`, let the rest sink into a dated zip, hit undo to resurrect one, and the archive zip actually contains the sunk files.

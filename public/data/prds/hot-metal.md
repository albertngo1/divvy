## Overview
A macOS/Windows screensaver (plus a small menubar companion) that turns your day's writing into a working simulation of a Linotype hot-metal typesetting machine. Lines you wrote today get cast as slugs; lines you destroyed — amended-away commits, dropped stashes, force-pushed history — are thrown in the hellbox and melted back into the pot. For solo writers and developers who want an ambient toy fed by their own work instead of stock loops.

## Problem
Screensavers are wallpaper noise disconnected from anything you did. Meanwhile the most emotionally loaded artifact a writer produces — the stuff they cut — is invisible the moment it's cut. Git already stores it; nothing ever shows it to you.

## How it works
You point it at 1–N local git repos and optionally a notes directory. On idle it builds today's *type queue*:
- **Casting queue**: lines added in commits reachable from HEAD since local midnight.
- **Hellbox queue**: lines that exist in reflog/dangling objects but not in HEAD — amended-out commits, `stash drop`, rebase casualties, `git fsck --lost-found` orphans.

On screen, brass matrices clatter down the magazine channels, assemble left-to-right, spacebands wedge up to justify the measure, the mold turns, and a slug drops into the galley with a real cast sound. Hellbox lines get assembled the same way, then the machine squirts, jams, and the operator runs a finger down the keyboard — `ETAOIN SHRDLU` — killing the line into the melting pot, where the metal level visibly rises.

The mischief: the channel order of the magazine is not the historical one. It's recomputed weekly from *your* corpus's letter frequency, so the machine's mechanical motion is an honest histogram of how you write. If you write a lot of Rust, `;` and `_` migrate leftward.

## Technical approach
Swift + Metal for the macOS `ScreenSaverView` (or SpriteKit if perf allows); a shared TypeScript/canvas core for the Windows build via a WebView shell. Repo reading through libgit2 (SwiftGit2) — `diff` for added lines, `reflog` + `fsck --dangling` for the hellbox. Typesetting uses Knuth–Plass line breaking over a matrix-width metric table so justification is genuinely computed, not faked. Audio is a granular synth: each matrix release triggers a short clatter grain, pitch keyed to channel index; the cast is a low thunk. Nothing leaves the machine — no network calls at all.

Hard part: making the mechanism *legible* at 60fps. A real Linotype has ~90 channels and four simultaneous motions; naively animating everything reads as visual mush. Needs a camera that racks focus between assembler, mold wheel, and hellbox based on which queue is active.

## v1 scope
- One configured repo, added lines only, no hellbox.
- Matrices, assembler, justification, slug drop. No audio.
- Fixed historical channel order (etaoin shrdlu).
- macOS only.

## Out of scope
Editor keystroke-level undo history, multi-machine sync, video export, wallpaper mode.

## Risks & unknowns
`legacyScreenSaver` sandboxing on recent macOS blocks arbitrary filesystem reads — likely needs a helper agent writing a cached JSON queue to a container path. Repos with squashed history yield an empty hellbox and the best feature never fires.

## Done means
Idle the machine after a normal day of commits: today's real added lines cast in order, and yesterday's dropped stash visibly melts, with the pot level rising by the character count.

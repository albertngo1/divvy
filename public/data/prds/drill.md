## Overview
Drill is a menubar app + CLI wrapper for people who run long, boring, occasionally-fragile background jobs — nightly restic backups, a 40-minute Postgres migration, a Blender render farm, a `qbittorrent`→`sonarr` reimport. It reskins the babysitting-a-progress-bar experience as PAYDAY 2's iconic safe-drill: the drill runs on its own, but it *jams*, and a jammed drill going unattended is how the whole heist goes loud.

## Problem
Long jobs create a weird anxiety loop: you can't fully walk away (it might stall, hang on a lock, or silently fail at 90%), but staring at a bar is dead time. Most tooling either spams you or says nothing. There's no lightweight, *fun* layer that keeps you loosely engaged and makes the moment-of-failure obvious.

## How it works
You pipe any command through Drill: `drill run --name 'nightly-backup' -- restic backup ~/media`. Drill parses the child's stdout for a progress signal (regex or `--percent-from` jq path) and renders a drill in the menubar. Rules:
- Steady forward progress = drill spinning, calm hum.
- No progress delta for N seconds while process is alive = **JAM**: menubar flashes red, a short alarm plays, ntfy push fires. You 'clear the jam' by clicking (acknowledge) — or Drill auto-runs a user-defined `--on-jam` hook (e.g. bump a lock timeout).
- Nonzero exit = **loud**: siren, incident logged.
- Clean exit = **cracked**: cash-register sound, run archived with duration + jam count.
A weekly 'heist report' tallies which jobs went loud most often — your real flaky-job leaderboard.

## Technical approach
Swift menubar shell (or Tauri for cross-platform) wrapping a small Rust/Go supervisor. The supervisor spawns the child in a pty, tails output, and maintains a rolling progress timestamp; 'jam' = `now - last_progress_advance > threshold` while PID alive. Config is per-job TOML: name, progress-extraction rule (regex capture group or JSON path), jam threshold, on-jam hook, sound pack. Alerts go through the existing homelab ntfy (`:8443`). State/history in a local SQLite file. Hard part: reliably distinguishing 'legitimately slow' from 'actually stuck' across wildly different tools — solved by making progress-extraction explicit per-job rather than guessing, plus a 'no output at all' fallback timer.

## v1 scope
- `drill run --name X --progress-regex '...' -- <cmd>`
- Menubar icon with 4 states: idle / drilling / jammed / cracked
- Jam detection + one sound + one ntfy push
- SQLite run log, `drill history` command

## Out of scope
- The `--on-jam` auto-remediation hooks
- Multi-machine / remote job monitoring
- Fancy heist-crew multiplayer, custom sound packs marketplace

## Risks & unknowns
- Progress parsing is the whole ballgame; too fiddly and nobody configures it. Ship copy-paste recipes for restic/rsync/ffmpeg/pg_restore.
- Alarm fatigue if thresholds are wrong — needs sane per-tool defaults.
- It's a toy layer over `at`/`systemd` — has to feel delightful, not gimmicky, or it gets uninstalled.

## Done means
Running a deliberately-stalling script (`sleep`-gapped output) through `drill run` flips the menubar to JAM within the threshold and fires one ntfy push; a clean run archives a row in `drill history` with duration and jam count.

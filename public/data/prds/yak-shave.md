## Overview
Yak Shave is a CLI + tiny web leaderboard for engineers who can't stop 'optimizing.' You register each automation/optimization project with an estimated recurring time saved; it tracks the real time you pour in and tells you your break-even date — or that you'll never reach it.

## Problem
The HN post 'I burned all my tokens researching how to save tokens' is the whole genre in one line, and the LoRA speedrun leaderboard shows the other half: we *love* a wall-clock scoreboard but never measure whether the optimization was worth it. xkcd's 'Is It Worth The Time?' is a static grid; nobody applies it to their own recurring yak-shaves in real time. So we automate a 20-minute weekly task with 15 hours of scripting and feel productive.

## How it works
- `yak start "cron to auto-tag photos" --saves 20m/week` registers a shave and opens a work session.
- Time spent accrues from the active session timer, or from commit timestamps on a linked branch/repo (`--repo`, `--branch`).
- `yak status` shows: hours invested, weekly savings claimed, **break-even date**, and a verdict ('Break-even: Nov 2027' or 'Net negative forever').
- Weekly, it debits the claimed savings and updates realized ROI.
- `yak board` posts to a shared leaderboard ranking friends by *most net-negative* shave — the anti-flex trophy for the proudest waste of time.

## Technical approach
Stack: a single Go or Rust CLI writing to a local SQLite ledger; optional shared server (SQLite + a 200-line HTTP API) for the leaderboard. Time-spent sources: (1) session start/stop, (2) `git log` timestamp deltas on the linked branch (sum gaps under a 90-min idle cap). Data model: `shave(id, desc, est_saved_per_week, created)`, `session(shave_id, minutes, source)`, `savings_ledger(shave_id, week, minutes_credited)`. Break-even = invested_minutes / weekly_savings, projected forward. Hard/honest part: recurring time *saved* is inherently self-reported — the tool's value is forcing you to name the number and then confronting you with it.

## v1 scope
- `start/stop/status` with manual session timing and a `--saves` estimate.
- Local SQLite ledger; break-even computation and verdict.
- One-command JSON export for the board.

## Out of scope
- Automatic detection of 'this was optimization work' from your activity.
- Real savings measurement (stays self-reported).
- IDE/editor plugins.

## Risks & unknowns
- Self-reported savings are gameable and optimistic — but that's part of the joke.
- git-timestamp time estimation is rough; idle-capping is a heuristic.
- Might just be a guilt machine people abandon after week two.

## Done means
Register a shave with `--saves 20m/week`, log 3 hours across sessions, and `yak status` correctly reports invested time, a computed break-even date, and flips to a 'net negative' verdict when the estimate can't ever recoup the hours — with the entry appearing on a second machine's `yak board`.

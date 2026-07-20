## Overview
Ground Stop is a self-hosted TUI/web toy-that's-actually-useful: it reads your host's crontab, systemd timers, and container restart policies and renders them as an airport approach board. Jobs are inbound flights, your CPU/IO/RAM budget is the runway, and you become the tower controller sequencing arrivals so heavy jobs don't stack up and collide. For homelabbers whose 20 cron jobs all secretly fire at `0 3 * * *`.

## Problem
Everybody's cron table is a landmine of coincidental overlaps: three backups, a media scan, and a docker prune all launch at 3:00 and thrash the disk, blowing SLAs nobody's watching. `crontab -l` is a flat wall of asterisks that hides contention completely. There's no view that says "these five jobs are on final approach to the same runway."

## How it works
Ground Stop parses your schedules into a timeline of predicted "flights," each with an estimated duration and resource weight learned from past runs. It simulates the next 24h and shows an ATC board: flights on approach, a runway occupancy bar, and red "go-around" markers where heavy jobs overlap beyond your resource budget. You resolve congestion by dragging a flight's slot on the timeline; Ground Stop rewrites the actual cron/timer line (with a dry-run diff) to spread the load. A "Ground Stop" button pauses non-critical timers during an incident.

## Technical approach
Stack: Python + Textual (TUI) or a small FastAPI + preact web board. Sources: parse `/etc/crontab`, user crontabs, `systemctl list-timers --all`, and Docker `restart`/healthcheck configs via the Docker socket. Duration/weight estimates come from parsing `journalctl`/cron mail exit times and, optionally, cgroup v2 `cpu.stat`/`io.stat` deltas captured by a lightweight sampler around each run (wrap jobs with a `groundstop run --` shim). Scheduling model: expand cron expressions with `croniter` into concrete fire times, then a simple interval-overlap + weighted-sum-per-window contention score. Rewrites edit crontab via `crontab -` and systemd via drop-in `.timer` overrides, always behind a confirmable diff. Hard part: trustworthy duration estimates for jobs that vary wildly, and safely round-tripping systemd timer syntax without clobbering user edits.

## v1 scope
- Parse user crontab + systemd timers into a 24h flight board
- Static resource weights (user-tagged heavy/light) — no sampling yet
- Overlap/congestion highlighting
- Drag-to-reschedule that emits a cron diff you copy-paste (no auto-write)

## Out of scope
- Multi-host fleet view
- Auto-optimization / solver-based rescheduling
- Kubernetes CronJobs (v2)

## Risks & unknowns
- Duration prediction is the whole value and is genuinely noisy.
- systemd timer rewriting is error-prone; keeping v1 copy-paste-only sidesteps it.
- Might be a cute demo people don't return to unless the congestion insight is real.

## Done means
Pointed at a real host with ≥10 scheduled jobs, Ground Stop surfaces at least one genuine 3am collision the owner didn't know about, and its suggested reschedule visibly flattens the runway occupancy bar in the simulated board.

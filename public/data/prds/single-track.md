## Overview
Single Track is a dispatcher puzzle-game — and quietly, a homelab ops tool — for anyone whose machine runs a thicket of overlapping scheduled jobs. It steals the core loop of a single-track train dispatcher (the genre a lone dev just made 'the best train sim ever') and applies it somewhere absurd: your crontab and systemd timers.

## Problem
On a small server, backups, media transcodes, `apt` upgrades, reindex jobs, and health checks all fire on nice round times (0 * * * *, midnight, every 15 min). They pile onto the same CPU/disk/DB at the same instant, causing thrash, timeouts, and mysterious 3am load spikes. Reading a crontab tells you nothing about *when things actually collide*. There is no fun, visual way to destagger.

## How it works
Your jobs become trains on a network of shared 'tracks' — each track is a contended resource (CPU, disk I/O, the Postgres box, WAN uplink). A block-signaling rule says two trains can't occupy the same block at once. The game lays out a 24h timeline; you drag departure times and hold trains at signals until the schedule is conflict-free. Solve the board and it emits a new, staggered crontab plus a diff of what moved. A 'stress test' button fast-forwards a simulated day and shows where trains would have rear-ended (resource overlap) under your current real schedule.

## Technical approach
Stack: Tauri + Svelte front-end, Rust core. Ingest: parse `crontab -l`, `/etc/cron.d/*`, and `systemctl list-timers --all` into a normalized job model {id, schedule, est_duration, resources[]}. Duration + resource tags are estimated from `journalctl`/exit logs or set by hand. Expand each cron expr over a 24–168h window (croner crate) into occupancy intervals per resource; a collision is an interval-overlap on a shared resource — detect via a sweep-line over sorted endpoints. The dispatcher UI is an interval-scheduling constraint solver: nudging a start offset re-runs the sweep-line live. Export writes back a validated crontab with only offset changes (never touches the command). The genuinely hard part is honest duration estimation and modeling partial resource contention (two jobs both light on disk may coexist) rather than binary blocking.

## v1 scope
- Parse `crontab -l` only (skip systemd for v1)
- One resource axis: wall-clock overlap, binary block
- Timeline canvas, drag-to-restage, live collision highlight
- Export staggered crontab + textual diff

## Out of scope
- Multi-host / cluster scheduling
- Real-time monitoring daemon
- Auto-solve (human drags; no solver yet)

## Risks & unknowns
- Duration estimates may be garbage without historical logs → collisions look wrong.
- Users with dynamic schedules (@reboot, event-driven) don't map to a fixed timeline.
- Is it a game or a tool? Must nail the toy feel or it's just another cron viewer.

## Done means
Point it at a crontab with two jobs both at `0 * * * *` tagged same resource; it flags the hourly collision, lets me drag one to `:30`, shows zero conflicts, and exports a crontab whose only change is that offset.

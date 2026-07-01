## Overview
Freight renders your homelab backups as *Euro Truck Simulator* long-hauls. Each running transfer (rsync, restic, borg) is a cargo truck grinding down a side-scrolling highway: distance-to-destination is bytes remaining, truck speed is current throughput, driver fatigue is thermal load, and a failed job is a jackknifed rig on the shoulder with hazards blinking. Leave it open on a spare monitor — a glanceable status board that happens to be an ETS2 fever dream.

## Problem
Backup and sync jobs are invisible until they break. A progress bar is boring and forgettable, so nobody watches, so nobody notices the nightly job that has been silently failing for three weeks. There is no ambient artifact that makes "the backups are healthy" a thing you feel at a glance.

## How it works
A small collector tails live progress from each transfer and pushes updates over a websocket to a browser page. Each job spawns a truck at the left edge; it drives right toward a depot, its x-position set by `bytesDone/bytesTotal` and its speed animated from current MB/s. A stalled job pulls over; a completed haul honks and unloads at the depot. Fatigue (CPU/thermal) slows the truck and animates a yawning driver. You glance, you know.

## Technical approach — be specific and technical
Stack: a Node.js (or Bun) backend exposing a `ws` websocket; frontend is vanilla TS + `<canvas>` or PixiJS for the side-scroller. Deploy as a container on the existing homelab Docker stack, served behind Tailscale Serve like the other dashboards.

Data sources: rsync via `rsync --info=progress2`, whose stdout emits `<bytes> <pct>% <rate> <eta>` lines parsed with a regex; restic via `restic backup --json` (structured `status` messages with `bytes_done`/`total_bytes`); borg via `--log-json --progress`. The collector runs each job as a child process (`child_process.spawn`) or tails an existing job's log, normalizing all three into one event shape. Thermal/CPU from `/proc/stat` deltas and `lm-sensors`/`sysfs` thermal zones on Linux (or `powermetrics` on macOS).

Data model: normalized event `Job { id, name, bytesDone, bytesTotal, rateBytesPerSec, state: 'running'|'stalled'|'done'|'error', cpuLoad, tempC }`, broadcast at ~2 Hz. Frontend keeps a `Map<id, Truck>` and reconciles on each message. Speed is smoothed with an EMA so the truck doesn't jitter; `state='stalled'` triggers when `rate==0` for >30s. ETA falls back to `(bytesTotal-bytesDone)/EMA(rate)` when the tool doesn't provide one.

The genuinely hard part: unifying three heterogeneous progress streams (rsync's fragile carriage-return-based stdout vs. restic/borg JSON) into one reliable event bus, and attaching to processes the dashboard didn't launch (an already-running rsync means tailing its log or wrapping it).

## v1 scope (humiliatingly small)
- One truck, one hardcoded job
- Parse a single `rsync --info=progress2` piped over a websocket
- Truck moves right at speed proportional to MB/s
- Reaches the depot when done — no fatigue, no crashes, one lane

## Out of scope (for now)
- Multiple lanes/jobs, restic/borg parsers
- Fatigue/thermal animation, crash/jackknife states
- Auth beyond Tailscale, historical logging
- Sound beyond the completion honk

## Risks & unknowns
- rsync's progress output is CR-delimited and locale-sensitive; parsing is brittle
- Attaching to externally-launched jobs is awkward
- Throughput jitter needs smoothing to look truck-like

## Done means — concrete, testable
You start an rsync in a terminal, glance at the browser tab, and a little truck is visibly crawling toward a depot at a speed you can feel — and when the transfer finishes the truck arrives and honks.

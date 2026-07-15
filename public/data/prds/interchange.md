## Overview
Interchange is a live isometric city visualizer for a Docker/homelab host. It renders your running services as a Cities:Skylines-style town where districts are containers, roads are network links, and traffic (cars, congestion, honking) maps to real inter-service throughput. For homelabbers who love their stack but stare at boring Grafana line charts.

## Problem
Homelab dashboards are legible but joyless, and — worse — non-visceral. A p95 latency line doesn't *feel* like a problem. Congestion does. There's no ambient, glanceable way to see "which of my 30 containers is hammering which" that also makes you want to keep it open on a spare monitor.

## How it works
- Interchange auto-lays-out a small city from your `docker ps` topology: each container = a zoned block sized by memory footprint, colored by type (db = industrial, web = commercial, media server = downtown).
- It samples real network flows between containers and spawns cars accordingly — flow volume = car count, connection latency = how slowly they move. Sustained saturation turns roads orange→red and cars pile into visible jams.
- Restarts play a demolition/construction animation; a crashed container becomes an abandoned lot; a new container zones and grows in.
- Ambient mode: fullscreen, day/night cycle tied to real time, gentle city hum. Diagnostic mode: click a district to see the container's live stats overlay.

## Technical approach
- Data: `docker stats` stream for CPU/mem; per-container network flow via `nettop`-style capture — practically, run a sidecar using `conntrack`/`/proc/net` sampling or eBPF (`bcc`/`cilium`-style flow map) to get container-to-container byte counts. Fallback: parse `docker network inspect` + interface counters for coarse per-container I/O.
- Render: Three.js isometric tiles (or PixiJS 2.5D for cheapness), a small tile/road autotiler, boid-lite car particles pooled per road segment.
- Backend: Go daemon exposing a websocket of `{container, peer, bytes, latency}` deltas every second; browser client interpolates.
- Data model: nodes (containers) + weighted directed edges (flows) → a force-directed-then-snapped grid layout so the map is stable across restarts.
- Hard part: getting cheap, accurate container-to-container flow attribution without a heavy service mesh — eBPF is the clean answer but raises the build bar; the `/proc/net` sampling fallback is the weekend-feasible path.

## v1 scope
- Single Docker host, `docker stats` + total per-container net I/O only (no pairwise flows yet).
- Fixed grid layout, cars spawned proportional to each container's total throughput driving to a shared "internet" gate district.
- Ambient fullscreen render, no interaction.

## Out of scope
- Kubernetes / multi-host clusters.
- Historical replay / time-scrubbing.
- Alerting (it's a toy first, a tool second).

## Risks & unknowns
- Pairwise flow capture may need eBPF/root; v1 dodges it with per-container totals.
- Layout stability across container churn.
- Perf of thousands of car sprites in-browser.

## Done means
Run it against a compose stack, trigger a large transfer between two containers (e.g. a DB dump piped to a backup container), and watch a visible, sustained traffic surge appear on the corresponding district's roads within ~2 seconds, subsiding when the transfer ends.

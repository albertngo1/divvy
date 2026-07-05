## Overview
Off-Peak is a self-hosted planning-and-scoring tool for homelabbers that reframes a scheduled maintenance window as a PAYDAY-style heist. It ingests your service topology and turns "restart the reverse proxy, patch the DB, reboot the host" into a timed job with a casing phase, a loud/stealth choice, and a getaway score.

## Problem
Homelab maintenance is either reckless (`docker compose down` on everything, pray) or paralyzingly cautious. There's no lightweight ritual that makes you think about blast radius, ordering, and rollback *before* you start pulling wires — and no fun feedback loop that rewards a clean, low-downtime job.

## How it works
Before the window you enter **casing**: Off-Peak reads your compose files / systemd units and draws the dependency graph, highlighting choke points (the thing 8 services depend on). You pick a plan: **Loud** (restart everything at once — fast, but every dependent service takes damage) or **Stealth** (rolling, drain-first, slower but low downtime). Hit *Go* and a heist timer starts. As you tick off steps, Off-Peak polls health endpoints; a service that goes unhealthy while users are hitting it trips an **alarm** (real alert from your monitoring). Finish with all services green and you get a **getaway score**: total user-facing downtime, alarms tripped, and whether you beat your planned window.

## Technical approach
Go or Python CLI + a small local web UI. Topology parsed from `docker-compose.yml` (compose schema), optional systemd `After=`/`Requires=` graph via `systemctl show`. Health = configurable HTTP/TCP probes polled each second during the run. Alarms hook Uptime Kuma / Prometheus Alertmanager webhooks (or just probe failures) and push to ntfy. Downtime is integrated as probe-fail-seconds weighted by a per-service "user-facing" flag. The genuinely hard part is honest downtime attribution across dependency cascades — distinguishing a service that's down because *you* took it vs. because its dependency is mid-restart (graph-aware blame propagation).

## v1 scope
- Parse one `docker-compose.yml` into a dependency graph
- Loud vs Stealth plan preview with predicted downtime
- Live run timer + per-second HTTP health probes
- Getaway score: downtime seconds + alarms tripped
- ntfy push on job complete

## Out of scope
- Actually executing the restarts (v1 you run commands yourself; it scores)
- systemd/Kubernetes topology
- Multiplayer co-op heists

## Risks & unknowns
- Compose `depends_on` rarely reflects true runtime coupling — graph may be wrong
- Probe granularity may miss sub-second blips
- Risk of being a cute skin over `watch curl` if scoring isn't sharp

## Done means
Given a 6-service compose file, I start a run, restart the DB, and Off-Peak correctly shows the 3 dependent services going amber, tallies ~40s of downtime, trips one alarm, and prints a getaway score I can beat next window.

## Overview
A survival-sim dashboard that reskins your real homelab as a Project Zomboid-style camp. Each running service is a survivor with stats driven by live metrics; you keep them alive against scheduled and emergent threats. It's a monitoring panel that happens to be a game, for self-hosters who ignore their Grafana until something's on fire.

## Problem
Homelab health data is boring until it's an outage. Dashboards demand you already know what "90% disk" implies. Turning latent risk into a visible, characterful survivor who is visibly *starving* creates the emotional urgency plain gauges don't — you fix the disk before your favorite survivor dies.

## How it works
Services are survivors on a shared camp screen. Health = uptime/health-check success; hunger = free disk; fatigue = CPU load; morale = error rate. Real events become game events: an approaching TLS cert expiry is a telegraphed "horde night" with a countdown; a filling disk is a slow starvation debuff; a flapping service is "injured." You "barricade" by acknowledging an alert or running a linked fix action; ignore threats and a survivor goes down, leaving a gravestone with a timestamp.

## Technical approach
Backend polls Prometheus/node-exporter (and optional Docker socket for container states) on an interval, mapping metric ranges to survivor stat bands via a small YAML rules file. Front-end is a lightweight canvas/Pixi scene; survivors are sprite actors with state machines (healthy/injured/starving/down). Cert horde nights come from parsing `notAfter` via an ACME/openssl probe. Threats are a priority queue keyed on time-to-impact. The hard part is a sane, non-flappy metric→state mapping with hysteresis so survivors don't rapidly oscillate on noisy data.

## v1 scope
- Poll node-exporter for disk/CPU/uptime of one host
- 3–5 services as survivors with health + hunger bars
- One horde-night type: cert expiry countdown
- Gravestone on sustained failure; revive on recovery
- YAML metric→stat mapping

## Out of scope
- Multi-host camps, base-building progression
- Auto-remediation / clicking to run fixes (read-only v1)
- Mobile layout

## Risks & unknowns
- Metric mapping tuning is fiddly; wrong thresholds make it cry wolf.
- Novelty vs. utility — must stay glanceable, not require playing.

## Done means
Pointed at a real node-exporter, the camp shows one survivor per configured service whose hunger bar tracks actual free disk, and manually revoking/nearing a cert expiry starts a visible on-screen horde-night countdown.

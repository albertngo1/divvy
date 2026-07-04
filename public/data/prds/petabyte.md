## Overview
Petabyte is a desktop pet / monster-collector for homelabbers who run a stack of self-hosted services. Each container or service becomes a collectible creature; the Pokédex *is* your `docker ps`. It's for people who (per "I Don't Maintain My Homelab") barely look at their dashboards but would glance at a critter that looks sick.

## Problem
Homelab monitoring is either invisible (a Grafana tab nobody opens) or shouty (a 3am alert). There's no ambient, glanceable, *affectionate* signal that a service is drifting unhealthy. Mascots make you check on things you'd otherwise neglect.

## How it works
On first run, Petabyte discovers your services and hatches one creature each, with a deterministic species/color seeded from the image name (so `postgres` always looks the same across friends). Live metrics map to stats: current HP = a health score blended from container state, restart count, and resource pressure; mood reflects CPU/latency; a creature "levels" with cumulative uptime and *evolves* at milestones (7d, 30d, 100d). Events animate: a restart flashes a damage number; an unhealthy healthcheck makes it wheeze; an OOMKill faints it (grayscale, lying down) until it recovers. You can pet it, name it, and view a little stat card. Optional: a daily "team photo" of your whole zoo and a shareable card of your longest-lived creature.

## Technical approach
Stack: Tauri or Electron desktop app; sprites rendered with a small 2D canvas/PixiJS layer. Data sources: Docker Engine API over the local socket (`/containers/json`, `/containers/{id}/stats`, events stream) for container state/restarts/resource use; optionally scrape a Prometheus endpoint for richer service latency. Data model: `Creature{ serviceId, speciesSeed, level, evolutionStage, hp, statusHistory[] }` persisted to SQLite so uptime/level survive app restarts. Key algorithm: a health-score function combining state (running/unhealthy/exited), a decaying restart-frequency term, and normalized CPU/mem headroom → HP; plus a deterministic seeded generator mapping image name → species/palette. The hard part is a *stable, legible* mapping from noisy metrics to creature state so it reads as calm ambient info, not a flapping tamagotchi.

## v1 scope
- Discover containers via Docker socket, one creature each
- HP from state + restart count; faint on exit/OOM
- Uptime leveling with one evolution at 7 days
- Deterministic sprite from image name (small hand-drawn set + palette swaps)
- Local persistence, click-to-pet, stat card

## Out of scope
- Battles/trading, Kubernetes/Prometheus, remote hosts, cloud sync, custom sprite editor.

## Risks & unknowns
- Sprite art is the real cost; needs a tight reusable base + palette system.
- Metric-to-mood mapping can feel arbitrary or twitchy without smoothing.
- Niche audience (homelab + wants cute).

## Done means
Stopping a real container faints its creature within one poll cycle and restarting revives it; a container running >7 days shows the evolved sprite — demonstrated on a live `docker compose` stack in a screen recording.

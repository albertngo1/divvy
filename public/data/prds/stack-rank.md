## Overview
Stack Rank is a browser dashboard that turns your running Docker/Compose stack into a Pokemon-Auto-Chess-style auto-battler. It's for homelabbers and small-team ops people who want to *understand* their stack's topology and resource behavior but find `docker stats` and dependency graphs boring. Each container is a unit with stats; you 'field' a roster, watch a synthetic-load battle, and climb a tier list — and accidentally learn where your stack is fragile.

## Problem
Homelab stacks accrete. You have 25 containers and only a fuzzy sense of which depend on what, which hog CPU under load, and which single service would take three others down. Existing tools (Portainer, ctop, dependency graphs) are accurate but inert — nothing makes you *engage*. The auto-chess loop (draft → synergy → combat → adjust) is exactly the engagement loop ops observability lacks.

## How it works
Stack Rank reads your live Docker state and renders each container as a unit card: HP = memory limit, ATK = observed CPU share, cost = image size tier. **Synergies** are derived from real relationships: containers sharing a Docker network get a '+network' bond; a `depends_on` chain forms a 'combo'; containers with a Traefik label get a 'gateway' trait. You spend a coin economy (earned by uptime) to bench/field units. Pressing **Fight** runs a real synthetic load (parallel HTTP hits + a CPU/mem stress sidecar) for 30s; units 'take damage' proportional to real latency spikes and OOM near-misses. Units that fall = services that degraded. You then rebalance limits/replicas to survive the next wave. A weekly 'ladder' scores your stack's resilience.

## Technical approach
Backend: a small Go/Node service against the Docker Engine API over the socket (`/containers/json`, `/containers/{id}/stats` streaming, `/networks`). Parse Compose files for `depends_on`/`networks`/labels to build the synergy graph. Load phase: spin an ephemeral `oha`/`wrk` sidecar plus a `stress-ng` container; sample cgroup metrics (`memory.current`, `cpu.stat`) at 1s. Frontend: React + a canvas board (PixiJS) for the battle animation; the 'combat resolver' is a deterministic function mapping observed p99 latency + throttle events → damage. Data model: units, traits, bonds, a match log. **The genuinely hard part** is making the battle *readable and fair* — mapping noisy real metrics to legible unit HP bars without it feeling random, and running load safely so it doesn't nuke a production homelab (opt-in target allowlist, hard concurrency caps).

## v1 scope
- Read Docker state, render containers as unit cards with 3 real stats
- Two synergy types: shared-network bond, depends_on combo
- Manual 'Fight' button that runs a capped synthetic load and animates damage
- Single-session resilience score, no accounts

## Out of scope
- Kubernetes, multi-host, real matchmaking/PvP
- Persisting ladders across machines
- Auto-remediation (it only shows, doesn't fix)

## Risks & unknowns
- Load testing your own stack is dangerous; needs strict guardrails
- Metric-to-HP mapping may feel arbitrary; needs tuning to feel earned
- Docker-socket access is a security surface; read-only where possible

## Done means
Point it at a running Compose project, see every container as a unit with correct network/depends_on synergies, press Fight, and watch the unit backed by your most latency-sensitive service visibly take the most damage — then survive a second fight after you raise its memory limit.

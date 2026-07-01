## Overview

Homelab Tycoon is an incremental/idle game where you build out a self-hosted stack — reverse proxy, media server, arr apps, backups, monitoring — and the core loop is fighting entropy. Left alone, your services accrue rot: TLS certs expire, virtiofs mounts go stale, containers get OOM-killed, disks fill, dependencies drift. You earn "uptime" while things run and spend it on hardening (auto-renew, healthchecks, RAM, alerting) that slows the decay. A loving parody of running a homelab, played as numbers-go-up-vs-entropy.

## Problem

Idle games are mechanically hollow — click cookie, buy grandma, repeat. Homelabbers, meanwhile, live a real, funny, universal loop of building services and then endlessly fighting the small failures that erode them. Nobody has made the idle game *about that specific dread* — the 2am cert-expiry page, the stale mount that hangs Jellyfin, the OOM kill. The shareable artifact — an idle game that makes homelabbers laugh in recognition — doesn't exist.

## How it works

You own a rack of "services," each a state machine (healthy → degraded → down) with a passive decay rate. Running services generate Uptime (the currency). Random entropy events fire on timers (cert expiry, stale mount, OOM, disk-full) and knock services toward down, cutting income. You spend Uptime on upgrades that reduce a service's decay rate, add auto-recovery, or unlock new services (which add income but also new failure modes). Progress accrues offline: on load, simulate elapsed time to compute what decayed and what you earned.

## Technical approach — specific & technical

Stack: static site, Vite + TypeScript, a tiny reactive UI (vanilla signals, Preact, or Svelte), Canvas/DOM for the rack view. Fully client-side; state persisted to `localStorage` (JSON), no backend.

Data model: `state{ uptime, services:[{id, type, health(0-1), decayRate, incomePerSec, upgrades:{...}}], events:[{type, serviceId, firedAt, resolvesAt}], lastTick }`. Upgrades and service types defined declaratively in a `content.ts` table (name, cost curve, effect) so balancing is data, not code.

Key algorithms:
- **Tick loop**: fixed-timestep accumulator (`requestAnimationFrame` + delta), each tick applies decay (`health -= decayRate*dt`), accrues income (`uptime += Σ incomePerSec*health*dt`), and rolls entropy events (Poisson process per service; `p = 1 - e^(-λ*dt)`).
- **Offline progress**: on load, `elapsed = now - lastTick`; fast-forward the simulation in coarse steps (cap elapsed to avoid runaway), so closing the tab and returning shows realistic decay + earnings.
- **Cost curves**: geometric (`cost = base * mult^level`) so upgrades hit diminishing returns.

The hard part is *balance*: entropy must be tense but not punishing, offline progress must feel fair not exploitable, and cost curves must keep the "one more upgrade" pull alive. This is tuning-by-playtest against the decay/income constants, not a coding problem.

## v1 scope (humiliatingly small)

- Three service types (proxy, media server, backups) with health + income.
- One currency (Uptime) and one entropy event type (cert expiry) with a fixed timer.
- Buy-to-heal and buy-to-slow-decay upgrades with geometric cost curves.
- Real-time tick + `localStorage` save + basic offline-progress on reload.

## Out of scope (for now)

- Prestige/rebirth layer, tech tree, achievements.
- Multiple entropy types (stale mount, OOM, disk-full) — teased, not built.
- Real integration with an actual homelab (Docker/Prometheus) — it's a game, not a dashboard.
- Multiplayer, cloud saves, art beyond simple icons.

## Risks & unknowns

Prior-art verdict: **Fresh** — idle games are a saturated genre, but a homelab-entropy-themed one is unbuilt and the theme is the whole novelty. Risks: balance is make-or-break and only findable by playtesting (mitigate: constants live in a data table, tune fast); offline-progress math is easy to get exploitable or to make loads feel like punishment (cap elapsed, simulate coarsely); the joke may be too niche (accept — the target audience is exactly homelabbers). Scope creep into a "real" monitoring tool is the biggest trap — it must stay a game.

## Done means

The game loads, shows three services earning Uptime in real time, fires a cert-expiry event that visibly degrades a service and cuts income, lets you spend Uptime on an upgrade that measurably slows decay, saves to `localStorage`, and shows fair accrued decay + earnings after the tab is closed and reopened.

## Overview
Aggro is a self-hosted ops dashboard that reskins your neglected homelab as a Risk of Rain 2-style horde survival. Every open problem — a failing backup, a container 40 versions behind, a cert expiring in 6 days, a disk at 91% — becomes a monster on a battlefield. Like RoR2's director, threat scales with time: the longer you ignore something, the bigger, faster, and redder it gets. For homelabbers who let alerts rot because a flat list of warnings never feels urgent.

## Problem
The Lobsters 'I Don't Maintain My Homelab' post and the eternal 'have you restarted this week' energy point at a real failure mode: monitoring produces flat, undifferentiated warning lists that induce zero urgency, so backups quietly fail for months. Meanwhile RoR2's genius is that *time itself* is the antagonist — the escalating director makes procrastination viscerally dangerous. Nobody has weaponized that loop against ops neglect.

## How it works
Aggro ingests alerts from your existing stack and maps each to a monster whose stats are functions of severity × age. A 2-day-old warning is a weak lemurian; the same alert at 30 days is an elite with a health bar that fills your screen. Resolving the underlying issue (the alert clears) plays a kill animation and awards 'coins.' Unattended monsters periodically 'attack,' draining a shared base HP that's really just a gamified SLO. A weekly boss spawns from your single worst-aged issue. The dashboard is a real-time 2D arena, not a table.

## Technical approach
Stack: a Go/Node service subscribing to Prometheus Alertmanager webhooks + Uptime Kuma's API + optional generic webhook ingest; state in SQLite; front-end is a Canvas/PixiJS arena fed over WebSocket. Data model: `monster(alert_fingerprint, severity, first_seen, last_seen, state)`; monster stats = `f(severity, now - first_seen)` via a tunable escalation curve (mirroring RoR2's time-based difficulty coefficient). Kills are inferred from alert-resolved events (fingerprint disappears / resolves). Hard part: stable fingerprinting so a flapping alert doesn't spawn/kill the same monster repeatedly, plus an escalation curve that maps real-world urgency (cert expiry is a countdown; disk fill is a rate) onto believable monster growth without crying wolf.

## v1 scope
- Ingest Alertmanager webhooks only
- Map each firing alert to one monster; stats scale with age
- Canvas arena over WebSocket showing monsters + a base HP bar
- Resolve event → kill animation; SQLite persistence

## Out of scope
- Coins/shop/upgrades, bosses, multiplayer co-op homelab
- Auto-remediation (it visualizes, it doesn't fix)
- Uptime Kuma / generic ingest beyond Alertmanager

## Risks & unknowns
- Alert fingerprint churn causing monster flicker
- Novelty wearing off — does the horde stay motivating after week two?
- Escalation tuning: too aggressive = the arena is always on fire and you tune it out

## Done means
Pointed at a test Alertmanager, firing a warning spawns a monster in the arena; leaving it firing visibly escalates its size/stats over simulated time; resolving the alert triggers a kill animation and removes it; state survives a service restart.

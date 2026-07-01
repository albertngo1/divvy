## Overview
Retinue is a Warhammer 40k: Rogue Trader–style crew-management CRPG skinned onto your actual homelab. Each Docker container or self-hosted service becomes a named crew member aboard your void-ship, with a portrait, a personality, and a loyalty meter driven by real uptime. For homelabbers who run a dozen services and want their ops dashboard to have stakes and character.

## Problem
A homelab status page is a wall of green/red dots with no memory and no drama. You don't feel the difference between a service that's been rock-solid for months and one that flakes weekly. Maintenance is a chore with no narrative — nothing rewards keeping the fleet happy.

## How it works
Every monitored service is a crew member. Sustained uptime raises loyalty; each crash, restart, or failed healthcheck is a grievance that lowers it. Low-loyalty crew trigger "mutiny events" — a flavor-text incident card demanding an action (restart, free disk, acknowledge). Cron jobs you already run appear as "edicts" the captain issues. Services gain traits over time ("Stalwart" after 30 days up, "Temperamental" after 3 crashes in a week). A weekly "ship's log" narrates the fleet's saga. It's read-mostly: the game layer sits on top of monitoring you already have.

## Technical approach
Static dashboard + small poller. Ingest health from an existing Uptime Kuma instance (its API/`/metrics`) or plain Docker `healthcheck` state via the Docker socket. Poller (Node or a cron `.mjs`) writes a time-series of `{service, status, ts}` to SQLite. Derive per-service `loyalty` as an EWMA of uptime minus weighted crash penalties; traits are threshold triggers over rolling windows. Frontend renders crew portraits (procedurally-tinted SVG or a fixed portrait set keyed by service name hash) and mutiny cards. Data model: `services`, `events`, `traits`, `edicts`. The hard part is a loyalty/decay curve that produces *earned* drama — a genuinely flaky service should feel villainous, a stable one revered — without spamming mutiny cards for every routine restart.

## v1 scope
- Poll one Uptime Kuma instance
- Loyalty = simple uptime EWMA, one penalty rule
- Crew grid with portraits + loyalty bars
- One mutiny card type on threshold breach

## Out of scope
- Taking real actions (restart/heal) from the UI
- Story/quest chains, combat
- Multi-node fleets

## Risks & unknowns
- Flavor could get grating fast; needs restraint
- Distinguishing intentional restarts from real failures
- Portrait generation that doesn't look generic

## Done means
Pointed at a live Uptime Kuma, the crew grid shows each service with a loyalty bar that visibly drops on a real outage and recovers over uptime, and a service that flaps produces exactly one mutiny card.

## Overview
Servitor is a self-hosted web dashboard for people who run a homelab of Docker containers, reskinned as a Warhammer-40k servitor-master sim. Your running containers aren't rows in `docker ps` — they're captured, half-machine labor-drones bound to your will, toiling until they falter. It's a monitoring tool wearing the cruelest possible costume.

## Problem
Portainer/Grafana make container health *legible* but never *felt*. You ignore a crash-looping service because a red dot has no stakes. The itch: make the emotional weight of neglect match the operational cost, and make babysitting `restart: unless-stopped` fun instead of a chore.

## How it works
Every detected container becomes a Servitor with a portrait, a servo-hum ambient mood, and vitals: Vigor (CPU headroom), Sustenance (memory), and Sanity (restart count + error-log rate). Newly-appeared containers must be 'captured' (acknowledged) into your roster. You assign each to a Labor rite; a Servitor whose Sanity hits zero 'goes rogue' — it turns feral in the UI (twitching sprite, red klaxon) until you perform a Rite: Restart, Purge (recreate), or Anoint (pull latest image). 'Breeding' lets you spawn a new Servitor from a compose template stitched from two existing ones. A grimdark event log narrates everything ('Servitor JELLYFIN-7 has exceeded its swap tithe').

## Technical approach
Stack: a small Go or Node backend talking to the Docker Engine API over the `/var/run/docker.sock` unix socket (`GET /containers/json`, `/stats?stream=true`, `/events`), streaming to a browser front-end via websocket. Front-end is plain Canvas/Pixi.js sprites + a reactive vitals panel (Svelte). Data model: `Servitor {id, name, image, roster_state, vitals[], rites_log[]}`, persisted in SQLite so mood/history survive restarts. Vitals are rolling windows over the stats stream; Sanity is a decaying counter fed by container `RestartCount` deltas and a tail of stderr (`GET /containers/{id}/logs`). The genuinely hard part is mapping noisy, bursty stats into stable, readable 'moods' without flicker — needs EWMA smoothing plus hysteresis thresholds so a Servitor doesn't flap between calm and feral every few seconds.

## v1 scope
- Read-only auto-discovery of running containers into a roster grid
- Three vitals per Servitor from the live stats stream
- Sanity meter driven by restart count + error-log rate
- One Rite that works: Restart (POST to Docker API) with a confirm dialog
- Grimdark event-log ticker

## Out of scope
- Breeding/compose generation
- Multi-host / Swarm / k8s
- Auth, multi-user, remote access hardening
- Sound design beyond one hum loop

## Risks & unknowns
- Exposing the Docker socket to a web app is a real security footgun; must run local-only behind Tailscale and never accept mutating calls unauthenticated.
- Stats-stream overhead with 30+ containers could tax the mini; may need sampling.
- The joke could wear thin without enough flavor-text variety.

## Done means
Running `docker compose up` on Servitor surfaces every local container as a Servitor within 5 seconds, a container crash-loop visibly drives its Sanity to zero and flips it 'feral,' and clicking Restart actually restarts it and calms the sprite — all without leaving the browser.

## Overview
Salvage is a real-time, command-line survival game where the map is *your actual homelab*. Like Duskers (which HN notes is getting a sequel), you never see the whole picture — you send remote 'drones' (agents) into unhealthy or dead containers through a fog of war, issuing four-letter commands, and try to bring services back before the night's decay spreads. For homelabbers who babysit Docker stacks and want the babysitting to feel like a tense recovery op.

## Problem
Restarting a wedged container is boring, invisible drudgery. Meanwhile the real emotional texture of ops — 'is it dead? what's the blast radius? do I dare touch it?' — is exactly the tension good games are made of. Nobody has framed your own dashboards as a roguelike derelict.

## How it works
Salvage boots into a monospace terminal. Each container is a 'room' rendered only when a drone is inside it (`sensors` reveals CPU/mem/restart-count as ambient readings). You type Duskers-style commands: `d1 go jellyfin`, `d1 probe` (read logs), `d1 jolt` (restart), `gen` (spin a fresh drone from a compose service), `tow` (pull an image). Dead containers are 'derelicts' full of hazards — an OOM-looping service is a fire that spreads to linked containers; a failing healthcheck is a hull breach. You win a run by restoring N flagged services; you lose if cascade failures take the stack down. Purely a *read + restart/scale* layer over real Docker — it never deletes data.

## Technical approach
Stack: Python + `textual` for the TUI, `docker` SDK (or the Unix socket API `/containers/json`, `/containers/{id}/stats`, `/logs`, `POST /restart`) as the live map source. A tick loop (1–2s) polls stats; a small state machine models 'hazards' as derived conditions (restart_count delta, healthcheck=unhealthy, mem>90%). Fog of war = only surface data for containers a drone currently occupies. The genuinely hard part is the *hazard-spread model*: mapping `depends_on` / shared-network edges into a contagion graph so a failing upstream believably 'spreads fire' to neighbors, and tuning it so it mirrors reality without being punishing noise.

## v1 scope
- Read-only map of running containers + one action verb: `jolt` (restart)
- Fog of war: stats hidden until a drone `go`es there
- One hazard type: restart-loop = fire, spreads along one network edge
- Win condition: restore 3 flagged 'derelict' containers in the session

## Out of scope
- Kubernetes, multi-host, non-Docker backends
- Any destructive verb (rm, prune, volume ops)
- Persistent campaign/save between sessions

## Risks & unknowns
- Docker socket access is powerful; must be read+restart-scoped, documented loudly
- Fun-vs-real tension: if it's too faithful it's just `docker ps`; needs juice (sound, ASCII, stakes)
- Contagion tuning could feel arbitrary

## Done means
Running `salvage` against a compose stack, I can kill a container by hand, watch a 'derelict' appear in fog, drive a drone in, `jolt` it back, and see a spreading 'fire' halt when I restore the upstream — all without a single destructive Docker call.

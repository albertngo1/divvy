## Overview
Séance is Phasmophobia for infrastructure: a small co-op web app that reframes incident debugging as a ghost hunt over your own telemetry. It's for homelabbers and small SRE teams who find 2am log-spelunking lonely and joyless. An 'incident' becomes a haunting; your job is to gather evidence and correctly identify the entity before it wins.

## Problem
Debugging outages is solitary, unstructured, and demoralizing. Evidence-gathering is ad hoc ('let me grep', 'check the graph'), there's no shared ritual, and juniors never learn the *pattern* of a memory leak vs. a thundering herd vs. a full disk. The fun of a co-op horror game — shared tension, dividing labor across instruments — is exactly what a war room lacks.

## How it works
A session starts when you point Séance at a time window (live or a past incident). Each player picks an *instrument*: the EMF Reader (error-rate spikes), the Thermometer (CPU/temp/saturation), the Spirit Box (tails logs for phrases), the Camera (goroutine/heap snapshots). Instruments only 'react' when their signal is anomalous, so players roam the metrics 'house' hunting for reactions. Three matching pieces of evidence unlock a guess: name the ghost (The Leak, The Herd, Bad DNS, The Full Drive, The Deadlock). Guess right → banish, log a tidy post-incident card. Guess wrong → the haunting escalates (more noise injected). A leaderboard tracks fastest correct banish.

## Technical approach
Svelte or React front end, single Node service. Data sources are real: Prometheus HTTP API (`/api/v1/query_range`) for metrics and Loki (`/loki/api/v1/query_range`) for logs; optional pprof endpoints for the Camera. The core algorithm is anomaly-to-evidence mapping: rolling z-score / MAD over each series, plus simple pattern signatures (monotonic RSS climb → Leak; correlated request-rate + latency knee → Herd; NXDOMAIN log rate → Bad DNS). Multiplayer presence over WebSockets (cursors, who's holding which instrument, shared evidence board). Data model: Session → Instruments → EvidenceReadings → Verdict. The genuinely hard part is turning messy real telemetry into a *small, legible* evidence taxonomy without constant false spooks — the signature library and its thresholds are the whole game.

## v1 scope
- One Prometheus data source, hardcoded URL
- Three instruments (EMF, Thermometer, Spirit Box)
- Four ghost types with signature rules
- Solo mode, single fixed time window
- A 'haunt generator' that injects a synthetic memory leak for demos

## Out of scope
- PagerDuty/Opsgenie integration, real alert routing
- Auto-remediation
- Auth, multi-tenant, mobile

## Risks & unknowns
- Novelty may wear off once the signatures are memorized
- Real telemetry is noisier than demos; false spooks kill immersion
- Teams may find gamifying real outages tasteless — position it for practice/postmortems first

## Done means
Point Séance at a Prometheus instance running a service with a seeded memory leak; a solo session surfaces three EMF/Thermometer/Camera readings and lets the player correctly identify 'The Leak', producing a banish card with the offending series named.

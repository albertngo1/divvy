## Overview
Sev One steals Overcooked's real-time cooperative-chaos loop and grafts it onto incident response. Two to four players share one simulated production stack rendered as a live dashboard. Alerts pour in; players must diagnose and fire the right "runbook" actions — restart pod, scale replicas, flush cache, page a human — before compounding failures cascade into a full outage. It turns the most stressful part of ops into a couch co-op game, and doubles as low-stakes muscle memory for the real thing.

## Problem
Incident response is learned only under fire, in prod, at 3am. New engineers have never *felt* a cascade before their first real one. And there's no fun team-bonding artifact around on-call the way there is around, say, escape rooms. Overcooked proved chaotic-coordination-under-time-pressure is joyful — nobody's pointed it at ops.

## How it works
Each round is a scenario (deploy gone wrong, thundering herd, disk-full spiral) on a shared topology map: services as nodes, request flow as animated edges, a golden-signals gauge cluster (latency, error rate, saturation, traffic). Alerts spawn on nodes. Players grab actions from a shared "station" — but actions have cooldowns and prerequisites (can't scale before you've fixed the config), and firing the wrong action makes things worse (a restart during a migration = data corruption debuff). One player might own the terminal, another the dashboard, shouting coordination. Win = survive N minutes keeping the error-budget bar above zero. Difficulty ramps with correlated failures that require reading dependency direction correctly.

## Technical approach
Deterministic discrete-event sim in TypeScript: a tick loop advances a state machine per service (healthy → degraded → down) with a dependency DAG so failures propagate downstream, plus a Poisson-ish alert generator seeded per scenario for reproducibility. Golden signals are derived quantities of node states, not real telemetry — but rendered in a Grafana-esque UI (React + a lightweight charting lib) so it *reads* real. Multiplayer is authoritative-server: one Node process runs the sim, clients send action intents over WebSocket, server validates prerequisites/cooldowns and broadcasts state deltas. Scenarios are authored as JSON (initial topology, fault schedule, valid action graph). Hard part: tuning the fault-cascade timing so it's tense-but-fair and readable at a glance — telegraphing enough that skilled play beats it, punishing enough that panic loses.

## v1 scope
- 1 authoritative sim server, 2-player WebSocket co-op
- 3 hand-authored scenarios + 6 actions with cooldowns/prereqs
- Topology map + 4 golden-signal gauges + error-budget bar
- Win/lose screen with a post-incident timeline recap

## Out of scope
- Real integration with anyone's actual infra/metrics
- Solo campaign, progression, unlocks
- More than one "region"

## Risks & unknowns
- Could feel like homework instead of a game; theming and pace are everything
- Readability of cascades on a small shared screen is unproven
- Balancing fault timing to a fun difficulty curve is the whole battle

## Done means
Two players on separate laptops join a scenario, watch a config fault cascade downstream through the DAG, coordinate to fire the correct prereq-gated actions in time, keep the error budget positive for the full round, and see an accurate post-incident timeline of every action and failure.

## Overview
Postmortem is a 2–4 player co-op horror game where the 'haunted house' is a simulated microservice deployment and the 'ghost' is an incident type (memory leak, thundering herd, DNS poisoning, cert expiry, noisy neighbor, cascading retry storm). Built for engineers who want the Phasmophobia loop — creep, gather evidence, identify, get out — grafted onto the dread of a real 3am page.

## Problem
Incident-response training is boring slideware or dry game-days. Meanwhile the Phasmophobia evidence-journal loop is one of the most replayable co-op formats going. Nobody has stolen it for the one domain where 'walk into a dark broken system and figure out what's killing it' is literally the job.

## How it works
Each player joins from a laptop; the shared 'house' is a live topology graph (nodes = services). You 'walk' between services and use tools that each surface ONE evidence type: a log tail, a flamegraph, a metrics dashboard, a packet capture, a DNS probe. Each ghost is defined by exactly 3 of ~8 evidence markers (e.g. thundering herd = synchronized retry spikes + connection-pool exhaustion + upstream 503s). You cross markers off a shared journal and vote on the culprit. Dawdle too long and the incident ESCALATES: a hunt phase where latency graphs go red, alerts scream, and one random service goes fully dark — you must physically stop poking and 'shelter' (freeze inputs) until it passes. Correct identification + a written one-line remediation = win and a generated postmortem doc.

## Technical approach
Stack: a Node/TS authoritative server driving a deterministic fault-injection sim (no real infra needed) over WebSocket; React + a force-directed topology graph (d3) per client. Each ghost is a YAML scenario: seed markers, escalation timers, decoy markers to induce false positives. The evidence tools are canned generators that render believable synthetic logs/metrics from the scenario's ground truth (Faker + templated Prometheus-style series). Hard part: tuning decoys so ghosts are distinguishable but not trivially so — a confusion matrix over playtests, targeting ~70% first-try ID. Voice proximity chat (WebRTC) sells the horror. Scenarios authored from real public postmortems (Cloudflare, GitHub, AWS writeups) for flavor.

## v1 scope
- 4 ghosts, 5 evidence tools, one fixed 6-node topology
- 2–4 players, one hunt/escalation mechanic
- Shared journal + majority-vote identification
- Auto-generated markdown postmortem on win

## Out of scope
- Real infra hookup / bring-your-own-cluster
- Progression, unlocks, cosmetics
- Mobile clients

## Risks & unknowns
- Fun-vs-realism balance: too real = homework, too gamey = pointless
- Voice + graph nav may overwhelm; needs a tutorial ghost
- Decoy tuning is the make-or-break; could feel arbitrary

## Done means
Four engineers who've never played can, in under 12 minutes, gather evidence, survive one hunt, correctly identify a ghost they haven't seen, and receive a coherent generated postmortem — and immediately ask to run another scenario.

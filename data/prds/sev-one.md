## Overview
Sev One is a daily incident-response speedrun for engineers, SREs, and anyone who's ever squinted at Grafana at 3am. Each day at midnight UTC, a new synthetic 'outage' drops: a realistic stream of Loki-style logs, metrics, and traces from a fake microservice fleet. Players scrub the logs and submit a guess — which service failed, and the root cause — as fast as they can. Fastest correct triage tops the board.

## Problem
Reading logs and dashboards is the most passive, solitary activity in ops — you stare, you scroll, you wait for the pattern to jump out. There's no shared arena for the actual *skill* of triage, and no fun way to practice it off the clock. Sev One turns log-reading into a daily competitive sport, like Wordle for on-call.

## How it works
The puzzle presents a searchable log pane (LogQL-lite filter box), a few sparkline metrics (latency, error rate, saturation per service), and a dependency graph of ~8 services. Somewhere in the noise, one service is the true culprit (e.g. a downstream DB connection-pool exhaustion cascading into upstream 503s). You filter, correlate the error spike to a deploy marker, follow the blast radius, then submit: {culprit service, root cause from a multiple-choice list}. Wrong guesses add a time penalty. On solve you see your rank and a shareable spoiler-free result grid (🟩 culprit, 🟨 cause, ⏱ time).

## Technical approach
Stack: static front end (SvelteKit) + a tiny scenario generator run as a nightly cron. The generator is the core: a seeded scenario builder that picks a fault template (pool exhaustion, bad deploy, retry storm, disk-full, clock skew), simulates a dependency DAG, and emits time-ordered log lines with realistic templates + injected anomaly, plus per-service metric time series. Output is a single signed JSON blob per day, served from a CDN — no live backend needed, everything runs client-side, which also prevents answer-scraping (the answer is hashed, guesses checked against the hash). LogQL-lite is a small parser over label/regex filters on the log array. Hard part: making the noise realistically *misleading* — red-herring error spikes in innocent services — so the puzzle rewards causal reasoning over ctrl-F.

## v1 scope
- One fault template (connection-pool exhaustion), 6 services
- Log pane with substring + service filter, one metric sparkline row
- Multiple-choice root cause, single daily puzzle, local timer
- Shareable emoji result string

## Out of scope
- Accounts, global leaderboard (local best only in v1)
- Traces/flame graphs, real LogQL, custom scenario editor
- Multiplayer live races

## Risks & unknowns
- Generating logs that are misleading-but-fair is genuinely hard; too easy = ctrl-F, too noisy = unsolvable
- Multiple-choice root cause may feel cheap vs free-text (which is hard to grade client-side)
- Answer hashing deters casual cheating but a determined player can diff scenarios

## Done means
Opening the app on a given day loads that day's generated log/metric scenario, a player can filter logs, pick the culprit service and root cause, get a correct/incorrect verdict with an elapsed time, and copy a shareable result grid — all with no server round-trip for the answer.

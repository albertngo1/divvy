## Overview
Hall Call is a discrete-event simulator and explorable report that treats your CI runner pool as an elevator bank. It ingests your real GitHub Actions job history, replays it under alternative dispatch policies borrowed from elevator engineering, and renders a side-by-side Gantt showing what your *actual* jobs would have done under each policy. For platform/DevEx engineers who keep getting asked "can we just add more runners?"

## Problem
CI queue time is the most-complained-about, least-modeled number in engineering orgs. The only lever anyone reaches for is runner count, which is linear in money. Elevator dispatch solved the identical problem — bursty arrivals, heterogeneous destinations, sharp peaks — decades ago with express zones, sectoring, and destination dispatch, and none of that vocabulary has ever reached CI schedulers. Nobody can answer "would reserving two runners for sub-2-minute jobs beat adding a third runner?" without an experiment they'll never run.

## How it works
1. **Harvest.** Pull runs and jobs for a repo over N days. Each job becomes an event: `(id, run_id, name, labels, created_at, started_at, completed_at, runner_name, needs[], image)`. Queue wait = `started_at - created_at`.
2. **Calibrate.** Fit per-job-name duration distributions (median + IQR). Estimate a **cold-cache penalty**: regress observed duration on whether the previous job on that same runner used the same container image / same cache key. This is what makes affinity routing pay.
3. **Replay.** Feed the arrival stream into a discrete-event sim with M runners and a pluggable dispatcher, respecting `needs:` dependency DAGs and concurrency groups. Job duration = `base_duration + cold_penalty × (1 - cache_warmth)`.
4. **Policies.** FIFO (baseline, must reproduce reality); SJF using predicted median; **express zone** (reserve k runners for jobs whose predicted duration < T — the elevator express car); **destination dispatch** (route by image so warm layers get reused); **sectoring** (partition runners by label group).
5. **Explain.** A single static HTML page: real Gantt on top, counterfactual below, a slider for runner count, toggles for policy, and a headline delta — "express zone with 6 runners ≈ FIFO with 9 runners."

## Technical approach
Python + `simpy` for the DES core, `httpx` against `GET /repos/{o}/{r}/actions/runs` and `/actions/runs/{id}/jobs` (paginate; cache to SQLite so you harvest once). Dispatcher is a function `(pending_queue, idle_runners, clock) -> assignments`, so new policies are ~20 lines. Front-end is a hand-written D3 Gantt in one HTML file — no build step.

The hard part is that duration is **not policy-invariant**. Naively replaying assumes jobs take the same time regardless of where they land, which erases the entire benefit of affinity routing and makes every policy look identical. The cold-cache regression is the whole ballgame, and it's noisy: image reuse, tool-cache hits, and network variance are confounded. v1 should report the fitted penalty with a confidence interval and let the user override it, rather than pretending it's precise.

## v1 scope
- One repo, GitHub Actions only, last 30 days
- Two policies: FIFO and express-zone
- Fixed job durations (median per job name), no cache model
- Terminal output: p50/p95 queue wait per policy, plus a PNG Gantt

## Out of scope
GitLab/Buildkite/Jenkins ingestion, live scheduling (this is analysis, not a scheduler), cost modeling in dollars, matrix-expansion inference beyond what the API reports.

## Risks & unknowns
GitHub-hosted runners hide the pool size, so M must be inferred from observed concurrency — that inference could be wrong enough to invalidate the baseline. Repos with light CI won't have enough queueing for any policy to matter; the tool should say "you are not queue-bound, stop reading" rather than invent a win. Self-hosted fleets are the real audience.

## Done means
Replaying a real 30-day log under FIFO reproduces the observed p95 queue wait within 10%; only then are alternative policies reported, each with the runner-count-equivalent framing.

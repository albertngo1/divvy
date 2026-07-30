## Overview
Push Window is a small CLI that models your CI as a *quantized* system rather than a continuous one. It ingests your repo's run history, discovers the periodic structures hiding in queue latency — runner warm-pool refresh, cron-triggered autoscaling, nightly batch windows, cache-prewarm jobs, the 5-minute poll of a self-hosted agent — and answers one question you ask constantly and currently guess at: *if I push right now, when do I get green?* It also answers the better question: *when should I push instead?*

## Problem
Everyone treats CI latency as a scalar ("our builds take 8 minutes"). In practice a large fraction of commit→green is queue time, and queue time is rarely smooth — it's shaped by schedulers with fixed periods. Pushing at 10:04 and 10:06 can differ by many minutes for reasons no dashboard surfaces, because every CI dashboard aggregates by day and throws the phase away. So you sit and watch a spinner you could have avoided.

## How it works
`pw sync` backfills run history. `pw now` prints the current cost of pushing: expected queue delay, expected total, and the delta against the best moment in the next 30 minutes. `pw heat` renders a terminal heatmap of median queue delay over (minute-of-hour × hour-of-week), which is where the structure becomes visible and slightly infuriating. `pw wait && git push` blocks until the cheap window opens, with a countdown; `pw push` is sugar for the same. A `--statusline` mode emits a one-line JSON blob for tmux/starship/Claude Code, so the number lives in your prompt.

## Technical approach
Go or Rust, single binary, SQLite store. Data: GitHub Actions REST — `GET /repos/{o}/{r}/actions/runs?per_page=100` for `created_at`, `run_started_at`, `updated_at`, plus `/runs/{id}/jobs` for per-job `started_at`/`completed_at` and step timings. Queue delay = `job.started_at − run.created_at`; execution = the rest. GitLab (`/projects/:id/pipelines`) and self-hosted Actions runners via the same API.

Periodicity detection is the interesting bit. For each (repo, workflow, runner-label) group, take the series of (push epoch seconds, queue delay) and test a candidate period set P = {60, 120, 300, 600, 900, 1800, 3600, 86400} by folding: for each p, bin delays by `t mod p` and score with a circular Kruskal–Wallis / variance-ratio statistic against a shuffled null. Keep periods that beat a permutation-derived threshold; the fitted phase profile becomes the forecast, blended with a recency-weighted baseline. Prediction is then just: for each candidate future minute, evaluate the surviving folded profiles.

The genuinely hard part is sample sparsity — a hobby repo may have 200 runs, which is nowhere near enough to resolve a 5-minute period against noisy execution times. Mitigation: pool across repos sharing a runner label (the quantization is a property of the *runner pool*, not the repo), and refuse to predict below a confidence floor rather than emitting confident garbage.

## v1 scope
- GitHub Actions only, one repo, PAT from env
- `pw sync`, `pw heat`, `pw now`
- Fold-test over a fixed period set; no blending, no ML
- Print "insufficient data" when n < 150 runs

## Out of scope
GitLab/Buildkite/Jenkins, cost-in-dollars, flaky-test analysis, a web UI, auto-push daemons.

## Risks & unknowns
Many hosted pipelines may show no exploitable quantization at all — in which case the honest output is "your CI is smooth, stop optimizing," which is a legitimate but unsellable result. Self-hosted homelab runners are where the effect should be strongest; validate there first.

## Done means
On a repo with a deliberately cron-gated runner (a 5-minute poller), `pw heat` visibly recovers the 5-minute stripe without being told it exists, and `pw now` predicts queue delay within ±30s median absolute error on a held-out final 20% of runs.

## Overview
A GitHub App (v1: a CLI) that treats your CI suite as a set of noisy sensors and asks the only question nobody asks: *how much does each check actually tell us?* It ranks every required check by conditional mutual information with "this PR was broken", prices each in dollars of runner spend, and hands you a pruning report. Buyers are platform/DevEx leads at 50–500-engineer companies whose Actions bill crossed $10k/month and whose PR wait time crossed 20 minutes.

## Problem
CI suites are monotonic: checks get added after every incident and are never removed. Nobody can defend deleting one, because nobody can quantify what it catches. Meanwhile agents now open 5× the PRs, so every redundant job is multiplied. Existing tools (usage dashboards, test-impact analysis, faster runners) optimize the cost of running checks. None ask whether the check should exist.

## How it works
1. Backfill 90 days of `workflow_run` / `workflow_job` via the REST API into a PR × check outcome matrix: pass / fail / skipped, duration, runner label, retry count, head SHA.
2. Define the target variable Y = "this PR required a fixing commit before merge, or was reverted within 7 days."
3. For each check C compute: unique-failure count (times C failed and nothing else did), redundancy clusters (checks whose failures co-occur ≥95% — Jaccard over failure sets), and marginal conditional mutual information I(C ; Y | S) where S is the already-selected check set, chosen greedily (CMIM). Miller–Madow bias correction, because failures are rare and naive MI is optimistic.
4. Price it: minutes × per-minute rate per runner label. Output `$/bit`.
5. Weekly report: "`lint-docs` cost $1,240 this quarter, carried 0.003 bits, and has never been the only failing check. Demote to non-required." Optional PR that edits the workflow YAML.
6. Flaky checks inflate MI by failing on noise: detect via same-SHA retry flips and exclude those events.

## Technical approach
Python + DuckDB for the analytics (the whole matrix for a big monorepo is <100MB), Postgres for the hosted version. GitHub App with `actions:read`, `checks:read`, `contents:read`; webhooks on `workflow_run.completed` for incremental updates. The genuinely hard part is confounding: a check that never fails may be *why* people never break that thing, and job-level pass/fail hides step-level signal. Mitigation is a **shadow mode** — demote the candidate to non-required, keep running it, and measure escaped defects for 30 days before recommending deletion. That measurement is also the upsell.

## v1 scope
- CLI: `alwaysgreen <owner/repo>` with a PAT.
- Backfill 90 days, single repo, GitHub Actions only.
- One table: check, runs, $ cost, unique failures, bits, $/bit.
- Redundancy clusters printed as groups.

## Out of scope
GitLab/Buildkite/CircleCI, web UI, org rollups, auto-PRs, test-level (rather than check-level) granularity, runner right-sizing.

## Risks & unknowns
Rare-event MI is noisy under 500 PRs. Compliance-mandated checks can't be deleted regardless of signal (needs a "pinned" list). Billing granularity from the API may force a rate table. Selection bias: devs fix things locally, so CI never sees those failures.

## Done means
Run against a repo with ≥500 merged PRs, it produces the ranked table in under 5 minutes and surfaces at least one required check with >$500/quarter cost and zero unique failures — and the repo's owner agrees it can be demoted.

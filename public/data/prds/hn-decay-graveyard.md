## Overview

Show HN Graveyard tracks every "Show HN" launch and charts, over time, how many are still alive. Each launch becomes a dot in a cohort; a background job periodically re-checks whether the linked site still responds and whether the backing repo is archived or abandoned. The result is a single scannable page where you watch a cohort of hopeful launches decay — and can filter to the survivors, which are more interesting *because* of the graveyard around them.

## Problem

Every day dozens of Show HN projects launch with hope, spike on the front page, then quietly die: domain lapses, repo gets archived, last commit drifts a year back. Nobody tracks the attrition. There's no shareable artifact showing "of the 400 things launched in Q1, N are still standing." The survival curve itself is the story, and it doesn't exist as an object you can look at.

## How it works

Ingest every Show HN post (title, URL, points, author, timestamp). On a schedule, re-probe each one: does the URL still resolve and return a healthy status? If it points at (or links) a GitHub repo, is the repo `archived`, and how stale is `pushed_at`? Classify each launch as alive / dying / dead and store a timestamped snapshot. The front end renders the cohort as a decaying dot field over time, colored by liveness, sized by HN points.

## Technical approach — specific & technical

Stack: static-ish site (Vite + TypeScript, plain Canvas/SVG for the dot field), plus a scheduled Node/Python worker (cron or GitHub Actions) writing a JSON snapshot committed to the repo — no server needed for v1.

Data sources by name:
- **HN Algolia API** — `https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&numericFilters=created_at_i>...` for backfill, paginated by `created_at_i`. Fields: `objectID`, `title`, `url`, `points`, `author`, `created_at_i`.
- **HTTP liveness**: `fetch` with `HEAD` (fall back to `GET`), 10s timeout, follow redirects; record final status, TLS validity, and whether it redirects to a parking/registrar page (regex on known parking hosts).
- **GitHub REST API** — `GET /repos/{owner}/{repo}` for `archived` + `pushed_at`; parse owner/repo from the launch URL or its outbound links. Auth with a PAT to get 5000 req/hr.

Data model: `launches[{id, title, url, points, created_at, repo?, snapshots:[{ts, http_status, resolves, tls_ok, repo_archived, pushed_at, verdict}]}]`. Verdict = alive (200 + fresh), dying (200 but repo stale >18mo or archived), dead (non-2xx / DNS fail / parked).

Key algorithm: the liveness classifier and de-duped cohort binning by launch week. The hard part is polite, resilient probing at scale — thousands of URLs, flaky hosts, rate limits, false-dead from Cloudflare/anti-bot pages — so cache snapshots, back off, and require two consecutive dead probes before marking dead.

## v1 scope (humiliatingly small)

- Backfill last 90 days of Show HN via Algolia.
- One liveness pass (HTTP + GitHub archived/pushed_at), stored as JSON.
- Single page: dots colored alive/dying/dead, sized by points, filter to "still alive."
- Weekly re-check via a scheduled job appending snapshots.

## Out of scope (for now)

- Full HN history backfill (years).
- Screenshots / uptime graphs per project.
- Non-GitHub repo hosts, npm/PyPI package liveness.
- User accounts, notifications, "adopt this dead project."

## Risks & unknowns

Prior-art verdict: **Partial** — HN dashboards exist, but a launch-cohort survival curve with per-project liveness is unbuilt. Risks: false-deads from bot-walls and parking pages (mitigate with two-strike rule + parking-host list); GitHub rate limits on large cohorts (batch, cache); URL→repo mapping is fuzzy (best-effort, skip when ambiguous). Validate the classifier on 30 hand-labeled launches before trusting the curve.

## Done means

Loading the page shows a 90-day cohort of Show HN launches as colored dots; the "still alive" filter works; each dot shows its verdict and evidence (HTTP status, repo staleness) on hover; a scheduled re-check appends a new snapshot without manual intervention.

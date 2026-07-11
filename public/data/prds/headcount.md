## Overview
Headcount is a self-hosted daemon that treats your project's dependency graph as a corporation and narrates its life over a year. Each package is an employee; the dependency graph is the org chart. Version bumps, additions, removals, forks, and CVEs become HR events. It renders an evolving org chart plus a daily 'internal memo', and on New Year's Eve it compiles a deadpan annual report. For developers who want their `package.json` to have a plot.

## Problem
Dependency changes are invisible bookkeeping — a lockfile diff nobody reads. The 'Package Management as Org Chart' framing is funny precisely because dep graphs *are* org charts, but no tool leans in. Meanwhile the ambient-artifact itch: something that quietly accretes meaning over 12 months with zero daily effort.

## How it works
It watches your lockfile(s) on a schedule. Each run it diffs against yesterday and classifies events: new dep = **new hire**; version bump = **promotion** (major) / **raise** (minor); removed dep = **layoff**; a dep that became a fork you now vendor = **defection** (took trade secrets to a competitor); a dep with a fresh CVE = **scandal**; unmaintained (no release in 2y) = **quiet quitting**. It maintains org-chart positions by graph depth (direct deps = C-suite, transitive = ICs) and writes a one-paragraph memo in dry corporate voice. The org chart re-renders as an SVG; the whole thing chains day-to-day so you can scrub the year.

## Technical approach
Node/TypeScript daemon (works on any ecosystem via pluggable lockfile parsers: `package-lock.json`, `Cargo.lock`, `poetry.lock`). Data model: append-only `events.ndjson` (the source of truth) + a derived `roster` snapshot per day. Graph: build the dep DAG, assign 'rank' by shortest path from root; layout via a d3-hierarchy or elkjs org-chart. CVE feed: OSV.dev batch query by (ecosystem, name, version). Freshness/maintenance signals from the registry's last-publish timestamp. Memos: one cached Claude API call per day fed the day's structured event list, temperature low, corporate-memo system prompt. The genuinely hard part is stable, non-flickering org-chart layout across a year of daily diffs — node positions must persist so an employee doesn't teleport when a sibling is added (constrained/incremental layout with position memory).

## v1 scope
- Parse one lockfile, diff vs prior snapshot, emit classified events to ndjson
- Six event types (hire/promote/layoff/defection/scandal/quiet-quit)
- Render today's org chart as SVG + a cached daily memo
- A `--annual-report` command that summarizes the ndjson

## Out of scope
- Real-time webhooks (a daily cron is fine)
- Multi-repo 'holding company' view
- Slack/email delivery

## Risks & unknowns
Most days nothing changes — needs a 'slow news day' memo path or it's dull. Event classification (fork = defection) is heuristic and may misfire. LLM voice could drift stale over 365 memos; may need rotating memo templates. Value only fully lands at year-end, so early testers see little.

## Done means
Pointed at a repo with 30 days of lockfile history (replayed), it produces a correct event log, a legible org chart for any chosen day, and a one-page annual report that names the year's top promotion, worst scandal, and headcount delta.

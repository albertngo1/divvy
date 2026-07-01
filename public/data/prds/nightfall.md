## Overview
Nightfall is a menubar app + web dashboard that models the health of a git repository as a *sanity meter*, borrowed wholesale from Don't Starve. It's for developers and small teams who let repos quietly decay and want a visceral, ambient signal instead of another sterile 'code quality' number.

## Problem
Repo rot is invisible until it hurts: a branch untouched for 90 days, a `// FIXME` from 2023, a PR that's been 'almost merged' for three weeks, a test suite that's been red so long nobody notices. Linters and CI badges show binary pass/fail; they don't convey *creeping dread*. You need something that makes decay feel like it's getting darker.

## How it works
Nightfall computes a single 0–100 sanity score from weighted decay signals. As sanity drops, the UI palette darkens from daylight to dusk to full night; below thresholds, cartoon 'shadow' gremlins appear and multiply, each tied to a specific offender (hover a gremlin → 'PR #212, open 24 days'). Fixing things (merging, deleting stale branches, greening tests) restores light and banishes gremlins with a satisfying poof. A small daily 'campfire' summary tells you what's encroaching.

## Technical approach
Stack: Tauri (Rust core + web UI) for the menubar app; TypeScript/Canvas for the day-night rendering. Data comes from the local git binary (via `git for-each-ref`, `git log`, reflog timestamps) plus the GitHub/GitLab REST API for PR/issue/CI state. Signals and weights: stale-branch age (exp decay), open-PR age, review-latency, red-CI duration, TODO/FIXME count and age (grep + blame timestamp), and commit cadence variance. Sanity = 100 − clamped weighted sum. The day-night gradient is a lerp over a hand-tuned palette; gremlins are a small particle/sprite system whose population = f(sanity). Hard part: making the score *stable and fair* across wildly different repo sizes and workflows — needs per-repo normalization so a busy monorepo isn't permanently at midnight.

## v1 scope
- Single local repo, single menubar icon that shows the sanity color
- Four signals only: stale branches, open-PR age, red-CI duration, TODO age
- Day/dusk/night palette + gremlin count (no per-gremlin drilldown yet)
- Manual refresh + hourly poll

## Out of scope
- Multi-repo org rollups
- Auto-fix actions (merge/delete from the app)
- Team leaderboards, historical charts

## Risks & unknowns
- Normalization: avoiding permanent-midnight for large active repos.
- Whimsy fatigue: gremlins could get annoying fast; needs a 'calm' mode.
- API rate limits for CI/PR polling on big repos.

## Done means
Pointed at a real repo, Nightfall shows a color that visibly shifts within one refresh after I merge a long-open PR or delete stale branches, and at least one gremlin appears when I introduce an old TODO and disappears when I remove it.

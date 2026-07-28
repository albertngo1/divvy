## Overview

**Fair Weather** is a macOS menubar toy that renders your project's dependency tree as a small animated sky. Not a security scanner, not a dashboard — an ambient instrument you glance at. Clear sky means your dependencies are being cared for. Overcast means several are drifting. A storm cell parked over one corner means a package you rely on has quietly gone unmaintained and you haven't noticed.

For solo devs and small teams who have a `package.json` they haven't thought about in eight months.

## Problem

Dependency tooling is entirely reactive and binary: a CVE fires, or nothing happens. But the actual failure mode is *gradual* — the maintainer got a new job, issues stopped getting closed, the last release was 14 months ago, the one contributor became zero contributors. By the time it's a CVE, it's an emergency; the weeks of visible drift beforehand went unwatched because nothing surfaces them.

Also, everything in this space is a red-badge nag. Nag-shaped tools get muted. An ambient one gets *glanced at*, which is a completely different relationship.

## How it works

A small sky occupies the menubar icon; clicking opens a panel showing the sky at full size with weather systems labeled by package.

Each dependency gets a **barometric pressure** score, computed from signals that indicate care rather than correctness:

- Days since last release, relative to that package's own historical release cadence (a package that ships yearly isn't late at 11 months; one that ships weekly is late at 8 weeks)
- Trend in the ratio of closed to opened issues over the last 90 days
- Bus factor: distinct commit authors in the last year, and whether that number is falling
- Median time-to-first-response on new issues, trending
- Archived flag, or the repo link 404ing — instant storm

Pressure maps to weather: rising pressure → clearing; falling → clouds thicken; a sharp sustained drop over a heavily-depended-upon package → a storm cell that *drifts across the sky over days*, so the change is legible as motion rather than as a notification. Direct dependencies render as near, large cloud masses; transitive ones as distant haze on the horizon, which correctly conveys "you have a lot of weather you can't see."

The mischief: the sky is genuinely pretty, so people leave it on, and then one Tuesday they notice a storm and go read an issue tracker they'd otherwise never have opened.

## Technical approach

Swift + SwiftUI menubar app (`MenuBarExtra`), with the sky rendered as a Metal fragment shader — layered value-noise clouds with domain warping, scrolling on a slow time uniform, cloud density driven by an aggregate pressure uniform and per-region weights.

**Ingest.** Parse `package-lock.json` / `pnpm-lock.yaml` / `Cargo.lock` / `uv.lock` for the resolved tree. For each package: registry metadata for release history (`registry.npmjs.org/<pkg>` gives the full `time` map free; crates.io and PyPI JSON APIs equivalently), then the GitHub GraphQL API for issue/commit/contributor signals — one batched query per ~50 repos to stay inside rate limits, using the user's own token.

**Data model.** SQLite: `packages(name, ecosystem, repo_url)`, `observations(package_id, observed_at, days_since_release, close_ratio, authors_90d, median_response_h)`, `pressure(package_id, observed_at, score)`. Keeping the observation history is what makes *trend* possible — the first week the app is useless, which is a real product problem worth naming.

**Scoring.** Each signal normalized against the package's own history (z-score against its trailing distribution), not against a global constant — this is the whole trick. A package with a 2-year cadence and a 2-year gap is at zero anomaly. Weighted sum → pressure in a barometer-like range, then exponentially smoothed so the sky doesn't flicker.

**The genuinely hard part** is not being wrong in a way that defames people. "This maintainer has abandoned you" is a social claim, and a stable, complete, finished library is indistinguishable from an abandoned one by every metric above. Mitigation: never use the word abandoned, express everything as pressure and weather, and let the user mark a package as *settled* — which pins it to clear skies permanently and feeds a local allowlist.

## v1 scope

- npm lockfiles only, direct dependencies only
- Two signals: days-since-release vs own cadence, and archived-flag
- Static (non-animated) sky in four states: clear, partly cloudy, overcast, storm
- Refresh on launch and every 12h; click opens a plain list sorted by pressure

## Out of scope

Other ecosystems, transitive deps, the Metal shader, drifting storm cells, notifications, CI integration, any hosted component, remediation or PR-opening.

## Risks & unknowns

GitHub API rate limits on a large transitive tree could make full coverage impractical without aggressive caching. Many packages have no resolvable repo, leaving permanent blank sky regions. The finished-vs-abandoned ambiguity may prove unsolvable enough that the tool is charming but not actionable — acceptable for a toy, fatal if it's pitched as a decision aid, so the framing has to stay honest. And ambient tools have a brutal retention cliff: if the sky is clear for three weeks, people quit before the first storm.

## Done means

Pointed at a real 8-month-stale project, the app surfaces at least one dependency the owner did not know had gone quiet, and produces zero storms over packages the owner considers healthy and finished. Sky state persists correctly across relaunch with no network.

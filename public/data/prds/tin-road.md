## Overview
Tin Road is a local devtool + toy for engineers with more than a couple of shipped projects. It ingests your lockfiles, builds a single trade-network map across all your repos, and lets you stage a Bronze-Age-style systemic collapse: yank one 'keystone' package and see the cascade of apps that stop working. It's a fragility audit that plays like an interactive history map.

## Problem
Everyone knows 'left-pad could break the world,' but nobody has a felt, personal sense of *their own* blast radius. `npm ls` is a wall of text; audit tools flag CVEs, not structural fragility. You can't see that a single obscure transitive dep silently underpins six of your side projects until it's gone.

## How it works
Point Tin Road at a folder of repos. It parses each `package-lock.json` / `pnpm-lock.yaml` / `requirements.txt` / `Cargo.lock` and merges them into one directed graph where your apps are 'city-states' and shared dependencies are 'trade routes.' Node size = how many of your apps transitively depend on it; edge thickness = version-pin fan-in. Click any dependency to 'sack' it: the map runs a reachability sweep and darkens every app that loses a required route, showing a casualty count and the shortest-path 'why' for each. A 'Sea Peoples' mode auto-ranks your most catastrophic single points of failure. Aesthetic: parchment War-Atlas cartography, collapse animated route-by-route.

## Technical approach
Stack: a Rust or Node CLI for parsing + graph build, output to a static HTML/SVG viewer (d3-force for layout, canvas for the collapse animation). Data model: a single DAG keyed by `name@resolved-version`, with app roots tagged. Keystone scoring = betweenness centrality plus 'monoculture' weight (unique maintainers, publish recency from the registry API, single-maintainer flag). Reachability-under-removal is a BFS from each app root over the graph minus the sacked node. The genuinely hard part is honest cross-ecosystem merging (npm vs pip vs cargo semantics) and distinguishing truly-required edges from optional/dev deps so the collapse isn't a lie.

## v1 scope
- npm/pnpm lockfiles only
- Merge N repos into one graph
- Betweenness-based keystone ranking, top 10 list
- Click-to-sack with darkened-app casualty count
- Static exported HTML artifact

## Out of scope
- pip/cargo/go parsers (v2)
- Live registry vuln feeds
- Auto-remediation / PRs
- Multiplayer

## Risks & unknowns
Betweenness may over-weight boring plumbing (React) that will never actually vanish; needs the monoculture/maintainer weighting to be interesting. Graph layout for 10k-node trees is a perf problem — may need clustering. 'Required vs optional' resolution is ecosystem-specific and fiddly.

## Done means
Run it on ≥3 of my real repos, get a ranked keystone list, click the #1 keystone and see a correct, verifiable list of exactly which apps break — cross-checked by actually deleting that dep in a scratch install.

## Overview
Upstream is a factory-automation puzzle game about the absurd plumbing of moving code between repositories. You lay conveyor belts, splitters, and mergers on an infinite canvas to route 'commit crates' from source repos to their destinations under throughput and correctness constraints. It's a toy built out of a very serious tool — Google's copybara and the whole monorepo-sync headache.

## Problem
Moving code between repos (vendoring, mirroring, upstreaming patches) is real, tedious infrastructure work that copybara exists to automate — and it's invisible and joyless. Meanwhile factory builders like Satisfactory make routing and throughput *fun*. Nobody has made the git-plumbing version, where branches and merges become spatial machines you can see jam and unjam.

## How it works
Each level gives you source repos (crate emitters), destination repos (sinks with a demand order), and machines: belts (move crates), splitters (branch — copy a crate down two paths), mergers (merge — combine two crates, but mismatched crates cause a conflict jam), and filters (path-glob gates that only pass matching files). You place machines on a grid to satisfy each destination's required commit stream at a target rate. Conflicts halt the belt with a red jam you resolve by rerouting or inserting a 'rebase' machine that reorders crates. Levels escalate: mirror one repo, then fan a shared library into three consumers, then a bidirectional sync without infinite loops.

## Technical approach
Stack: React + tldraw's infinite-canvas SDK for the board (belts/machines as custom shapes), with a deterministic tick-based simulation running the crate flow in a Web Worker. Data model: a directed graph of machine nodes with typed ports; crates are records {repo, path, hash, payloadType}. The sim advances crates one cell per tick along belts, applies node transforms (split = duplicate, merge = combine-or-conflict by comparing payload keys, filter = glob match via minimatch). Cycle detection flags infinite sync loops. Level-completion checks each sink's received sequence against a required multiset within a tick budget. Hard part: making merge-conflict semantics both game-legible and faithful enough that players accidentally learn why real repo sync loops and conflicts happen — plus performant rendering of hundreds of moving crates on the canvas.

## v1 scope
- tldraw board with belts, splitters, mergers as placeable shapes
- Tick sim moving crates, with visible jams on merge conflict
- 3 hand-authored levels (mirror, fan-out, filter-by-path)
- Win check against a per-sink required crate set

## Out of scope
- Real git integration (it's a metaphor, not a copybara frontend)
- Level editor, save/share, leaderboards
- Bidirectional-sync levels and rebase machines (later tiers)

## Risks & unknowns
- tldraw custom-shape performance with many animated crates
- Whether merge/conflict rules read as fun or as fiddly homework
- Difficulty curve authoring without a level editor

## Done means
A player completes the fan-out level by placing splitters and filters so all three destination repos receive their required crate sets within the tick budget, with at least one conflict jam surfaced and resolvable during play.

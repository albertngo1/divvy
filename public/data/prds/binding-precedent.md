## Overview
`precedent` is a small Go CLI that wraps `git rerere` and fixes its two fatal flaws: the cache is local-only, and it applies resolutions silently so nobody trusts it. For teams maintaining long-lived branches, vendor forks, or big refactors where the same merge conflict is re-resolved by five people across three weeks.

## Problem
One person spends 40 minutes untangling a gnarly conflict between `main` and a release branch. Tomorrow a teammate hits the identical hunk and redoes it from scratch — possibly differently, silently introducing a bug. `git rerere` solves exactly this and almost nobody enables it, because (a) `.git/rr-cache/` never leaves your laptop, so the knowledge dies with the machine, and (b) when it does fire it rewrites your working tree with no explanation, which feels like a haunted house. The daily papercut is redoing merge work someone already did.

## How it works
1. `precedent init` sets `rerere.enabled=false` (we drive it ourselves) and installs `post-merge` / `post-commit` hooks.
2. When you resolve a conflict, the hook captures the rerere preimage/postimage pair plus provenance: author, source and target refs, timestamp, and whether the next CI run on that commit passed.
3. `precedent push` writes the cache as an orphan tree under `refs/precedent/cache` and pushes it. `precedent pull` fetches and materializes it into `.git/rr-cache/`.
4. On your next conflicted merge, `precedent resolve` shows a per-hunk TUI: *"2 precedents match. Strongest: Priya, 2026-07-14, main→release-3, reused 6×, CI green."* You press `y`, `d` (show postimage diff), or `n`. Nothing is applied unattended.
5. `precedent log` renders the cache as a browsable list of resolutions — merge knowledge as a reviewable artifact.

## Technical approach
Go + `go-git` for ref plumbing, shelling out to `git` for merge/checkout. rerere's key is a SHA-1 over the whitespace-normalized conflict text, so exact matches are free — read `.git/rr-cache/<sha>/preimage|postimage` directly and keep a `provenance.json` sidecar keyed by the same SHA, stored as blobs in our ref.

The genuinely hard part is *near*-matches: rename a variable and the hash misses entirely. Second index — tokenize the `ours` and `theirs` blocks, build 5-gram shingles, MinHash (128 perms) into LSH bands, and surface candidates above Jaccard 0.7 as "similar (0.83)". Applying a near-match means synthesizing a diff from preimage→postimage and running `git apply -3`; failures degrade to showing the postimage for manual copy. Staleness: flag a precedent when the containing file's blob has changed more than 30% since capture.

## v1 scope
- `precedent push` / `pull` — sync `.git/rr-cache/` over `refs/precedent/cache`
- `precedent log` — list cached resolutions with author + date
- Exact-hash matching only, with a `y/n` prompt instead of silent apply

## Out of scope
MinHash fuzzy matching, CI-result provenance, GitHub App, conflict analytics dashboards, any GUI.

## Risks & unknowns
rerere's normalization is undocumented-ish and could change. Shared caches are a code-injection vector — a malicious precedent silently resolves in an attacker's favor, so approval must never be skippable and pushes should be signed. Teams may not hit the same conflict often enough to care.

## Done means
On a repo with a release branch, developer A resolves a conflict and runs `precedent push`; developer B clones fresh, runs `precedent pull`, hits the same merge, and is offered A's resolution with A's name on it — accepting it produces a byte-identical file to A's.

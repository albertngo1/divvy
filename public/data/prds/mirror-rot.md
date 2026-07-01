## Overview
Mirror Rot is a weekend CLI + cron daemon that watches the *copies* scattered through your projects — a vendored header, a snippet lifted from a gist, a config borrowed from another repo, an auto-updating resource list — and alerts you when a copy has drifted from the thing it was copied from. For anyone whose repos are quietly full of stale duplicates.

## Problem
Tools like copybara move code between repos and keep them in sync; auto-mirrored lists refresh every 15 minutes. But most of us don't have that machinery — we copy-paste and the copy silently rots. You patch a util in repo A and never propagate it to the three repos that copied it. The divergence is invisible until it bites. There's no lightweight "is my copy still the copy?" watcher.

## How it works
You register **links**: `local_path ⇐ upstream_ref`, where upstream is a URL, a raw gist, or another repo's file at a ref. Mirror Rot periodically fetches each upstream, normalizes both sides (strip whitespace/line-endings, optional comment stripping), hashes them, and compares. On drift it computes a diff and fires a notification. It distinguishes three states: **in sync**, **upstream moved** (you're behind — offer to pull), and **local moved** (you patched the copy — flag for upstreaming). A `mirror status` command shows the whole ledger; `mirror adopt <path> <url>` registers a new link and pins the current upstream hash as the baseline.

## Technical approach
Single Go or Node binary. Config: `mirrors.toml` listing links with a matcher (exact / normalized / regex-region for watching just a fenced block inside a larger file). Fetchers for `https`, `gist:`, and `git://repo@ref:path` (shallow fetch + `git show`). Normalization pipeline → SHA-256 → compare against stored baseline in a small SQLite state file. Diffs via a standard LCS/myers implementation. Notifications pluggable; default target is **ntfy** (Albert's instance at :8443) via a simple POST. Scheduling via launchd/cron. The genuinely hard part is **meaningful normalization + region tracking**: a copy is rarely byte-identical (reformatted, renamespaced), so you need per-link normalization rules and the ability to track a moving embedded region, otherwise every check is a false positive.

## v1 scope
- `mirrors.toml` with exact + normalized (whitespace) matchers
- `https` and raw-gist fetchers only
- `mirror check` one-shot: prints in-sync / drifted with a unified diff
- ntfy POST on drift; SQLite baseline store

## Out of scope
- Region-in-file tracking, git-ref fetcher, auto-pull/auto-PR
- GUI, multi-user, scheduling install helper

## Risks & unknowns
- False positives from formatting differences will kill trust — normalization is the whole game
- Upstream fetch flakiness / rate limits (gists, raw URLs)
- Scope creep toward being a bad copybara; must stay a *watcher*, not a syncer

## Done means
Register a link to a known-good raw URL, run `mirror check` → in sync; edit the local copy → next check reports "local moved" with a correct diff and fires exactly one ntfy notification; revert → back to in sync.

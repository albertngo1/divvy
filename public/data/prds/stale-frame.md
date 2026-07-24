## Overview
Stale Frame re-anchors stack frames from an old release onto your current tree. It's a CLI (free) plus a hosted GitHub App / error-tracker webhook (paid, per-repo) for teams whose deployed code lags their main branch: mobile shops, on-prem/enterprise installs, anyone with a monthly release train.

## Problem
A crash arrives tagged `release 2026.4.1`, frame `payments/charge.py:412`. On main, that file was renamed to `billing/charge.py`, and line 412 is now a blank line in a different function. Every single engineer does the same ritual: `git stash`, `git checkout <sha>`, read the code, `git log -S` to hunt where it went, checkout back. Five minutes, several times per incident, at 2am, and the highest-value fact — *this line was already changed after that release* — is the one nobody checks because checking it is tedious.

## How it works
Input: a pasted traceback, or a Sentry/Rollbar/Datadog webhook. The release SHA comes from the event's release tag (or a `.staleframe.yml` mapping release string → SHA). For each frame, Stale Frame runs the plumbing everybody forgets exists:

`git blame --reverse -C -M --ignore-revs-file .git-blame-ignore-revs <releaseSHA>..HEAD -L n,n -- path`

Reverse blame walks a line *forward* in history and reports either the commit where it currently survives, or the commit that deleted it. From that, each frame gets rendered as:

- **Moved** → `billing/charge.py:388` (clickable), plus the rename chain
- **Modified since release** → the diff hunk, the PR that changed it, the author. Banner: *"this frame's code changed in #4821 after the release you're debugging — check whether main already fixes this."*
- **Deleted** → the commit that removed it and its message
- **Unchanged** → say so, cheaply, so you stop wondering

The CLI prints a table of `file:line` your terminal will linkify. The GitHub App posts one comment on the incident issue with the same table, so the on-call person never opens a checkout.

## Technical approach
Go CLI over `git` subprocess first (libgit2 later — libgit2 has no reverse-blame, so subprocess is not a shortcut, it's the design). Trace parsers per runtime: CPython traceback, JVM, V8/Node, Go panic, Ruby, ObjC/Swift symbolicated crash. Hosted side keeps a bare mirror clone per repo, refreshed on push webhook; reverse blame runs in a sandboxed worker with a per-frame timeout.

Hard parts, in order: (1) reverse blame is O(commits since release) per line and gets expensive on a 200k-commit monorepo — mitigate with a per-(repo,sha,path,line) result cache keyed on HEAD, since incidents cluster on the same frames; (2) a repo-wide reformat (prettier, gofmt bump) makes reverse blame attribute everything to that one commit — hence mandatory `.git-blame-ignore-revs` support and a **confidence score** that drops when the resolving commit touched >500 files; (3) bundled/minified JS needs sourcemap resolution *before* blame, so v1 punts on it.

Pricing: free CLI, $ per repo/month for the App. The wedge is mobile, where a crash from a 3-month-old app version is normal and the manual ritual is worst.

## v1 scope
- CLI only, local repo, Python tracebacks only
- Read release SHA from a flag, not a config file
- Emit `path:line`, status (moved/modified/deleted/unchanged), and one-line commit summary
- No cache, no server, no webhook

## Out of scope
Sourcemaps, symbolication, suggesting fixes with an LLM, Sentry marketplace listing, non-git VCS.

## Risks & unknowns
Big refactors defeat line-level tracking, and a confidently wrong answer is worse than none — the confidence score has to be believable or people stop trusting it. Sentry could ship this as a feature in a quarter. Teams that deploy from main hourly have no pain here at all, so the market is narrower than it first looks.

## Done means
On a repo where a file was renamed and reformatted since release X, running `staleframe --release X < traceback.txt` prints the current path and line for every frame, correctly flags the one frame whose code was modified after X, and matches what a human gets by hand — verified against 20 real tracebacks from a repo you know.

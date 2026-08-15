## Overview
A tiny CLI + hook pair that turns `git rerere` from a private, invisible cache into a shared, attributed team artifact. For any team with a long-lived branch, a big rename/migration, or a release branch that gets cherry-picked forward, `solved-once` means a conflict resolved by one person is auto-applied for everyone else — with a line saying who solved it and where.

## Problem
`git rerere` is off by default, stores its database in `.git/rr-cache` (never pushed), and silently auto-resolves with no provenance. So on a 400-file codemod rebase, five engineers each hand-resolve the *same* `import` hunk, and each one has an independent chance of getting it wrong. Reviewers can't tell an auto-resolution from a human one. The papercut is daily during any migration week and completely invisible the rest of the time.

## How it works
1. `solved-once init` enables `rerere.enabled`, `rerere.autoUpdate`, and installs a `post-merge` + `post-rewrite` hook.
2. Every time you finish a resolution, the hook harvests new entries from `.git/rr-cache` and writes them as blobs under a synthetic ref, `refs/solved-once/cache`, along with a JSON sidecar: author, timestamp, originating branch, the pre-image hash, and a normalized fingerprint.
3. `solved-once push` / `pull` moves that ref like any other ref (no server support needed — refspec `refs/solved-once/*`).
4. On your next conflicted rebase, the hook rehydrates matching pre-images into your local `rr-cache` *before* git looks, so git resolves them itself. Anything auto-applied gets a note printed: `3 hunks resolved from Dana (PR #412, 2d ago)` and a `.solved-once/applied.json` you can render in review.
5. `solved-once explain <file>` shows, per resolved hunk, who solved it and the diff between their post-image and your working tree.

## Technical approach
Go or Rust single binary, no daemon. Core is reimplementing git's rerere pre-image normalization (strip conflict markers, collapse whitespace runs, canonicalize hunk ordering) so we can compute a *second*, looser fingerprint alongside git's strict SHA-1: git's ID is context-sensitive, so a hunk that differs only in surrounding blank lines misses. The loose key is a SimHash over the normalized conflicted region's token stream; on a strict-hash miss we look for loose-key neighbors within a Hamming radius and offer them as `solved-once suggest` (never auto-apply — that's the safety line). Storage is content-addressed blobs in the repo's own object DB, so `git gc` and existing hosting just work; the ref is a tree of `<preimage-sha>/{preimage,postimage,meta.json}`. Hard part: making loose matching precise enough that suggestions are trusted, and refusing to auto-apply anything whose post-image touches lines outside the conflict region.

## v1 scope
- `init`, `push`, `pull`, and the post-merge hook
- Strict-hash sharing only (exact git rerere parity, just shared + attributed)
- Printed attribution line after each auto-resolution
- Works on one repo, manual push/pull

## Out of scope
- Loose/SimHash suggestions (v2)
- CI integration, server-side hooks, GitHub App
- Cross-repo or cross-fork sharing

## Risks & unknowns
- Sharing resolutions can propagate a *wrong* resolution at team scale; needs a fast `solved-once revoke <sha>` and a per-entry trust list.
- Teams may see the shared ref as a security/review-bypass surface; auto-applied hunks must be loud in the diff.
- rerere's pre-image format is stable in practice but undocumented; pin to a tested git version range.

## Done means
Two clones of the same repo: engineer A rebases a branch, resolves 5 conflicts, runs `push`. Engineer B runs `pull`, rebases the same branch, and finishes with zero manual resolutions and a printout naming A for all 5.

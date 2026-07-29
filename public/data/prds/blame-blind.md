## Overview

`git blind` is a drop-in replacement for `git blame` that follows *code*, not *lines*. You point it at a function or a line, and it walks history tracking the syntactic construct — through prettier runs, through a rename, through the day someone split the file in two, through the tab-to-space migration. It's for anyone who has ever run `git blame`, seen every line attributed to "chore: apply new formatter", and given up.

## Problem

`git blame` is a byte-diff tool wearing an archaeology costume. Its unit is the line, and lines are destroyed constantly by things that aren't semantic changes: formatters, linters with `--fix`, import sorters, license-header bumps, codemods, and IDE auto-format-on-save. `-w` and `-C` and `.git-blame-ignore-revs` are partial patches over a fundamental mismatch. The daily papercut is precise: you want the commit that made this code *mean* what it means, and you get the commit that made it *look* like it looks. Every engineer works around this by hand — repeatedly running blame on the parent commit, one hop at a time, sometimes six or seven times, to escape a formatting wall.

## How it works

```
$ git blind src/auth/session.ts:142

  validateRefreshToken() — introduced 2y ago

  a3f9c21  2023-04-11  jz     initial impl, 22 lines
  ↓ (moved: src/session.ts → src/auth/session.ts)
  7b1e044  2023-11-02  —      FORMAT ONLY (prettier 3.0) [skipped]
  ↓
  c0d8812  2024-06-19  mira   added clock-skew tolerance   ← the line you asked about
  ↓
  91aab30  2025-02-03  —      RENAME ONLY (token→refreshToken) [skipped]

  verdict: c0d8812, mira, 2024-06-19
```

The key move is classifying every commit that touched your construct into **semantic** vs **cosmetic**, and reporting the last semantic one — while still showing you the cosmetic hops so you can audit the reasoning.

## Technical approach

Rust CLI, `gix` for repo access (fast, no libgit2 fork/exec overhead), `tree-sitter` for parsing with grammars for TS/JS/Python/Go/Rust in v1.

Core algorithm, per history hop:

1. Parse the file at commit N into a tree-sitter CST. Find the smallest named node spanning the target line — that's the **anchor**.
2. Compute a **structural fingerprint** of the anchor: a Merkle hash over the node's subtree, where each node contributes its *kind* plus, for identifiers/literals, a normalized token — but **whitespace, comments, punctuation, and trivia contribute nothing**. Two formattings of the same code hash identically. Store also a weaker "shape hash" that additionally erases identifier names, to survive renames.
3. Diff against commit N−1: parse the parent's version of the file (or files, if `--find-copies-harder` style rename detection fires). If the anchor's exact fingerprint exists in the parent → the commit was cosmetic for this node, hop through it, recording *why* (whitespace-only / comment-only / no structural delta).
4. If the exact fingerprint is absent but the shape hash matches at some node with high subtree similarity → a rename or signature change; hop, annotated.
5. Otherwise the commit is semantic. Descend into it: run a tree-diff (Zhang–Shasha edit distance, capped, or the cheaper GumTree top-down/bottom-up matching heuristic) to attribute *which* sub-node changed, so a one-arg addition inside a 40-line function is attributed to that argument, not the whole function.

File-move detection reuses git's own rename similarity index, but falls back to fingerprint search across the whole tree at that commit when git's 50% threshold misses (common when a file is split).

**Hard part:** cost control. Naive tree-diff per commit per file over a 100k-commit repo is hopeless. The mitigation is that step 2's fingerprint comparison is O(1) after parse, so the expensive tree-diff only runs on the handful of genuinely semantic commits — but you still pay a parse per hop. Solution: a content-addressed sled/redb cache keyed by `(blob_oid, grammar_version)` storing the fingerprint set for that blob, so re-blaming a file is near-instant and CI can warm the cache.

## v1 scope

- One language: TypeScript.
- `git blind <file>:<line>` only — no whole-file blame view.
- Linear first-parent history only; merges are followed down the first parent, no octopus handling.
- Cosmetic classification limited to: whitespace-only, comment-only, identical fingerprint.
- Plain stdout, no color, no pager, no editor plugin.

## Out of scope

- A blame *gutter* for editors (the obvious v2, and the reason to keep the core a library).
- Cross-language, cross-repo, or vendored-code following.
- Attribution of *deleted* code.
- Any web UI.

## Risks & unknowns

- Tree-sitter error recovery on historical commits that don't parse (partial files, broken syntax mid-refactor) — need a graceful degrade to line-based blame for that hop rather than a hard failure.
- Grammar version drift changes fingerprints, invalidating the whole cache. Must be in the cache key, and that means grammar upgrades are expensive.
- The judgment call "is a rename semantic?" is genuinely ambiguous. A rename from `x` to `userId` *is* information. Default: report renames as a distinct third class, neither skipped nor terminal, and let a flag decide.
- Performance on a file with 3,000 commits of history is the make-or-break demo.

## Done means

On a real repo with a known prettier-migration commit, `git blind` on a line inside a function that was (a) reformatted, (b) moved to a new file, and (c) had one argument added, reports the argument-adding commit and author — while `git blame` on the same line reports the prettier migration. Runs in under 3 seconds cold on a file with 500 commits of history, under 300ms warm.

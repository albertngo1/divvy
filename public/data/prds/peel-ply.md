## Overview
Peel Ply is a CLI + git filter that gives you a *sacrificial layer* of code. You write print statements, timing probes, fake auth bypasses, hardcoded fixtures — mark them, and they live in your working tree exactly like normal code, but they are structurally incapable of reaching a commit. `peel off` strips them; `peel on` lays them back down, even after the file has been rewritten around them. For anyone who has ever shipped a `console.log('HEREEEE')` to production.

## Problem
Every debugging session accretes junk: log lines, `sleep(5)`, a commented-out early return, a locally-pinned dep. Today you have three bad options — commit it and clean up later (you won't), keep it unstaged and fight `git stash` every time you switch branches, or delete it and retype it tomorrow. The killer case is the *long* investigation: you rebase onto main, and your instrumentation is gone or conflicting. So people under-instrument, which is the actual cost.

## How it works
Mark a hunk inline:
```js
//:peel
console.time('render'); 
//:/peel
```
or mark a whole file with `peel add src/scratch.ts`. Then:
- `git commit` — a **clean filter** removes every peel hunk from what gets staged. Your working tree is untouched; the commit is pristine. `git diff` and code review never see it.
- `peel off` — removes the layer from the working tree too, recording it in `refs/peel/<branch>` as a patch plus the exact blob hashes it was cut from.
- `peel on` — re-applies. Because the recorded patch carries its original base blob, re-application is a real three-way merge (`git apply -3`), not fuzzy line matching, so it survives rebases, reformatting, and moved functions.
- `peel ls` shows every live probe across the repo, so you never lose track of the `if (true) return` you left in an auth check.

## Technical approach
Rust or Go, single static binary. Registers `filter.peel.clean` in `.gitattributes` (`* filter=peel`) — critical detail: clean filters run on staging, so the strip is enforced by git itself, not by a hook you can `--no-verify` past. A `pre-commit` hook is the belt-and-suspenders check.

Storage: the peel layer is a dangling commit under `refs/peel/<branch>` whose tree is the *dirty* version of touched files. `peel on/off` is then `git merge-file` between (clean HEAD file, recorded dirty file, current working file). This reuses git's merge machinery instead of inventing patch re-anchoring — that's the trick that makes it survive rebases.

Comment-syntax detection per language via a small table plus `hyperpolyglot`-style extension mapping; unknown languages fall back to whole-file marking.

The genuinely hard part: clean filters are content-only (no path context in older git), and a badly-written filter can silently corrupt a commit. Mitigation: the filter is a pure function with property tests asserting `clean(dirty) == clean(clean(dirty))` and `clean(x) == x` when no markers exist, plus a `peel doctor` that round-trips the whole repo and diffs.

## v1 scope
- `//:peel` / `//:/peel` line markers, `#` and `//` comment styles only
- clean filter + pre-commit backstop
- `peel off`, `peel on`, `peel ls`
- one branch's layer at a time

## Out of scope
- Editor extensions and gutter decorations
- Sharing peel layers between machines or teammates
- Language-server-aware hunk boundaries
- Binary/notebook files

## Risks & unknowns
- Filters slow down `git status` on huge repos; needs benchmarking at 50k files.
- Merge conflicts inside a peel layer need a sane UI (probably: dump `.rej`, tell the user, keep the layer).
- Cultural risk: people already have muscle memory for stashing.

## Done means
On a real repo: add three probes across two files, run `git commit`, confirm `git show` contains none of them; `git rebase main` over 40 upstream commits that reformatted one of the files; run `peel on` and get all three probes back in the correct positions with zero manual fixups.

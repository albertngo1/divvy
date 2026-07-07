## Overview
Overburden is a browser-based devtool that turns `git bisect` into a side-view mining game. You point it at a repo and a failing check; it renders your commit history as vertical rock strata and lets you 'dig' toward the seam where the bug was introduced. For developers who find bisect powerful but fiddly and unmotivating.

## Problem
`git bisect` is one of the best debugging tools nobody uses. The mental model (binary search over history) is abstract, the CLI ceremony (`good`/`bad`/`reset`) is error-prone, and long-running builds make the loop feel like tedious punishment rather than progress. People manually `git checkout` around instead, or just give up and read diffs.

## How it works
The suspect commit range (last known-good → known-bad) renders as a stack of geological layers, deepest = oldest. The engine picks the midpoint commit; the game 'excavates' to that layer and runs your test command. Pass = the seam is below (dig deeper); fail = above (the bug is younger). Each probe halves the remaining rock, visualized as your pickaxe biting through strata with a shrinking 'unexplored' band. Strike the culprit and it lights up as an ore vein with the diff, author, and blame. Skip un-buildable commits like hitting bedrock (maps to `git bisect skip`).

## Technical approach
Local Node CLI (`npx overburden`) that shells out to git and serves a Vite/canvas frontend over localhost. Backend wraps `git bisect start/good/bad/skip` (or reimplements the binary search directly over `git rev-list good..bad` for cleaner state control). It runs the user's `--test 'npm test'` command per probe in a child process, capturing exit code, duration, and stdout tail. Data model: an ordered array of commit SHAs with `status: unknown|good|bad|skipped`, plus a pointer to the current probe. Canvas layer renders strata heights proportional to commit density per day so busy periods look thicker. The genuinely hard part is honest UX around slow/failing builds — caching probe results, letting you interleave manual verdicts when a test is flaky, and handling merge commits / non-linear history without lying about the binary-search invariant.

## v1 scope
- CLI that takes `--good`, `--bad`, `--test`
- Canvas strata view with one animated pickaxe probe at a time
- Real test execution per probe, exit-code verdict
- 'Ore vein' reveal screen: culprit diff + blame + shareable PNG

## Out of scope
- Multiplayer / leaderboards
- Non-git VCS
- Parallel probing across worktrees
- Auto-classifying flaky tests

## Risks & unknowns
- Slow test suites make even a fun loop drag — need a 'manual verdict' fast path
- Non-linear history can confuse both bisect and the strata metaphor
- Is it a toy or a tool? Must stay genuinely faster than raw bisect, not just prettier

## Done means
On a repo with a known regression, running `npx overburden --good v1.2 --bad HEAD --test 'npm test'` finds the offending commit in the same number of probes as `git bisect`, shows its diff, and exports a shareable result card.

## Overview
Peephole is a daily browser puzzle for programmers: given a target output — a 64×64 image, or a 2-second looping animation — write the shortest program in a tiny functional DSL that reproduces it. Named for peephole optimization; the whole game is squeezing the program smaller. For people who love code golf, Zachtronics, and the superoptimizer 'what is the smallest program' rabbit hole.

## Problem
Code golf sites exist but are sprawling, text-diff scored, and intimidating. There's no bite-sized daily with a *visual* target where 'smaller' is objectively better and instantly gratifying. The Lobsters superoptimizer post and the 'fog: motion via function composition' paper both point at the same joy: a beautiful output falling out of a startlingly short expression.

## How it works
You're shown the target and a code pane. You build the output by composing pure functions over pixel coordinates: `mul`, `sin`, `hypot`, `xor`, `thresh`, `grad`, `fold`, etc. — a stack of ~30 primitives. Hit run, see your render diff against the target. Two thresholds: **exact** (pixel-perfect, unlocks the golf leaderboard) and **close-enough** (>0.9 similarity, unlocks the share). Your byte count is your score; a global daily board ranks by fewest bytes, with a hidden par. Wordle-style emoji share ('Peephole #212 — 47 bytes 🟩'). Solutions reveal at next puzzle.

## Technical approach
Pure client-side. The DSL is a small S-expression language parsed to an AST and evaluated per-pixel in a Web Worker (or compiled to a GLSL fragment shader for the animation puzzles). Scoring: SSIM/MS-SSIM between render and target for close-enough; exact-match hash for the golf tier. Byte count = trimmed source length. Daily puzzle is a date-seeded pick from an authored bank, each stored as its own reference program so par is exact and the target is reproducible. Leaderboard: a tiny serverless function (Cloudflare Worker + KV) storing `{date, name, bytes, program_hash}`; validate submissions server-side by re-running the DSL in a sandboxed interpreter so byte counts can't be faked. Hard part: designing a primitive set expressive enough for gorgeous targets yet small enough that clever golf beats brute force.

## v1 scope
- Static 64×64 image puzzles only (no animation)
- ~20 primitives, worker-based CPU eval
- Exact + close-enough thresholds, byte score, share string
- Local leaderboard (server board later)

## Out of scope
- Animated / shader puzzles
- User-submitted puzzles
- Accounts, streaks

## Risks & unknowns
- Is the skill floor too high for a 'daily'? Needs a tutorial ramp.
- Anti-cheat on the leaderboard (server re-eval mitigates)
- Keeping the primitive set fun, not fiddly

## Done means
Seven consecutive daily puzzles are solvable pixel-perfect in under 80 bytes by the author, a wrong program shows a visible diff, and the share string round-trips a verified byte count that a second player can beat.

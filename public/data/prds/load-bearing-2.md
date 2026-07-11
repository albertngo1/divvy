## Overview
Load-Bearing is a terminal roguelike played against a real Git repository — yours. Where the trending 'build X from scratch' repos teach by construction, this teaches by *destruction*: each run, you descend through your codebase trying to demolish the most code without breaking a single test. The largest safe rubble pile is the treasure. It's a genuinely useful dead-code finder wearing a roguelike's clothes.

## Problem
Dead code accumulates silently; nobody enjoys hunting it. Coverage tools point vaguely; delta-debuggers are academic and unfun. Meanwhile developers happily grind roguelikes for hours. Load-Bearing turns 'is this function load-bearing?' into a bet you actually want to make.

## How it works
On `start`, the tool snapshots HEAD and builds a menu of 'demolition candidates' — whole functions/methods/exports parsed from the AST. Each candidate shows a wager: its line count (the loot) and a hidden risk. You pick a demolition order — this is your run. The engine deletes the first candidate, runs the (fast, filtered) test suite: green = you keep the loot and descend; red = you take damage. Three failed 'floors' and the run ends; your score is total lines safely removed. A greedy solver runs in the background as the leaderboard rival ('the Dungeon' cleared 412 lines — can you beat it?). At the end it offers a real branch containing exactly the safe deletions, so your play session ships a dead-code-removal PR.

## Technical approach
Stack: Rust or Node CLI with a TUI (ratatui / Ink). Candidate extraction via tree-sitter (language-agnostic, start with JS/TS + Python). Test oracle is the project's own runner, invoked with coverage-scoped test selection so each deletion re-runs only the tests that touched those lines (parse a prior coverage map — LCOV / `coverage.py`). Deletions are applied as reversible patches on a scratch worktree so the real tree is never dirtied. The greedy AI rival is delta-debugging (ddmin) over the candidate set. Hard part: making the test loop fast enough to feel like a game — aggressive test selection, warm interpreter/daemon, and caching which candidates are mutually dependent (deleting A breaks B) so the graph prunes as you play.

## v1 scope
- One language (TS or Python), function-level candidates only
- Scratch-worktree deletion + full-suite (not yet scoped) test run
- Score = safe lines removed; export a branch of the safe set

## Out of scope
- Multi-language, coverage-scoped fast selection, persistent meta-progression, network leaderboard

## Risks & unknowns
- Slow test suites make it unplayable — selection is the make-or-break
- Tests with poor coverage will green-light deletions that are actually live (false 'safe')
- Cross-function deletion dependencies can explode combinatorially

## Done means
Run it on a repo with a known dead function and a known load-bearing one; the game lets you safely delete the former (loot banked), damages you on the latter, and the exported branch removes exactly the dead code with the suite still green.

## Overview

Changelog Roguelike is a browser dungeon crawler where each floor is procedurally generated from one real commit in an open-source project's git history. Descending the dungeon means walking the project's timeline: the commit message is the floor's flavor text, bug-fix commits spawn the bugs you fight, big refactors are boss floors, and reaching the HEAD commit means you've cleared the whole repo. Procedural generation with *meaning* instead of noise.

## Problem

Roguelikes generate floors from noise seeds — statistically varied but semantically empty. Meanwhile every serious repo carries a dramatic, legible history (frantic bug-fix streaks, giant refactors, quiet maintenance, the big rewrite) that never gets *played*. Nobody has turned a changelog into a dungeon you descend. The artifact — a shareable "I beat React's history" run — doesn't exist.

## How it works

Point the game at a repo. Fetch its commit list, newest→oldest, and reverse so floor 1 = first commit. Deterministically hash each commit SHA into a seed, then map commit statistics to level parameters: files changed → floor area; lines added/removed → room count and loot; number of touched files → corridor branching. Heuristics on the message and diff pick a floor archetype — `fix`/`bug` spawns "bug" enemies, `refactor`/`rewrite`/large diffs become boss floors, `docs`/`chore` become calm short floors. Stairs down = advance one commit.

## Technical approach — specific & technical

Stack: static site, Vite + TypeScript, Canvas 2D tile renderer (or `rot.js` for grid, FOV, and dungeon-gen primitives). No backend for v1 — commits fetched client-side or prebaked to JSON.

Data sources by name:
- **GitHub REST API** — `GET /repos/{owner}/{repo}/commits` (paginated) for SHA, message, author, date; `GET /repos/{owner}/{repo}/commits/{sha}` for per-commit `stats.additions/deletions/total` and `files[]`. Auth with a PAT for 5000 req/hr; cache aggressively.
- Optional: **isomorphic-git** to clone/read history fully client-side without API limits.
- **seedrandom** for deterministic PRNG seeded from the commit SHA, so a given commit always yields the same floor.

Data model: `floors[{sha, message, author, date, additions, deletions, files_changed, archetype, seed}]`. Generation is a pure function `generateFloor(seed, stats) -> {tiles, enemies, stairs, items}` so floors are reproducible and testable. Enemy count = `clamp(round(sqrt(total_changes)), 1, N)`.

Key algorithm: the commit→floor mapping and the deterministic dungeon generator (BSP or drunkard's-walk room carving seeded by SHA). The hard part is making the mapping *feel* meaningful rather than arbitrary — a huge refactor must visibly play differently from a one-line typo fix — which needs iterating the archetype heuristics against a repo whose history you know well.

## v1 scope (humiliatingly small)

- One hardcoded public repo via the commits API.
- Map files-changed / +/- lines → floor size + enemy count.
- Minimal tile renderer, WASD movement, one enemy type, melee attack, stairs-down.
- Descend three floors from three real commits; commit message shown as floor flavor text.

## Out of scope (for now)

- Arbitrary user-supplied repos with rate-limit handling.
- Items, inventory, character progression, combat depth, multiple enemy types.
- Boss mechanics beyond "bigger floor, more enemies."
- Merge-commit / branch-topology awareness (linearize history for now).

## Risks & unknowns

Prior-art verdict: **Fresh** — git-driven procedural levels aren't a known genre. Risks: GitHub rate limits when fetching per-commit stats for long histories (mitigate: prebake a repo's floor JSON at build time); the mapping may feel random (validate on a familiar repo, tune heuristics); a boring maintenance repo makes a boring dungeon (curate the demo repo). Full playability (fun combat) is out of scope — v1 proves the *generation*, not the game feel.

## Done means

Loading the game with a hardcoded repo lets you play three tile-based floors generated from three real, sequential commits; each floor shows its commit message as flavor text and its size/enemy count visibly reflects that commit's diff stats; the same commit always regenerates the identical floor.

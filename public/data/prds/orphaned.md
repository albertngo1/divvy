## Overview
A single-player, turn-based tycoon/triage game about being the maintenance layer of the free software world. You play a small volunteer team inside a distro. The board is a real package dependency graph seeded from live Debian data; the stakes are real install counts. For anyone who has read "this package is now orphaned" and felt something.

## Problem
Every few weeks a post goes viral about a critical library with one unpaid maintainer, a dead upstream, a governance blowup, or a distro quietly dropping adoption of user packages. Everyone nods, nobody has a felt sense of the arithmetic: what it actually costs to keep 40,000 packages breathing, and what breaks downstream when one hand lets go. Sims teach that arithmetic better than essays. There are farm tycoons and city builders; there is no game about *stewardship of infrastructure you didn't write*.

## How it works
One turn = one week. You have a pool of maintainer-hours (small; it grows only by recruiting, and recruits burn out). Each turn the world moves: upstreams go quiet, a toolchain bump causes a wave of FTBFS across everything that uses a given build system, CVEs land, RC bugs accumulate before a freeze. Packages have a rot meter; rot spreads *upward* through reverse-dependencies, so a rotting compression library eventually browns out half the graph. Your verbs are the real ones: **adopt**, **NMU** (fast, cheap, annoys the maintainer, costs goodwill), **salvage**, **orphan**, **remove from testing** (amputate now to save the freeze). Score is users-served-weeks, popcon-weighted, and the end-of-run screen is a treemap of everything you let die with the install count on each tile. Runs are short (52 turns) and seeded, so a seed string is shareable.

## Technical approach
Data: `Sources.xz`/`Packages.xz` from deb.debian.org for the dependency edges, popcon.debian.org `by_inst` for per-package install counts (the entire emotional payload of the game is that column being real), UDD/WNPP for which packages are genuinely orphaned today (they start the run already rotting), and the security-tracker JSON for real CVE frequency per source package to tune the hazard rates. An offline Python build step takes the top ~3000 packages by popcon plus their dependency closure, prunes to a playable ~4000-node DAG, and emits a ~2 MB packed binary (typed arrays: CSR adjacency, popcon, build-system tag, upstream-activity class). Game runs fully client-side: TypeScript + a seeded PRNG (xoshiro128\*\*, seed in the URL — determinism matters because the whole point is comparing decisions on identical worlds). Rot propagation is a weighted BFS over reverse-deps each turn — cheap at this size. Rendering is the hard part: 4000 nodes as a force graph is a hairball, so v1 uses a squarified treemap grouped by section, with a focus-lens showing the local rev-dep neighbourhood when you select a package.

## v1 scope
- 400 packages, one section (`main`, no contrib/non-free)
- Three verbs only: adopt, NMU, orphan
- One event type: upstream death
- Treemap view, no graph view
- 20 turns, one score number, seed in URL

## Out of scope
Multiple distros, forks/governance drama, hiring/burnout economics, real-time updates from live archives.

## Risks & unknowns
Fun is not guaranteed — triage can feel like a spreadsheet. Needs at least one legible "oh no" cascade in the first three turns. Popcon is a self-selected sample and undercounts servers; must be labelled as such. Package data snapshots need a licence/attribution note.

## Done means
A fresh player runs 20 turns without reading docs, loses at least one package with a >50k popcon count, and can send a friend a seed URL that reproduces the identical world.

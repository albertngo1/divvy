## Overview
Blame War is a repo-retrospective toy for teams and solo devs who want a fun, honest look at where a codebase has been fought over. Inspired by War Atlas's 'cartography of every named war,' it renders a repository's history as a map of campaigns: territories (files/dirs), belligerents (authors), and battles (conflicts, reverts, thrashing edits).

## Problem
Code archaeology is dry. `git log --stat` and blame heatmaps tell you *who* and *when* but not the *drama* — which files are perennial battlegrounds, whose changes keep getting reverted, where two authors ping-pong the same 20 lines. There's no shareable, human retrospective that makes a codebase's conflict history legible (or funny).

## How it works
Point it at a repo. It builds a territory map: each file/dir is a region sized by churn. It scans history for 'battles' — merge commits with conflict markers resolved, revert/reapply pairs, and hotspot lines edited by ≥2 authors within a short window. Each battle gets a card: combatants, the contested lines, the commit-message 'casus belli,' and an outcome (whose version survived to HEAD). A timeline scrubber animates territory changing hands by author color over the project's life. Every named war gets an auto-generated title ('The auth.ts Schism, Mar 2024').

## Technical approach
Stack: a Node/TS CLI shelling out to git (or libgit2 via `nodegit`), emitting a static HTML/SVG artifact (d3 for the treemap-territory + timeline). Data sources: `git log --follow --numstat`, `git log --merges`, and `git blame --line-porcelain` sampled at HEAD and at battle commits. Battle detection: revert pairs via `git revert` message patterns + diff inversion matching; thrash detection via a per-line authorship sliding window (line ownership flipping author ≥3 times). Territory coloring = current-line-majority author per file. Hard part: reliable revert/reapply matching across squashes and rebases, and keeping line-history tractable on large repos (cap to top-churn files).

## v1 scope
- Treemap of files sized by churn, colored by dominant author
- Revert-pair 'battle' detection with cards
- Timeline scrubber for the last N commits
- Static exported HTML

## Out of scope
- Multi-repo empires
- PR/review-comment data
- Real-time watching
- Blame accuracy across heavy rebase rewrites

## Risks & unknowns
Squash-merge workflows destroy the granular conflict signal — may look boring on modern repos. 'Battle' heuristics risk false drama. Line-level blame is slow; needs sampling.

## Done means
Run on a repo I know well, and the top-3 auto-named 'battles' match files I actually remember fighting over, with correct combatants and the surviving version identified.

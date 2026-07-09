## Overview
Rubber Stamp is a browser idle/tycoon game for developers who've felt the specific dread of a review queue that never empties. It inverts the premise of tools like Orca and paperclip ("manage a fleet of parallel agents at work"): here the agents are managing *you*. You are the last human in the loop, and the loop is drowning.

## Problem
The feeds are giddy about fleets of autonomous coding agents. Nobody's making a game about the actual bottleneck those fleets create: a human who has to approve their output. The HN "LLM burnout" post is the emotional core — the queue is infinite, the quality is plausible-but-suspect, and skimming feels productive right up until it isn't.

## How it works
A vertical column of PR cards streams upward. Each card has a title, a diff-size number, and a hidden `bugginess` value. Three actions: **Review** (spend attention, reveals true bugginess, slow), **Approve** (instant, gambles), **Reject** (frees a slot, angers the agent's "velocity" stat). Approving buggy PRs raises a **Tech Debt** meter; when it fills, production incidents spawn extra emergency PRs, accelerating the flood. Idle progression: you buy upgrades — linters that pre-filter, junior humans who auto-review small diffs, a "trust score" per agent that lets you safely rubber-stamp its work... until it silently regresses. The tension is the burnout meter: every manual Review costs a shared attention pool that regenerates slowly. Prestige = quit, rehire, start with better tooling and a cynicism multiplier.

## Technical approach
Pure client-side, no backend. Svelte or vanilla TS + a fixed-timestep game loop (requestAnimationFrame accumulator). State is a plain reducer store persisted to localStorage; offline progress computed from `Date.now()` delta on load. PR text is generated from a Markov/template mixer over a corpus of real commit-message verbs + fake filenames so cards feel plausible. Numbers tuned as an exponential economy (cost = base·1.15^n). The genuinely hard part is the *feel*: tuning the attention/tech-debt/velocity three-body problem so that both over-reviewing and over-approving are losing strategies, forcing a knife-edge. A seeded RNG makes agent regressions feel like betrayal, not noise.

## v1 scope
- One PR stream, three actions, three meters (attention, tech debt, velocity)
- 6 upgrades and one prestige reset
- localStorage save + offline catch-up
- A single juicy "incident" event when tech debt caps

## Out of scope
- Real GitHub integration
- Multiplayer / leaderboards
- Actual code diffs (cards are flavor text)
- Mobile layout

## Risks & unknowns
- Idle economies are easy to build, brutal to balance — the first 10 minutes must hook before depth matters.
- "Approve to win" degenerate strategy if tech-debt punishment is too soft.
- Satire could read as cynical rather than fun; humor in the PR titles carries a lot.

## Done means
A fresh player can reach the first prestige in under 20 minutes, the save survives a reload with correct offline gains, and internal playtesting confirms neither pure-approve nor pure-review beats a mixed strategy on time-to-prestige.

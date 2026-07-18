## Overview
Patchwerk is a single-player programming puzzle game for the theorycrafting-curious. It steals the guts of SimulationCraft (an APL — Action Priority List — combat simulator that serious WoW players use to squeeze out DPS) and turns the *serious optimization tool into the whole toy*. You don't play a character; you author its rotation as a tiny DSL, hit Sim, and chase a leaderboard number against a stationary damage dummy named Patchwerk.

## Problem
SimC is the most fun *idea* in gaming — write a priority list, let a sim decide who wins — buried under a wall of raid-log import UX and 500-line class configs nobody outside the top 1% touches. The elegant core (resources, cooldowns, GCD, procs, priority evaluation) never gets exposed as a game. Non-WoW players never taste it at all.

## How it works
Each level hands you a fictional 'class': 2–5 abilities with costs, cooldowns, cast times, and a resource that generates/spends. You write a priority list in a small text DSL — `if focus>=40 and !cooldown.burst.up: arcane_shot`. You press Sim; a deterministic engine runs a 300-second fight, resolving the GCD, procs (seeded RNG toggle: deterministic or Monte-Carlo N=1000), and cooldown drift, then reports DPS plus a color timeline of what fired when. Par scores per level; a share string à la Wordle. Later levels add movement windows (forced downtime), execute phases (sub-20% bonus), and proc-chaining traps that reward reordering priorities cleverly.

## Technical approach
Core is a discrete-event simulator in TypeScript (priority queue of events keyed by time; GCD as a global lock). The APL is a peg-parser DSL compiling to a list of `(condition, action)` closures evaluated top-down each time the actor is free. State: resource pools, cooldown timers, buff/debuff stacks with expiry, proc RNG streams. Deterministic mode uses a seeded PRNG so a given APL always yields the same DPS (essential for a fair leaderboard); an optional averaged mode runs 1000 seeds in a Web Worker. Levels are authored as JSON class definitions. Hard part: making the DSL expressive enough to be interesting but constrained enough that the optimum is non-obvious and hand-tunable — plus balancing each class so the par score requires a genuine insight, not brute force.

## v1 scope
- 6 hand-authored classes/levels, deterministic sim only
- Text-editor DSL with live error underlines
- Sim button → DPS number + firing timeline + par comparison
- Emoji share string of your DPS vs par

## Out of scope
- Real WoW/ARPG class data or import from logs
- Multiplayer, raid mechanics, movement AI
- Monte-Carlo averaging (v2)

## Risks & unknowns
- DSL learning curve could wall newcomers — needs a gentle tutorial class
- Balancing so optima aren't trivially greedy is real design labor
- 'Feels like homework' risk; the timeline viz must make optimization *visceral*

## Done means
A player loads level 1, writes a 4-line priority list, sims it, beats par, and shares a result string — all client-side, deterministic, reproducible across reloads.

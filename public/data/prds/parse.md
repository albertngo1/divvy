## Overview
Parse is a theorycrafting-as-gameplay browser game: you author an ability-priority-list (APL) for a fantasy class in a small DSL, a deterministic sim runs it against a dummy, and you climb a leaderboard ranked by your "parse" percentile. For the min-maxers who already love the SimulationCraft spreadsheet more than the actual raid.

## Problem
SimulationCraft is beloved but the *fun part* — optimizing a rotation — is trapped behind a real MMO subscription and opaque, intimidating tooling. There's no self-contained game where rotation optimization *is* the objective, with a clean feedback loop and a shareable score.

## How it works
You're handed a class kit: abilities with cast times, cooldowns, resource costs, damage, and proc/buff interactions. You write a priority list: `if rage>=40 and !debuff.bleed: Rend` / `if cooldown.ready.recklessness: Recklessness` / `else: Slam`. Hit run; the sim executes 10,000 deterministic iterations against a training dummy and returns a DPS number plus a percentile vs every other submitted APL. A daily rotating boss modifier (forced movement windows, add spawns, execute phases) reshuffles the optimal line so yesterday's meta doesn't win forever.

## Technical approach
Event-driven sim in TypeScript: a priority queue of ability/cooldown/proc events on a virtual timeline, with seeded RNG so proc rolls are reproducible and results are stable/verifiable. The APL is parsed to an AST and evaluated at each GCD against current game state (resources, buffs, cooldowns, debuffs). Server stores the raw APL text + computed DPS; percentile is derived client-side from the leaderboard distribution. The genuinely hard part is *kit design*: crafting abilities with real rotational depth (proc chains, resource pooling, cooldown alignment) so there's no trivially dominant one-line rotation the community solves in a day.

## v1 scope
- One class, 5 abilities, single dummy fight
- DSL + AST evaluator + deterministic sim
- Local leaderboard, share-an-APL-by-link

## Out of scope
- Multiple classes, gear/stat scaling, PvP
- Real MMO data import
- Multi-target/cleave sims

## Risks & unknowns
- Audience may be too niche
- DSL learning cliff scares off casual players
- A single optimal rotation gets "solved" and the game dies

## Done means
Two different APLs for the same kit produce reproducibly different DPS across reruns, and the objectively better rotation ranks strictly higher on the leaderboard.

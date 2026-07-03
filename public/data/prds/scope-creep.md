## Overview
Scope Creep is a darkly funny time-and-resource sim for anyone who's ever started a 'quick' project. You accept a simple job — fix a dripping faucet — and every action fractally spawns prerequisite sub-tasks you didn't know existed. The antagonist is scope itself, riffing on 'Reality has a surprising amount of detail.' You win by finishing before your budget, patience meter, or spouse's goodwill runs out.

## Problem
Management sims usually model growth (build a bigger factory). Almost none model the specific, universal horror of a task that keeps expanding downward. There's comedy and genuine planning tension in a game where 'done' keeps receding and every fix uncovers two more.

## How it works
Each job is a hidden dependency tree. You see only the top node ('Fix leak'). Tackling it rolls against a detail table: sometimes it just works, often it reveals children ('Pipe corroded → replace pipe', which itself hides 'Shutoff valve seized'). Each node costs time, money, and tools; some need a permit (a timed side-quest), some risk making things worse (crit-fail floods the floor, adding nodes). You allocate a limited daily action budget, choose whether to bodge (cheap, adds future risk) or do-it-right (expensive, prunes the branch), and race a rising 'household disruption' meter. Runs are short (10–15 min); you're scored on finishing with minimum blast radius.

## Technical approach
Browser game, TypeScript + a lightweight canvas/DOM renderer (PixiJS or plain SVG). Core data structure is a lazily-expanded DAG: nodes carry {timeCost, cashCost, toolsNeeded, revealTable, bodgeRisk}. Expansion is seeded procedural — a weighted grammar per job archetype (plumbing, electrical, drywall) so branches feel plausible ('behind drywall → old wiring → not to code'). A deterministic PRNG seeded by daily date gives a shared 'Daily Job' for leaderboard comparison. Game state is a reducer over actions; the interesting design problem is tuning the reveal distribution so it's tense but not hopeless — expected tree depth must stay bounded, so reveal probability decays with depth and 'do-it-right' actively prunes. No backend for v1; daily seed + local best scores.

## v1 scope
- One job archetype (bathroom plumbing) with a hand-authored grammar
- Lazy DAG expansion + reveal tables
- Time/money/tools budgets and one disruption meter
- Bodge vs do-it-right choice per node
- Daily seeded run + local high score

## Out of scope
- Multiple archetypes, tech tree, hiring contractors
- Multiplayer / global leaderboard backend
- Fancy art (stick to icons + a floorplan)

## Risks & unknowns
Balancing is everything: too much branching feels unfair, too little feels flat. The comedy has to land through writing, which is authoring-heavy. Risk it reads as 'just a task list with dice' unless the reveals genuinely surprise.

## Done means
A playable daily run where a player can start 'Fix leak', experience at least one multi-level reveal chain, make a bodge-vs-right decision that visibly changes later nodes, and reach a win/lose state with a shareable score — all in one 12-minute sitting.

## Overview
Dual Rank is a browser puzzle game for tinkerers who like Opus Magnum / bin-packing brain-teasers. You run a scrappy datacenter that survives on reclaimed RAM (inspired by Meta's custom bridge chip that pairs old DIMMs into new servers). Each level hands you a tray of mismatched sticks; you must assemble working memory channels under real-feeling constraints.

## Problem
Most 'packing' puzzlers are abstract Tetris variants. There's an untapped, oddly satisfying fantasy in *hardware triage* — the exact tension Meta's engineers face reusing e-waste: mismatched speeds, ranks, and voltages that must be reconciled or throttled. Nobody's turned memory-channel matching into a game.

## How it works
A level is a motherboard with N channels, each channel holding 2 slots that must run in lockstep. Sticks have attributes: capacity, speed (MT/s), CAS latency, rank (single/dual), voltage. Rules mirror reality — a channel runs at the *slowest* stick's timing; mixing ranks costs stability; voltage mismatch needs a 'bridge chip' token you have limited supply of. Your goal each level: hit a target total capacity + stability score. Bridge chips let you legally pair otherwise-incompatible sticks but add latency, so hoarding vs. spending them is the core tension. Later levels add failing sticks (ECC error rate), thermal limits, and a budget where buying new is 'cheating' that tanks your sustainability score — a gentle dig at throwing away working silicon.

## Technical approach
Plain TypeScript + Canvas or Svelte, zero backend. Data model: `Stick {cap, speed, cl, rank, volts, health}`, `Channel {slots[2]}`, `Board {channels[], bridgeChips}`. Scoring is a pure function: effective channel speed = min(speed), stability = f(rank match, voltage delta, bridge use), total = sum. Levels are hand-authored JSON plus a seeded generator that guarantees at least one solution via constraint back-solving. The interesting bit: a solver/validator that rates a level's difficulty by counting near-optimal solutions, so the generator can target a difficulty curve. Timing/rank rules cribbed from real JEDEC behavior for flavor accuracy.

## v1 scope
- 12 hand-made levels, drag-and-drop sticks into channel slots
- Live channel-speed + stability readout as you place
- Bridge-chip inventory with cost feedback
- Win/lose against a target score, no accounts

## Out of scope
- Procedural infinite mode, leaderboards
- Thermal/ECC mechanics (v2)
- Mobile-optimized layout

## Risks & unknowns
- Rules may be too niche/dry for non-hardware people — needs juicy feedback (satisfying snap, error buzz) to land
- Balancing bridge-chip scarcity so it's a real decision, not obvious
- Solver difficulty-rating is fiddly to get right

## Done means
A player can load the game, complete all 12 levels in a browser, the stability score correctly reflects timing/rank/voltage rules on every placement, and each level is provably solvable to its target by the bundled validator.

## Overview
Mothball is a reverse city-builder: instead of growing something, you decommission it. Sparked by Long Island's mothballed nuclear plant crossed with Cities: Skylines, it's a teardown-tycoon where you safely dismantle a retired facility — nuclear plant, factory, mall — over years, juggling radiation, salvage value, crew safety, and public memory.

## Problem
Every builder game is about accretion. Yet entropy and cleanup are the hidden 90% of real infrastructure, and no game simulates the graceful, ruinously expensive art of shutting something *down*.

## How it works
You inherit a facility as a grid of systems and rooms, each with hazard, salvage-value, and structural-dependency attributes. You can't just swing a wrecking ball — you must power down in dependency order (cut coolant only after fuel is removed), decontaminate hot zones, and scrap materials for the budget that funds the next step, all before funding or the deadline runs out. Sequence it wrong and contamination spreads while the public-trust meter craters. You steer toward one of three real end states: greenfield (pristine), brownfield (capped), or entombment (safestor — sealing it in place).

## Technical approach
2D top-down, TypeScript + a lightweight ECS, rendered on canvas via PixiJS. Data model: systems are nodes in a dependency DAG, each `{hazard, decayRate, salvage, dependsOn[]}`. A tick loop runs contamination as a simple cellular automaton over the grid and radioactive decay as an exponential per tick. Economy: salvage revenue vs. crew day-cost vs. deadline. Key algorithms: a topological-validity check gating every shutdown action, plus the diffusion CA for contamination spread. The hard part is making correct-sequencing feel *discoverable* rather than manual-memorization — dependencies must be telegraphed visually (glowing coolant lines, pulsing hot zones) so deduction, not a wiki, drives play.

## v1 scope
- One small facility, ~12 systems
- Dependency-gated shutdown actions
- Contamination cellular automaton + decay
- Budget + deadline economy
- Three end states, win/lose

## Out of scope
- Multiple facilities / campaign
- 3D rendering
- Regulatory realism
- Individually-simulated worker agents

## Risks & unknowns
"Reverse SimCity" risks feeling like chores; the joy must come from puzzle-y sequencing and dramatic failure states. Tuning the contamination CA so mistakes are legible and recoverable-ish. Keeping the theme from feeling grim rather than satisfying.

## Done means
A player can take one facility from hot to fully decommissioned by correctly sequencing shutdown and decontamination within budget, and a wrong sequence produces a visible contamination spread across the grid and a public-trust hit.

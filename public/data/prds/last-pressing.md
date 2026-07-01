## Overview
Last Pressing is a short narrative tycoon about managing the final disc-manufacturing plant on Earth as studios (like the PlayStation announcement) end physical production. You balance dwindling orders, aging machines, and loyal-but-shrinking demand while deciding when — or whether — to shut the line down. A bittersweet management game about obsolescence.

## Problem
Tycoon games are almost always about growth; there's no genre for the graceful management of decline. The real-world end of physical discs is a poignant, specific setting nobody's turned into play. The itch: a management loop where 'winning' might mean a dignified wind-down, not endless expansion.

## How it works
Each turn (a month) you receive fewer contracts than the last as clients go digital. You allocate a fixed crew across presses, maintenance, and a small 'collector's edition' boutique line that pays premium but tiny volume. Machines break down more as parts vendors vanish. Events force choices: lay off a veteran, take a sketchy bootleg contract for cash, or pivot to archival/vinyl. The arc ends when demand hits zero — your score is how long you kept the lights on and how you treated the people on the way down.

## Technical approach
Stack: TypeScript + a lightweight game loop (no engine needed) or Phaser for the plant view; fully client-side. Data model: `machine(condition, throughput, repairable_bool)`, `contract(units, deadline, payout, prestige)`, `worker(skill, morale, tenure)`, global `demand_curve` that monotonically decays with noise and event shocks. Core systems: a monthly resolver that assigns crew→tasks, computes output vs. contracts, degrades machines (rising failure probability as spare-parts availability trends to zero), and fires narrative events keyed on state thresholds. The hard part is making decline feel meaningful rather than just frustrating — pacing the decay curve and event beats so each shutdown decision carries weight.

## v1 scope
- 24-month decaying demand curve
- Three machines, five workers, a monthly allocation screen
- ~10 narrative events tied to state (breakdown, layoff, bootleg offer)
- End screen scoring longevity + a 'legacy' morale metric

## Out of scope
- Detailed factory-floor animation/logistics sim
- Procedural events beyond the authored set
- Multiple factories or competitors

## Risks & unknowns
- Decline loops risk feeling depressing rather than poignant
- Balancing so smart play extends the run without trivializing it
- Short game → needs strong writing to land emotionally

## Done means
A player can complete a full 24-month run, face at least three consequential events, watch monthly demand visibly shrink toward zero, and reach an end screen that scores how long and how humanely they ran the plant.

## Overview
Turnaround is a browser puzzle game about the real-world critical path of servicing a parked aircraft. Airport Simulator on HN was all air-traffic romance; Turnaround steals the unglamorous part the industry actually sweats—the ground handling turnaround, where a plane must be emptied, serviced, and refilled in a brutal window while a dozen tasks contend for scarce resources.

For whom: puzzle/optimization fans (Mini Metro, Overcooked, factory-game crowd) and ops nerds who like precedence graphs disguised as a game.

## How it works
Each level is one aircraft at one gate with a countdown. You schedule ground service tasks onto a timeline: deplane → cabin clean, catering, lavatory, water, refuel, cargo unload/load, then board → pushback. Tasks have durations, precedence constraints (can't board before cleaning; can't refuel with passengers unless you assign a fire-watch), and resource contention (one jet bridge, two baggage tugs, one fuel truck shared with the neighboring gate). You drag tasks onto lanes; the sim runs and shows the critical path glowing red. Slack tasks can shuffle; critical ones can't. Curveballs land mid-turn: a late catering truck, a wheelchair passenger, a cargo door jam, weather pushing a departure slot. Score = on-time performance across a shift of turns, with a network effect—delay one plane and its aircraft arrives late at the next gate.

## Technical approach
Pure client-side: TypeScript + Canvas (or SVG) for the Gantt-style board, no backend. Core model is a DAG of tasks with durations and a resource pool; the sim is a discrete-event scheduler that greedily plays your assignment and reports makespan plus the critical path via longest-path over the DAG. Levels are authored as JSON (tasks, edges, resources, events) and can be procedurally perturbed with a seeded RNG for daily challenges. The satisfying hard part is real-time critical-path highlighting as the player drags—recompute longest path on each edit and animate which tasks became binding. A Wordle-style emoji share encodes your delay minutes.

## v1 scope
- 8 hand-authored turnaround levels, single aircraft each
- Drag tasks onto resource lanes; precedence + contention enforced
- Live critical-path highlight and a running gate clock
- One curveball type (late truck) and a pass/fail on-time result
- Daily seeded level with emoji share

## Out of scope
- Full airport network / multi-gate cascade sim
- Weather/ATC slot modeling
- Union rules, real IATA task timings, licensing anything real
- Multiplayer

## Risks & unknowns
- Fun/frustration balance: precedence puzzles can feel like homework
- Making the critical path legible without a manual
- Whether drag-scheduling beats a simpler tap-to-assign UI on mobile

## Done means
A stranger loads the page, completes three levels understanding why a task went red without reading instructions, hits a genuine 'aha' when reordering catering saves four minutes, and shares an emoji result—all with zero server calls.

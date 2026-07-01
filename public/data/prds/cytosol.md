## Overview
Cytosol is a 2D sandbox survival-crafting game (think Terraria meets synthetic biology) where the map *is* a living cell. You spelunk organelles, mine molecular resources, build machinery — and the world itself grows, metabolizes, and eventually divides beneath your feet. For players who love Terraria/Don't Starve and anyone who ever wanted to *live inside* the diagram from a biology textbook. Sparked by the news that a from-scratch cell just grew and divided.

## Problem
Educational biology games are dry; great survival-crafters are set in the same forests and caves. Nobody has made the interior of a cell feel like a place with real terrain, resources, threats, and dramatic events. The itch: the cell has *incredible* built-in game mechanics (metabolism, transport, replication, immune response) that have never been mined for play.

## How it works
You explore a procedurally generated cell: cytoskeleton as tunnels, mitochondria as power plants (harvest ATP), the ER/Golgi as fabrication zones, the nucleus as a locked vault of blueprints. You mine molecules, craft transport machinery, and keep the cell healthy against threats (a virus incursion, oxidative-stress 'weather'). The signature event: as resources accumulate, the cell enters mitosis — the map physically splits, chromosomes must be sorted, and you scramble to survive the division and end up in a viable daughter cell.

## Technical approach
Stack: TypeScript + a lightweight 2D engine (Phaser or a custom Canvas/WebGL renderer); Box2D-style rigid-body physics for floating organelles and transport. Procedural generation: seed a cell layout with organelle 'biomes' via Poisson-disk placement + noise-carved cytoskeleton tunnels (cellular-automata smoothing for cavern feel). Simulation: a coarse resource/tick model — ATP production from mitochondria, diffusion gradients as a grid, a simple state machine for the cell cycle (G1→S→G2→M). Division is the hard part: a runtime map-splitting routine that partitions the tilemap and entities into two coherent daughters while the player is inside — essentially a live world-fork. Save = seed + resource state + player inventory.

## v1 scope
- One procedurally generated cell, 3 organelle biomes (mito, ER, nucleus)
- Mine 2 resources + craft 2 items
- Scripted single mitosis event that splits the visible map
- One threat: a virus that spawns and must be walled off

## Out of scope
- Multiple cell types, tissues, multiplayer
- Accurate biochemistry (flavor over fidelity)
- Progression tech tree beyond a couple of crafts

## Risks & unknowns
- Live map-splitting during mitosis is technically gnarly and could feel janky.
- Balancing 'fun sandbox' vs. 'confusing biology' — legibility of organelles.
- Scope creep: cells are bottomless; must stay humiliatingly small in v1.

## Done means
I can spawn into a generated cell, mine ATP from a mitochondrion to craft one item, wall off a spawned virus, and trigger the mitosis event that visibly splits the map into two daughters and leaves me alive in one of them.

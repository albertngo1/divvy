## Overview
A strategy/idle sim for people who like systems and biology. You run an eradication campaign against an invasive insect using the real Sterile Insect Technique (SIT) — the same trick that beat the screwworm. Your weapon is a breeding facility, not a flamethrower.

## Problem
Every pest game is a tower defense: shoot the bugs. But the actual triumph of 20th-century pest control was counterintuitive and beautiful — flood the wild population with sterilized males so females mate but produce no offspring, and the population implodes over generations. That inversion is an untapped, genuinely educational game mechanic.

## How it works
A grid/region map with a growing wild pest population governed by a discrete-generation model (birth rate, carrying capacity, dispersal). You allocate budget to: rear larvae, irradiate them to sterility (dose vs. competitiveness tradeoff — over-irradiated males are sterile but bad at mating), and release them where and when. Each generation resolves matings; the wild:sterile ratio drives the crash. Win by driving wild count to zero; the leaderboard ranks fewest total sterile males released and fewest generations — an efficiency puzzle, not a grind.

## Technical approach
Client-side (TypeScript + canvas). Core is a per-cell population simulation: N_{t+1} = N_t * R * (S_wild / (S_wild + c*S_sterile)) with logistic carrying capacity and a diffusion step for dispersal between cells; c is sterile-male competitiveness (declines with irradiation dose). Deterministic RNG seeded per campaign for reproducible leaderboards. UI: heat-map of density, release-drop tool, generation stepper. Hard part: tuning the model so it's winnable, tense, and teaches the real ratio dynamics (releases must vastly outnumber wild males late-game as wild density falls — the counterintuitive 'why is this getting HARDER as I win' beat).

## v1 scope
- Single region, ~10x10 cell grid, one pest species
- Three levers: rear, irradiate (dose slider), release (place)
- Generation-by-generation resolution with visible ratio math
- One seeded daily campaign + fewest-releases leaderboard

## Out of scope
- Multiple species / predators / weather
- Real geography
- Multiplayer
- Genetic-drive variants

## Risks & unknowns
- Model could feel like spreadsheet math without good juice/feedback
- The 'harder as you win' dynamic may frustrate before it delights
- Balancing dose tradeoff so it's a real decision, not obvious

## Done means
You play a seeded campaign, rear/irradiate/release across generations, watch the wild population crash to zero, get a score of total sterile males + generations used, and see it ranked on a leaderboard.

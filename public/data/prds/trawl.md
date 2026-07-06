## Overview
Trawl is a browser toy/collection game about *fishing for rules*. Instead of designing a cellular automaton, you cast into the vast space of possible rules; the game auto-runs candidates, scores which ones look "alive," and surfaces a catch of promising specimens for you to keep, name, and breed. For generative-art tinkerers and anyone charmed by the idea of *accidentally discovering* a new automaton (à la Mr. Baby Paint).

## Problem
Emergence is magical but hunting for interesting CA rules by hand is tedious — most rules are boring (die out or fill the grid). There's no playful loop that does the boring search for you and lets you curate the gems. Trawl makes serendipity a mechanic: the novelty search finds the weird ones, you provide the taste.

## How it works
You pick a fishing ground (a rule family: totalistic outer, Larger-than-Life, or a Lenia-like continuous kernel). Press **Cast**: the engine samples N random rules, runs each ~200 steps from a seeded blob, and scores them on an "aliveness" heuristic. The best few appear as animated specimens on your line — gliders, oscillators, blobs that pulse. Keep the ones you like; each gets a name and a slot in your bestiary with its exact rule string. **Breed** two keepers to sample the rule-space *between* them (parameter interpolation + mutation), producing offspring with visible lineage. Rare high-novelty catches are flagged as "trophies."

## Technical approach
Simulation runs in a WebGL fragment shader (ping-pong framebuffers) so hundreds of candidate grids evaluate fast; readback a downsampled grid for scoring. Aliveness score blends: survival (nonzero, non-saturated population over time), temporal change (frame-to-frame delta staying in a Goldilocks band), spatial entropy, and center-of-mass drift (movement = extra points) — essentially a cheap novelty-search fitness. Rule representation is a compact vector per family (e.g. birth/survival bit-set, or kernel weights + growth curve for continuous). Breeding = crossover + Gaussian mutation on that vector. Bestiary persists to IndexedDB as {name, family, ruleVector, thumbnailGIF, parents[]}. Hard part: designing an aliveness metric that reliably separates "interesting" from both heat-death and static noise — the whole game lives or dies on that heuristic feeling right.

## v1 scope
- One rule family (totalistic Larger-than-Life)
- Cast → evaluate 64 candidates in-shader → show top 6 animated
- Keep/name specimens into an IndexedDB bestiary
- Export a specimen as a shareable rule string + looping GIF

## Out of scope
- Breeding/lineage (v2)
- Continuous/Lenia families
- Accounts or shared galleries

## Risks & unknowns
- Aliveness heuristic may over-reward noise or gliders only
- WebGL readback cost limiting candidates per cast
- "Fun" depends on catch quality — tuning-heavy

## Done means
Press Cast and reliably reel in at least one specimen that visibly moves or oscillates (not dead, not full), save it to the bestiary, reload the page, and reproduce its exact behavior from the stored rule string.

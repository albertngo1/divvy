## Overview
Landmark is a top-down physics-comedy puzzle game. Each level is a messy room; your goal is to get a bumbling robot from start to goal using *only* natural-language landmark instructions. It grafts Mistral's Robostral Navigate framing (landmark-based robot navigation) onto Human Fall Flat's flailing physics — the joke is that the robot obeys you *exactly*, and exactly is rarely what you meant.

## Problem
"Navigation model" demos are always triumphant. The funnier, truer experience is instruction-following gone wrong: the robot took you literally, there were two lamps, and now it's wedged behind the sofa. There's no cozy puzzle game about the ambiguity of giving directions.

## How it works
You see a top-down room with labeled objects (couch, lamp, rug, plant). You write a short ordered instruction list: `go to the lamp`, `turn right`, `go past the plant to the door`. Hit **Run**. The robot executes step-by-step with real 2D physics — it clips furniture, slides on the rug, knocks the plant over (which changes the map for later steps). Ambiguity resolution is deliberately dumb: "the lamp" picks the *nearest* matching object, so two lamps = a trap you set for yourself. Levels escalate: identical twin objects, moved landmarks, a step that must reference something you knocked over. Par is measured in instruction count; a slapstick replay is shareable.

## Technical approach
TypeScript + a lightweight 2D physics engine (Rapier or matter.js) on canvas. Instruction parsing is a small hand-rolled grammar (verb + target + modifier), no LLM needed for v1 — targets resolve by string match to nearest labeled body; `turn`, `past`, `until` map to steering primitives fed to a simple pure-pursuit controller. Determinism is essential (seeded physics, fixed timestep) so the same instructions always produce the same run and levels have provable solutions. The genuinely hard part is the ambiguity engine feeling *fair-but-mean*: nearest-match resolution plus a "line of sight" rule that surfaces the wrong-object gag without feeling random. Later, an optional cloud tier could swap the grammar for an actual small nav/VLM to grade freeform sentences.

## v1 scope
- 8 hand-authored rooms with escalating landmark traps
- Hand-rolled instruction grammar (~6 verbs, nearest-match targets)
- Deterministic physics run + instant-replay + instruction-count par
- One shareable GIF/replay of the funniest failure

## Out of scope
- LLM/VLM freeform parsing
- 3D, level editor, multiplayer
- Robot animation beyond a wobbly capsule

## Risks & unknowns
- Deterministic-but-lively physics is a tuning grind; too rigid kills the comedy, too chaotic kills the puzzle.
- Grammar must be forgiving enough not to feel like fighting a parser.
- "Nearest-match" ambiguity has to read as *your* fault, not the game cheating.

## Done means
All 8 levels are solvable with a known instruction set, the same instructions replay identically across reloads, and a first-time playtester laughs at least once at a literal-interpretation failure without accusing the parser of being broken.

## Overview
Exploded View is a reverse-engineering puzzle game: instead of building machines, you take them apart to understand them. Sparked by the illustrated teardown of a pull-back car, each level hands you a mystery mechanism as an exploded diagram, and you drag it apart, trace the force path, and deduce what it does. It's for the tinkerer who loves iFixit teardowns but wants to *interrogate* the mechanism, not just watch.

## Problem
We're drowning in games and tutorials about building things, and almost nothing rewards the deeper skill of looking at an unfamiliar mechanism and *deducing* how it works. Teardown culture is beloved but entirely passive — you read the explanation, you never earn it.

## How it works
Each puzzle is a 2D mechanism — pull-back car, mechanical pencil, music box, wind-up timer. You drag the exploded parts along their assembly axes, spin gears to see downstream motion, and "probe" by applying an input (pull the car back) to watch energy flow highlight through the linkage. Then you answer a targeted question — "which part stores the energy?", "what's the gear ratio?" — by clicking the culprit part or setting a value. A correct deduction plays an animated cutaway and unlocks the next teardown.

## Technical approach
Web, TypeScript + matter.js (or a small custom constraint solver) so gears and springs actually transmit motion — the "aha" comes from real simulated coupling, not a scripted animation. Parts are SVG with authored pivot/axis/constraint metadata in a compact JSON schema: `{parts:[{id,svg,pivot,constraints}], inputs, questions}`. The energy-flow highlight is a graph traversal over the constraint graph from the input node, tinting every mechanically-connected part. The genuinely hard part is authoring believable mechanisms — gear meshing, spring storage, ratchets — whose constraints simulate *stably*, because physics-accurate small mechanisms are notoriously finicky at scale.

## v1 scope
- Three mechanisms: pull-back car, mechanical pencil, simple gear train
- Drag-to-explode along assembly axes
- One input probe per level with energy-path highlight
- One deduction question each, with cutaway reveal

## Out of scope
- Level editor
- 3D
- Large mechanism library
- Hint system / tutorial voiceover

## Risks & unknowns
Physics stability at small scales. Teaching deduction without hand-holding. High authoring cost per mechanism — each one is bespoke constraint work.

## Done means
A player can explode the pull-back car, pull it back to see the spring-and-gear energy path light up, correctly identify the energy-storing part, and unlock the next mechanism.

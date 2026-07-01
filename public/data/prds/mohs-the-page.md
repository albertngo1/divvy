## Overview

Mohs the Page turns the Mohs hardness scale into something you do with your cursor instead of read off a chart. Every mineral is a draggable tile. Drag mineral A across mineral B and the softer one gets physically gouged — real canvas pixels erode into a streak — while the harder one leaves nothing behind. Drag a diamond across talc and you carve a trench; drag talc across diamond and your talc crumbles into dust. The scale stops being ten numbers and becomes a thing your hand feels through drag resistance and sees as a scar on the screen. "Scratch a diamond across your screen and watch it gouge everything else" is a video that posts itself.

## Problem

The Mohs scale is one of the most famous ordinal scales in science and it is always taught as a static ranked list or a bar chart. Nobody has built an interactive where the *act of scratching* is the encoding — where hardness is felt as the difference between "leaves a mark" and "gets marked." The data (hardness values for hundreds of minerals) is trivially open; the artifact is missing.

## How it works

A shelf of mineral tiles, each rendered with a real crystal photo and its Mohs number. You pick two: one becomes the "tool," one the "specimen." You drag the tool across the specimen's surface. If tool hardness > specimen hardness, the drag path erases specimen pixels into a visible groove and kicks up particle debris; drag resistance (cursor lag/haptic-style feedback) is scaled to the hardness gap. If softer, the tool tile itself sheds a crumbling trail and the specimen is untouched. A running "crust histogram" shows how common each hardness is in the Earth's crust, so the diamond feels rare and quartz feels everywhere.

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: static site, Vite + TypeScript, HTML5 Canvas (2D) for the scratch surface, pointer events for drag. No backend — one precomputed JSON.

Data sources by name:
- **MinDat** (mindat.org) — the definitive mineral database; scrape/export mineral name, Mohs hardness (often a range like 6.5–7), crystal photos, and crust abundance where available.
- **Wikipedia** hardness tables — cross-check and fill Mohs values, plus the standard reference-mineral list (talc 1 … diamond 10) and the classic scratch-hardness demos.

Data model: `minerals[{id, name, mohs_low, mohs_high, img_url, crust_ppm}]`. Comparison uses `mohs_low` of the harder minus `mohs_high` of the softer to decide direction and gouge depth.

Key algorithm: pixel erosion. The specimen is a Canvas layer; the drag path is stamped as a soft-edged brush that clears alpha proportional to `depth = clamp((tool_mohs - specimen_mohs) * k, 0, 1)`. Equal hardness → faint mutual scuffing. Debris = short-lived particles spawned along the path, colored from the eroded pixels.

The hard part: making erosion *feel* like hardness, not like an eraser tool. Drag resistance has to scale with the hardness gap (via pointer-velocity damping), the groove has to look mineral (edge chipping, not a clean line), and the softer-tool case has to visibly destroy the *tool*, not the specimen — otherwise the physics reads backwards.

## v1 scope (humiliatingly small)

- The 10 canonical Mohs reference minerals only, plus quartz/diamond/talc emphasized.
- Pick tool + specimen, drag to scratch, see the groove or the crumble.
- Static crust-frequency histogram alongside.
- One precomputed `minerals.json`.

## Out of scope (for now)

- Full MinDat catalog (hundreds of minerals), search, filtering.
- Real haptics / force-sensor input.
- Absolute-hardness (Vickers) mode; anisotropy (kyanite scratches differently by axis).

## Risks & unknowns

Prior-art verdict: **Open**. Only static charts and reference tables exist; no interactive drag-scratch pixel-erosion tool has been built. Fresh angle = the scratch *is* the encoding. Risks: (1) erosion that reads as "eraser" not "gouge" — mitigate with chipped edges + debris + resistance; (2) hardness ranges muddy the equal-case comparison — pick a single representative value per mineral for v1; (3) trackpads give no true force feedback, so "feeling" hardness leans entirely on visual + velocity cues.

## Done means

A visitor drags diamond across talc and carves a permanent groove with flying debris; drags talc across diamond and watches the talc tile crumble while the diamond is pristine; the drag feels heavier the bigger the hardness gap; and the whole thing is a deployed static site loading one JSON.

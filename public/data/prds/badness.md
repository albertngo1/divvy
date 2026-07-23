## Overview
Badness is a single-page interactive explainer that teaches the Knuth-Plass total-fit line-breaking algorithm — the thing that makes TeX paragraphs beautiful — by letting you watch it run. For anyone curious how justification actually works, or why the web's greedy line-breaker looks worse than a 1980s typesetter.

## Problem
Justif just brought Knuth-Plass microtypography to the web and it made the front page, but almost nobody understands the algorithm. Existing explanations are a wall of demerit equations. The core idea — that optimal line-breaking is a shortest path through a graph of possible break points, solved with dynamic programming — is genuinely beautiful and completely invisible in prose. It begs for an explorable.

## How it works
A sample paragraph sits at the top. Below it, the same paragraph is drawn as a directed graph: each legal break point (glue between words, hyphenation points) is a node; edges are candidate lines weighted by 'badness' (how stretched/squished the glue is) plus penalties. A 'tolerance' slider changes how much stretch is allowed; a stepper walks the DP forward, lighting up each node's best-known predecessor. Toggle 'greedy vs optimal' to see the two break sets diverge. A 'rivers' toggle highlights vertical whitespace channels. Every change re-renders the actual typeset paragraph live, so you feel the tradeoff.

## Technical approach
Stack: vanilla TypeScript + SVG (D3 for the graph layout, no framework). Reimplement Knuth-Plass from the original paper: represent the paragraph as a list of boxes/glue/penalties, compute badness = 100·(adjustment_ratio)³, add line/flagged/fitness-class penalties to get demerits, then run the O(n·breaks) DP with an active-node list exactly as the paper describes. Hyphenation via Franklin/Liang patterns (hyphen.js) to generate optional break points. The typeset preview positions each line by distributing the computed glue. The genuinely hard part is faithfully reproducing the active-node pruning and fitness-class demerits so the animation matches real TeX output, and doing it fast enough to re-solve on every slider tick.

## v1 scope
- One fixed paragraph, one font, ragged-vs-justified toggle
- Tolerance slider + step-through DP animation
- Greedy-vs-optimal overlay showing which breaks differ
- Live typeset preview

## Out of scope
- Editing your own text / arbitrary fonts
- Multi-column, floats, or full page layout
- Non-Latin scripts and vertical writing

## Risks & unknowns
Getting demerits pixel-faithful to TeX is fiddly; the graph gets visually dense past ~40 words so the sample must be short. Kerning/font-metric mismatches could make the preview look wrong even when the math is right.

## Done means
For the sample paragraph, the tool's chosen break points match a reference TeX run exactly, the DP animation visibly selects them, and moving the tolerance slider changes the break set in real time (<16ms re-solve).

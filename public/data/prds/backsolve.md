## Overview
Backsolve inverts PlantUML. Instead of typing text to render a diagram, you're handed the *rendered diagram* and must write the source that reproduces it — pixel-close — in as few keystrokes as possible. It's a daily code-golf puzzle for developers who know (or want to learn) diagram-as-code syntax and enjoy Wordle-shaped competitions.

## Problem
PlantUML/Mermaid are write-only tools — you go text → picture and never the other way. Reading a diagram and reproducing its structure is a real skill (onboarding to a codebase, whiteboard-to-doc), but there's no fun way to practice it, and diagram-as-code has no competitive daily-puzzle scene the way words and typing do.

## How it works
Each day everyone gets the same target diagram image plus the syntax dialect (sequence, class, or flowchart). You type source in a live editor; it renders beside the target in real time. A similarity score compares your render to the target (structural + visual). You 'solve' when similarity crosses a threshold; your score is keystrokes used and time. A shareable emoji-grid result (à la Wordle) drives virality, and a leaderboard ranks the day's shortest solutions.

## Technical approach
Front end embeds a diagram renderer — Mermaid.js runs fully client-side (no server round-trip), so start there rather than PlantUML's Java backend. The scoring is the hard part: I render the player's Mermaid to SVG, extract the graph model (nodes, edges, labels) from Mermaid's parsed AST, and compare *structurally* against the target's stored AST (graph edit distance on node/edge sets + label match), with a lighter pixel-diff as a tiebreaker — this rewards correct structure over exact layout, which layout engines don't make deterministic anyway. Daily puzzles are pre-authored source snippets stored as (source, rendered SVG, AST) triples. Backend is a single Worker + KV for puzzles and leaderboard.

## v1 scope
- Mermaid flowcharts only, one daily puzzle
- Live editor + side-by-side render + AST-based similarity meter
- 'Solved in N keystrokes' shareable result string
- Simple daily leaderboard

## Out of scope
- Sequence/class diagrams, multiple dialects
- User accounts, historical archive of past puzzles
- Anti-cheat beyond keystroke honesty

## Risks & unknowns
- Structural similarity scoring is finicky; graph edit distance can be slow or ambiguous for larger diagrams.
- Narrow audience — people who both know Mermaid and like golf.

## Done means
A player is shown today's flowchart, types Mermaid until the similarity meter marks it solved, and gets a shareable keystroke score that lands on the leaderboard.

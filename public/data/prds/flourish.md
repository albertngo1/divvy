## Overview
Flourish is a cooperative, no-talking convergence game for 3 players plus a host screen. Each player privately draws one continuous freehand stroke in response to an abstract prompt. You win when all three drawn *shapes* match — regardless of where or how big anyone drew them.

## Problem
Convergence games lean on picking, tapping, or tuning. Almost none use the most primal shared-intuition channel: **gesture**. Ask three people to "draw the shape of *hesitation*" and something uncanny happens — hands independently reach for similar forms. But this only works if each person draws *blind*, on their own surface, with no chance to copy a line. The itch is the reveal: three squiggles, drawn in isolation, sliding on top of each other and turning out to be the same swoosh.

## How it works
The host TV shows one evocative prompt: **"Draw the gesture for GROWTH"** (or DOUBT, ESCAPE, a spiral, a settling). Each phone shows a blank drawing pad and a single instruction: one continuous stroke, then SUBMIT. Privately, each phone shows only *your* stroke as you draw it — you never see anyone else's line.

The host TV shows only an anonymized **similarity meter** while strokes come in: after normalizing every stroke for position, scale, and rotation (Procrustes alignment), the server scores how tightly the three forms agree and renders it as three faint ghost-ribbons braiding closer or fraying apart — never a legible copy of anyone's actual drawing. Below a match threshold, everyone clears and redraws, guided only by warmer/colder. On a win, the host overlays all three normalized strokes as one thick confident mark and names it.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Each stroke is captured as a resampled polyline (~64 points via pointer events). Data model: `Room { promptId, players: { id, stroke: Point[]|null, submitted } }`. On submit, the phone sends its raw polyline; the server resamples to fixed length, mean-centers, scale-normalizes, and Procrustes-aligns each pair, then reduces to a single similarity scalar (mean pairwise shape distance) broadcast only to the host. Raw strokes stay server-side until the win reveal. The genuinely hard part is **shape comparison that ignores nuisance transforms without ignoring form** — a slow drawer and a fast drawer must score identically, and the heat signal must guide toward the shared shape without ever leaking a traceable line back to the TV (which would let players copy it).

## v1 scope
- Exactly 3 players, one round, one hardcoded prompt.
- Single-stroke pad with SUBMIT and clear/redraw.
- Server-side resample + Procrustes similarity + one aggregate scalar.
- Host warm/cold ghost meter (three states acceptable) + win overlay of the merged mark.

## Out of scope
- Multi-stroke drawings, color, scoring, multiple rounds, 4+ players.
- Per-player critique of *whose* stroke differed.
- Sensor/tilt drawing (finger only for v1).

## Risks & unknowns
- Threshold tuning: too strict = never wins; too loose = trivial. Needs playtest calibration.
- Rotation-invariance may over-match (a shape and its mirror scoring equal) — may need to lock rotation partially.
- Some prompts collapse to "everyone draws a spiral" instantly; abstract-but-not-obvious prompt curation is the design work.

## Done means
Three phones join, each privately draws one stroke and submits; the host shows a similarity meter that reveals no legible individual stroke; when the three normalized shapes agree within threshold the host declares a win and overlays the merged mark. Any mismatch clears the pads and continues play.

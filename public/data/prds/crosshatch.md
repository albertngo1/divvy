## Overview

**Crosshatch** is a 3–6 player real-time drawing game with one shared canvas and no turns. Each player is privately given a glyph to draw — a letter, a digit, a simple symbol. Everyone draws at the same instant on the *same* surface, shown on the TV. Ink appears anonymously as it's drawn. The rule: **if your stroke crosses anyone else's stroke, both strokes vanish.** You are not drawing a picture; you are hunting for uncontested whitespace while five other hands are eating it.

## Problem

Every shared-canvas game is cooperative — draw together, guess together. Nobody has made the canvas a *contested resource*. And most "anti-coordination" designs are abstract number-picking, so the tension is arithmetic. Here the scarcity is visible, shrinking, and drawn by human hands in real time, which makes the failure legible to the whole room the instant it happens.

## How it works

1. TV shows an empty canvas with a 90-second timer.
2. **Private on each phone:** your glyph ("draw a capital R"), a finger-drawing pad that maps 1:1 to the TV canvas, and a small ghost preview of where *your* ink currently sits. Nobody else's target is ever shown to you.
3. **Shared on the TV:** all surviving ink from all players, drawn live, in one uniform color. No names, no player colors — you cannot tell whose line is whose while it's happening. You only see that space is disappearing.
4. Collision: the server tests each new stroke segment against every existing segment. On intersection, both entire strokes are deleted with an audible snap. The TV flashes the kill point. Two people who wandered into each other both go back to nothing.
5. Talking is allowed and useless — "I'm taking the top left!" doesn't survive contact with a finger on a 6-inch screen.
6. At the buzzer, the TV replays each player's *surviving* ink alone, and the room votes on whether it's still readable as the intended glyph. Score = 2 for legible, 1 for surviving-but-mangled, 0 for wiped.

## Technical approach

- Host tab renders the authoritative canvas; phone PWAs are pure input surfaces. Authoritative Socket.IO server (Tailscale Serve) or a PartyKit room owning canvas state.
- Data model: `Stroke {id, playerId, points[{x,y,t}], alive}`, `Canvas {strokes[]}`, `Player {id, glyphId, score}`. Coordinates are normalized 0–1 so any phone size maps to the same canvas.
- Sync: phones send point batches every 50 ms. The **server** — not the phone, not the host — runs segment-vs-segment intersection on each incoming batch and is the sole authority on kills, then broadcasts `{strokeAdd, strokeKill}` deltas to host and phones. Phones render optimistically and roll back on a kill event.
- Hard part: fairness under latency. Two players crossing at nearly the same moment must produce a deterministic, order-independent result — the server timestamps on arrival and kills *both* strokes regardless of who got there first, which is the design choice that makes lag stop mattering. Second hard part: intersection cost. Naive all-pairs is O(n²) per batch; v1 keeps it tractable with a coarse spatial grid and a hard cap of ~40 live strokes.

## v1 scope

- One round. Three players. 90 seconds. One canvas.
- Glyph deck of 10 capital letters, no repeats within a round.
- Kill = whole stroke, not the crossed segment. Simpler and crueler.
- Scoring by verbal room vote on the replay. No AI legibility judging.

## Out of scope

- Colors, brush sizes, undo, erasing, zoom.
- Multiple rounds, persistent scores, saving the artwork.
- Self-intersection rules — crossing your *own* line is free in v1.

## Risks & unknowns

- A capital R may be undrawable in the space left after 20 seconds; the glyph deck may need to skew toward single-stroke shapes (C, S, 7, L).
- If everyone rushes the center, round one is a total wipe and feels punitive rather than funny — may need a 10-second "stake your corner" grace period where kills are off.
- Anonymous uniform ink might make the canvas illegible mush; may need a faint per-player tint only on *your own* phone.

## Done means

Three phones and a TV: each phone shows a different private letter, all three draw simultaneously onto one live canvas, at least one crossing deletes both strokes with a visible flash within 200 ms of the intersection, and at the buzzer the TV replays each player's surviving ink in isolation for the room to judge.

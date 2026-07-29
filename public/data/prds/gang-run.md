## Overview

A 45-second spatial standoff for 3–5 players. The TV shows one blank press sheet. Every phone holds a private print job — a rectangle of fixed size — and a private client spec describing where on the sheet it needs to land. Everyone drags at the same time, blind to each other. Then the press runs. Any two jobs that overlap print on top of each other and are both destroyed.

## Problem

Most "claim the territory" games let you see the board fill up, so play degrades into reacting. Here the board is a lie: the TV is empty until the press runs. The only channel is your mouth, and the thing you most need to communicate — an exact region — is the thing spoken language is worst at. "I'm taking the fold" is not a coordinate, and two people who both believe they've agreed are the ones who get ruined.

## How it works

**Host screen (public):** the press sheet on a 24×16 named grid (columns A–X, rows 1–16), with real printed features drawn on it — a gripper edge along the bottom two rows, a fold line down column M, a trim boundary, and a visible ink-density gradient (richest in the center). Plus a countdown and a single anonymized "sheet coverage: 41%" meter that builds dread without revealing anything.

**Each phone (private):** a scaled mini-sheet with your job rendered as a draggable rectangle snapping to grid cells, a 90° rotate toggle, and your **client spec** — one of: *Dense* (≥50% of your area in the high-density band), *Fold* (must touch column M), *Clean* (must not touch the gripper rows or trim edge). Different jobs have different sizes, so "just split it evenly" doesn't work.

At lock, the server composites: overlapping pairs both score 0 and leave a permanent black smear on the sheet; clean jobs score by spec satisfaction. The final sheet stays on screen as the evidence.

## Technical approach

Host tab renders the sheet in canvas; phone PWAs render the same sheet in normalized units (0–1 in both axes) so no device pixel math ever crosses the wire. Authoritative PartyKit Durable Object holds `{sheet, jobs: {id, w, h, cellX, cellY, rot, spec}}`.

The sync problem is inverted: the server's job is to *withhold*. Position updates arrive at ~10Hz and are stored, never rebroadcast; only the aggregate coverage percentage goes out. The genuinely hard part is deadline fairness — a position update stamped by a laggy phone at T-20ms may land at T+90ms, and accepting it gives high-latency players a free last move while rejecting it punishes them for their carrier. v1 resolves by server-received time with a fixed 150ms grace window, and freezes each phone's UI at its own local deadline minus estimated RTT so the freeze feels honest. Overlap is a trivial AABB test on grid cells, done once, server-side.

## v1 scope

- 3 players, one sheet, one 45-second round
- Three job sizes, three spec types, axis-aligned only, grid-snapped
- Binary ruin on any overlap — no partial credit, no contest resolution
- Reveal: composite the sheet, smear the collisions, show scores

## Out of scope

Multiple rounds, free rotation, non-rectangular jobs, bidding for space, reprints, persistent shop economy, mobile landscape support.

## Risks & unknowns

The grid may make the game too easy to negotiate — if players simply say "A through H is mine," collisions stop happening and the game evaporates. Mitigation lever: make jobs large enough relative to the sheet that a clean partition satisfying all three specs doesn't exist. Also unknown whether dragging on a 3-inch mini-sheet is precise enough to feel fair even with snapping.

## Done means

Three phones and a TV, one round: every player places a job blind, the press runs, at least one collision smears, and the printed sheet on the TV exactly matches the union of the three private placements. No phone ever receives another phone's coordinates — verified in the WebSocket log.

## Overview
Pantograph is a 4–6 player hidden-role drawing game for a shared host screen plus private phones. Together the room reconstructs one figure on the TV, each player responsible for a couple of segments — but one player's private blueprint is quietly distorted, so their contributions don't quite line up.

## Problem
Drawing party games are either "guess my doodle" or "draw badly for laughs." The itch: a drawing game where the deduction lives in the GEOMETRY — where working faithfully from a private reference is what betrays you, and the imposter's only defense is to abandon their own plan and fake the shape everyone else is building.

## How it works
Setup: the host TV shows a shared canvas with a faint dotted skeleton of a simple figure (a constellation of 6 labeled nodes, or a little house). Each phone PRIVATELY shows the SAME figure as a full "blueprint" — precise node positions — plus a highlight of the 2 segments THAT player must draw. The figure is partitioned so every segment is owned by exactly one player and each segment's endpoints are shared with neighbors.

The imposter gets a blueprint where a few node positions are shifted a centimeter or two — enough that segments built to their spec meet neighbors' segments at a visible kink or gap.

Play: in turn order, the active player draws their assigned segment by dragging on their phone; it appears live on the TV. Honest players place endpoints per their (identical) blueprint, so segments meet cleanly. The imposter, drawing to their warped blueprint, leaves a mismatch — OR notices the emerging shape on the TV and "corrects" toward it to hide, which means fudging their own plan (the tell that they're not trusting a blueprint). After all segments are drawn, every phone privately votes for the imposter; the TV tallies. Imposter escapes if uncaught.

Private per phone: your full blueprint (role-dependent), which segments are yours, your drawing input, your vote. Shared on TV: the growing communal figure and the vote.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{phase, turnIdx, canvas:[stroke]}`, `player{id, role, blueprint, ownedSegments, vote}`. Server holds canonical + warped blueprints and streams each phone only its own. Strokes are appended server-side and broadcast to the TV; turn-gating keeps drawing serialized, so real-time sync is low-stakes (one active drawer at a time). Hard part: authoring figures where the warp is subtle enough to be deniable yet visible once neighbors' segments land — and normalizing phone-canvas coordinates to the TV canvas so honest players' shared endpoints actually coincide within tolerance.

## v1 scope
- One figure (6 nodes / ~8 segments), one imposter, 4 players, one round.
- Fixed turn order, one segment per turn, one vote, one reveal.
- Coarse coordinate snapping to node anchors; no freehand shading.

## Out of scope
- Multiple figures, difficulty tiers, imposter-count scaling, scoring.
- Freeform art, colors, undo, spectators, reconnects.

## Risks & unknowns
- Snapping endpoints to anchors may hide the imposter's error entirely; needs a free-drag zone near owned nodes so the warp shows.
- A savvy imposter who always copies the visible figure may be undetectable — may need to hide the shared canvas from the active drawer until their stroke commits.
- Coordinate calibration across phone aspect ratios.

## Done means
Four phones join, each receives a role-correct blueprint with its own highlighted segments, all segments draw onto the shared TV canvas in turn, a warped imposter's contribution produces a visible mismatch, a vote resolves, and the TV reveals whether the room caught the imposter.

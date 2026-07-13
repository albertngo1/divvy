## Overview
Zoetrope is a 3-5 player concurrent-room drawing game that assembles one short looping animation from frames drawn blind, in parallel, on separate phones. It's for casual groups who want a genuinely surprising shared GIF as a keepsake — no winner, no score.

## Problem
Collaborative drawing games (exquisite corpse, telestrations) are spatial or sequential. Nobody makes *animation* together because timing and in-betweening require seeing adjacent frames simultaneously — impossible on one passed phone. The delight is temporal: your frame has to almost-connect to frames you can only half-see, and the loop only resolves when it plays. That demands every phone drawing at once with private, per-frame neighbor hints.

## How it works
The host TV shows a numbered ring of empty frames (say 5) around a placeholder loop and a shared seed prompt ("a bouncing thing"). Each phone owns exactly one frame index.

**Phone (private):** a canvas for *your* frame only. Behind it, faint server-pushed onion-skins: a low-opacity ghost of your left neighbor's current strokes and your right neighbor's, updated live as they draw. You see nothing else — not the full loop, not distant frames. You draw trying to make motion flow into and out of your slot.

**Host (shared):** shows all frames as filled/unfilled tiles and a live "stitch" progress, but does NOT animate the loop until everyone locks. On lock, the host plays the assembled frames as a looping GIF at ~8fps — the first viewing for everyone. It offers the GIF as a download: the keepsake.

The per-phone architecture is load-bearing because the fun IS drawing simultaneously with only your neighbors' live ghosts; a single passed phone collapses the parallel blind-seam mechanic entirely.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{seed, frames:[{index, ownerId, strokes:[...], locked}]}`. Strokes are vector polylines with timestamps. Sync strategy: each phone streams its stroke deltas to the server; the server forwards *only* frame N's strokes to phones N-1 and N+1 (ring adjacency) as throttled ~5fps onion-skin updates — never the full loop. Host subscribes to all frames for final assembly, rasterizing each to a canvas and encoding a GIF client-side (gif.js).

Genuinely hard part: **live adjacency streaming without leaking the whole loop.** The server must route stroke deltas selectively per subscriber and throttle to keep phone bandwidth/redraw cheap. Onion-skin opacity and coordinate normalization across phone screen sizes (draw in a normalized 0-1 space) matter for frames to actually align at playback.

## v1 scope
- 3 players, exactly 3 frames, one fixed seed prompt.
- Black single-brush drawing, live left/right onion-skin only.
- Lock all → host plays looping GIF → download.

## Out of scope
- Color, multiple brushes, undo history sync.
- Variable frame counts or fps control.
- Editing after reveal, gallery persistence.

## Risks & unknowns
- Onion-skin may not give enough info for satisfying motion continuity.
- Client-side GIF encoding performance on the host tab.
- Stroke-delta bandwidth if players scribble fast.

## Done means
Three phones each draw one frame with only their neighbors' live ghosts visible, and the host plays and downloads a single looping GIF that no participant saw complete beforehand.

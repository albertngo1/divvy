## Overview
Cel is a concurrent-room party game for 3–6 players. Each player privately animates exactly ONE frame of a single short looping animation on their phone, seeing only a faint onion-skin ghost of the frame immediately before theirs. When everyone commits, the host TV plays the assembled loop as an exported GIF — a group keepsake that is charmingly, uncontrollably wobbly because nobody ever saw the whole thing. No points, no winner: the artifact is the payoff.

## Problem
Collaborative drawing games (Gartic Phone, Eat Poop You Cat) are turn-based and serial — you wait, then watch. There's no game where a group makes a *moving* thing together in real time, and no small keepsake that captures the specific joy of a blind hand-off. Motion is the itch: a loop that breathes wrong is funnier than any still drawing.

## How it works
The host TV shows a shared prompt ('a cat jumps a fence', 8 frames) and, before the round, a live grid of frame slots filling in. Each phone is privately assigned one frame index. PRIVATELY, each phone shows: a full-screen canvas, a brush, and — critically — a faint grey onion-skin of ONLY the previous frame's committed strokes, pushed server-side to that phone alone. Frame 3 never sees frame 1 or 5. Players draw simultaneously against a soft 90-second timer, chasing continuity across a seam they can only half-see. On commit, the server unlocks the onion-skin for the NEXT phone in the chain (frame N's drawing becomes frame N+1's ghost). When all frames are in, the TV compiles the loop at ~6fps and plays it forward, then holds on a 'save GIF' QR keepsake.

The shared host screen shows only the slot-fill progress and the final loop; it never shows in-progress frames. Each phone shows only its own canvas plus its private predecessor ghost.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object) holds `{ roomId, prompt, frames: [{ index, ownerId, strokes[], committed }] }`. Strokes are vector polylines (point arrays + brush width), not pixels — tiny to sync and cheap to re-raster. On commit, server marks the frame and emits an `onionSkin` event carrying that frame's strokes ONLY to the socket owning frame index+1. Host subscribes to all commits; on full-set it rasterizes each frame to a canvas and encodes a GIF client-side (gif.js). The genuinely hard part is the dependency chain under a timer: if frame 3 commits late, frame 4's ghost arrives late — so v1 ships ALL predecessor ghosts as best-effort partial updates (live strokes streamed, not just on commit) so late chains still feel responsive.

## v1 scope
- 3 players, 3 frames, one prompt, one round
- Vector brush, single color, undo only
- Private per-phone onion-skin of the one prior frame
- Host compiles 3-frame GIF at 4fps + save QR

## Out of scope
- Multiple colors, layers, erase regions
- Frame counts beyond player count, sound
- Reordering / re-draws after commit

## Risks & unknowns
- Is a 3-frame loop enough motion to be funny? (probably needs 5–8)
- Live-stream ghosts vs. commit-only: bandwidth vs. responsiveness
- GIF encode time on host for larger frame sets

## Done means
Three phones each draw one frame seeing only the prior ghost; the host TV plays a looping 3-frame GIF assembled from them and shows a scannable link that downloads the GIF to a phone.

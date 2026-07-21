## Overview
Onion Skin is a 3-frame collaborative flipbook. Three to five players each draw ONE frame of a short looping animation on their own phone, blind to everyone except a faint onion-skin ghost of the single frame that comes *before* theirs. When the timer ends, the host stitches the frames into a looping GIF — a chaotic, wobbly little animation nobody could have authored alone. There is no score. The GIF is the point.

## Problem
Collaborative drawing games (exquisite-corpse, group doodles) either let everyone see the whole canvas (so it converges to boring consensus) or hide everything (so the pieces don't connect at all). The sweet spot is a *partial, directional* seam. Time is an under-used axis for that seam: what if the thing you connect to isn't the drawing beside you, but the frame just before you in a loop?

## How it works
The server arranges players in a ring and assigns each a frame index (0,1,2). During a 25-second draw window, every phone shows PRIVATELY: a full-opacity drawing canvas (single black brush, undo, clear) and, underneath it at ~15% opacity, a live-updating onion-skin of the frame *before* it in the ring — which is itself being drawn right now by another player. So you're chasing a moving ghost while someone downstream chases yours. You never see the other frames.

The shared host screen shows only a countdown and, at reveal, plays frames 0→1→2→0 at ~8fps on loop, then offers a GIF download and QR code. Because frame 0's ghost is frame 2 (the ring closes), the loop tends to *almost* connect — a hand reaches, a ball bounces, a face blinks — in gloriously wrong ways.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `room{players[], ringOrder[], phase}`, `frame[i]{ownerId, strokes[]}`. Sync strategy: each phone streams stroke deltas (point arrays) to the DO; the DO forwards each frame's strokes ONLY to the one downstream phone that onion-skins it, throttled to a ~10Hz downscaled snapshot to bound bandwidth. The genuinely hard part is the live ghost: every frame is a moving target for its follower, so latency must stay low enough that the ghost feels 'live' without leaking the full chain (each phone must receive exactly one upstream frame, never all of them). Reveal rasterizes all frames server-side and assembles the GIF (gif.js on host).

## v1 scope
- Exactly 3 players, 3 frames, one loop.
- Single black brush, fixed line width, undo + clear.
- 25-second fixed draw timer.
- 8fps loop playback + GIF download on host.

## Out of scope
- Color, layers, more than 3 frames, adjustable fps.
- Any scoring, guessing, or attribution phase.
- Reconnect/resume mid-draw.

## Risks & unknowns
- Ghost latency: if the upstream frame lags, the seam feels dead. Needs measuring over Tailscale Serve.
- 25s may be too short to draw anything legible; tune.
- GIF assembly time on a phone-grade host tab.

## Done means
Three phones draw simultaneously, each seeing only its upstream ghost update live; the host plays a 3-frame loop and exports a downloadable GIF that visibly shows at least one motion 'trying' to connect across the seam.

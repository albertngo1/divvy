## Overview
Flipbook is a couch co-op for 3–5 friends who want to *make something together* instead of beating each other. The whole room co-animates one short looping GIF, and the finished loop — downloaded to every phone — is the win. There is no score and no leaderboard; there's an artifact.

## Problem
Collaborative drawing games end with a static picture and a ranked winner, and nobody keeps anything. Worse, they're usually sequential: one canvas passed hand to hand while everyone else waits. There's no game that turns a party into a tiny animation studio where everyone draws at once and leaves with the same souvenir.

## How it works
The host picks a brief: a subject plus a motion arc ("a cat pounces," 9 frames). The server slices the frames into contiguous private spans — one per player (Player A owns frames 1–3, B owns 4–6, C owns 7–9). Each phone PRIVATELY shows: its own span's blank frames, a brush, and — critically — a live translucent ghost of the neighbor's boundary frame (A sees B's frame 4 as it's being drawn; B sees A's frame 3 and C's frame 7). Everyone draws simultaneously, matching only the seams they can see, never the neighbor's whole span. The shared TV shows the loop assembling: completed spans animate in place, unfilled spans are visible gaps, building anticipation. When all spans finish, the TV plays the full loop and every phone gets a Download button. That's the win.

Private (phone): your frames, your brush, the two edge-ghosts. Shared (TV): the assembling loop and a ribbon of which spans are done — but not the drawing detail until the reveal.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object over Tailscale Serve). Data model: `Room{brief, frameCount, spans:[{playerId, range, frames:[{strokes[]}]}], seams}`. A stroke is `{points[], width}`, appended as WS ops. Sync strategy: only *edge frames* need cross-phone liveness — the server relays a downscaled snapshot (stroke list or tiny PNG) of each span's boundary frames to the two adjacent phones at ~2 fps. Interior frames sync lazily. The genuinely hard part is this low-bandwidth edge-continuity relay plus deterministic assembly: host-side canvas render → gif.js, or server-side compositing. Latency tolerance is high because only boundary ghosts must be near-real-time.

## v1 scope
- 3 players, 9 frames (3 each), one fixed brief
- Monochrome single brush, no undo
- Live edge-ghost of adjacent boundary frames only
- One loop; export the same GIF to all three phones

## Out of scope
Color palettes, audio, multiple rounds, stroke undo/history, spectators, a saved gallery, variable frame counts.

## Risks & unknowns
Edge-ghosts may confuse more than help; phone drawing is fiddly; 9 frames may be too few to charm; GIF assembly perf on a laptop host; do seams actually line up or look like a ransom note.

## Done means
Three phones simultaneously draw their 3 frames each, the TV plays a continuous 9-frame loop, and every phone downloads the identical GIF keepsake.

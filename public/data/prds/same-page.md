## Overview
Same Page is a concurrent-room convergence game for 3–6 people. One shared host screen (TV/laptop) plus each player's phone as a private controller. Everyone silently hunts for a *visual Schelling point*: the one detail in a busy image that the whole room will independently choose to frame.

## Problem
Most convergence party games are abstract — sliders, meters, dots. They converge on nothing you can *see*. Same Page gives players a rich, shared visual world (a crowd scene, a cluttered desk, a Where's-Waldo tangle) but keeps every player's *viewpoint* private. Matching therefore requires guessing what bit of the picture is 'obviously' the interesting one — the itch of reading a room you can't talk to.

## How it works
Each phone privately holds the full high-detail image and a live pan/zoom viewport. You drag and pinch to frame a region. **Your phone shows:** the whole image, your live crop, a crosshair, and a bare convergence % (no direction hint — you must guess *where* the room is drifting). **The host screen shows:** a convergence meter and anonymized ghost rectangles representing everyone's *current frame position over a blank canvas* — never the image content, never who owns which box. So you cannot cheat by reading the shared screen; you can only infer that the room is clustering somewhere, not where.

The room wins when all crop rectangles overlap the same region (mean pairwise IoU above threshold) held for 2 continuous seconds. The host then zooms the real image to the agreed detail and reveals it triumphantly.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room {imageId, players:{id:{cx,cy,zoom,locked}}}`. Phones stream a throttled crop rect `(cx,cy,w,h)` at ~10 Hz. Server computes mean pairwise IoU across all rects → convergence %, and broadcasts the meter + anonymized boxes **to the host only**. Sync: authoritative server, last-write-wins per player, 10 Hz. The genuinely hard part is defining 'same detail' robustly — IoU across wildly different zoom levels is finicky, so we normalize by clamping min/max zoom and comparing overlap of center + area. Also: the identical image asset must preload on every phone before start.

## v1 scope
- One hard-coded busy image
- 3 players
- One round, no timer, no scoring
- Win = mean pairwise IoU > 0.6 held 2s
- Host reveal animation on win

## Out of scope
- Image packs / rotating decks
- Per-round scoring, timers, streaks
- Warm/cold directional hints
- Live device camera (this uses a fixed image)

## Risks & unknowns
- Image curation is everything: one dominant focal point = trivially easy; zero focal points = impossibly hard. Need scenes with 3–4 competing 'interesting bits'.
- Players zooming all the way out to game the IoU — cap minimum zoom.
- IoU tuning across zoom levels may feel arbitrary; needs playtesting.

## Done means
Three phones on separate devices each pan/zoom independently; the host meter climbs as they converge on one region; at IoU > 0.6 held 2s the host reveals the framed detail and declares a win — with no player ever having seen another's viewport.

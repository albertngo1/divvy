## Overview
Cel is a collaborative loop-animation toy for 3–5 people in a room. There is no score. The output is a shareable animated GIF — a keepsake that belongs to nobody and everybody — of a short loop the group made together without ever seeing the whole thing.

## Problem
Group art games end in a static picture. Animation is the fun thing nobody makes together because it's solo and tedious. The itch: co-author *motion*, and laugh at the drift when a shared loop is built blind.

## How it works
The server seats players in a ring and assigns an order. One 45-second draw window opens for everyone at once. Each phone is a tiny canvas for exactly ONE frame of an N-frame loop.

Privately, each phone shows: your blank frame, plus a faint, blurred, live 'onion-skin' ghost of the frame being drawn *right now* by the player immediately before you in the ring — streamed server-side at low fps. You try to make your frame a believable 'next step' from that ghost. But because everyone draws simultaneously, your predecessor's frame is itself morphing under your pen: a visual canon/feedback loop.

The host TV shows nothing mid-round but a 'developing…' spinner — the reveal is protected. When the timer ends, the server assembles all frames in ring order and plays the loop on the TV at ~6fps. Frame k relates to frame k-1, yet all were drawn at once, so the loop reads as coherent-but-absurd. Everyone saves the same GIF.

PRIVATE per phone: your canvas + your unique predecessor ghost (different for every player). SHARED on host: only the final assembled loop. A single passed-around phone cannot reproduce per-player, simultaneous live ghosts — that asymmetry is the whole game.

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { order:[playerId], frames:{ playerId: stroke[] }, phase }, stroke = { points, color, t }. Sync: each phone throttle-emits its current frame (~5–8 Hz, small full 256² canvas or stroke deltas); the server relays each player's latest frame ONLY to their single successor, not broadcast. Genuinely hard part: low-latency one-consumer frame streaming at low fps without melting phones, plus GIF assembly (gif.js client-side or server-side). Bound bandwidth with a 256px canvas and a 3-color brush.

## v1 scope
- 3 players, fixed ring
- One 45s simultaneous pass
- 3-frame loop, 256px canvas, 3 brush colors
- Host plays the assembled loop + a 'Save GIF' button on every phone

## Out of scope
- Variable frame counts, easing/timing controls, palettes, sound
- A second static-onion-skin fix-up pass
- Spectators, multiple rounds

## Risks & unknowns
Drawing-skill barrier; a moving-target ghost may confuse (mitigate with heavy blur + low opacity); a 3-frame loop might read as jitter rather than charm; GIF encode perf on phones. Open question: at only 3 players, is the 'canon' drift delightful or just noise?

## Done means
Three phones join, each draws for 45s while seeing its predecessor's live ghost, the host plays a 3-frame loop combining all three, and every phone can save the identical GIF. No numeric score appears anywhere.

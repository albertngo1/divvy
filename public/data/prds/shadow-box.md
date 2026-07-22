## Overview
Shadow Box is a 3-player concurrent-room drawing game where each player secretly paints a single *depth layer* — foreground, midground, or background — of one shared scene they never see assembled until the end. The output is a slowly-drifting parallax animation (a diorama in motion) that everyone can save. It's for friends who want to co-make something with real depth and genuine surprise, not a scoreboard.

## Problem
Collaborative drawing games flatten everyone onto one plane. Either you can see the others' marks (and just fill gaps politely) or you can't (and it's chaos). Neither gives you the *spatial* surprise of watching flat contributions reorganize into layered space. The itch: co-create one artifact where the reveal literally re-stacks what you made into depth nobody could picture while drawing.

## How it works
The host TV shows the shared scene PROMPT ("a harbor at dusk") and which player owns which layer. Each phone PRIVATELY shows: a blank canvas tinted to its assigned depth; a secret element brief (foreground: "something that shouldn't be this close"; background: "the thing everyone forgot was there"); and a depth-scale guide (foreground = draw big and sharp; background = draw small and hazy). No phone can see any other layer while drawing. During the 90s timer the host shows ONLY three ghost "occupancy" blobs — how full each layer is, never its content. On lock, the server z-orders the layers, ramps depth-of-field blur and atmospheric fade toward the back, and animates a slow horizontal camera pan so the layers parallax-separate. It exports a looping GIF/PNG keepsake. No points.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Objects). Data model: `room {sceneId, phase, players:[{id, layer, brief, strokes:[vectorPath]}]}`. Drawing is local-authoritative per phone; the server only stores strokes and broadcasts each layer's occupancy percentage. The genuinely hard part is the parallax composite — making a drift read as depth without any real 3D data. Approach: fixed parallax coefficients per layer (bg 0.2×, mid 0.5×, fg 1.0× of pan amplitude), gaussian blur scaled by depth, atmospheric alpha fade, then render canvas frames → client-side GIF encoder on the host.

## v1 scope
- Exactly 3 players, 3 fixed layers
- One prompt, one 90s draw timer
- Brush = single color + size
- Drift = one horizontal pan; GIF export

## Out of scope
- >3 layers or dynamic layer count
- Per-layer color palettes, undo history
- Sound, tilt-driven live parallax preview
- Persistent server-side gallery

## Risks & unknowns
Blind depth drawing may produce incoherent mush — mitigated by occupancy hints and the depth-scale guide. GIF encoding perf on a laptop host is uncertain. Flat vector art may make the parallax read cheap rather than magical.

## Done means
Three phones each blind-paint one layer, the host renders a drifting parallax loop combining all three, and every player can save the resulting GIF.

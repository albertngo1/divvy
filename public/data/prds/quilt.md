## Overview
A cooperative real-time drawing game for 3-4 co-located players. The room paints one continuous image (a mural, a stained-glass window) split into panels — one panel per phone — where your strokes must flow across the seams into your neighbors' panels. No points, no voting, no guessing: the win is the finished, framed image that lands on every phone as a keepsake.

## Problem
Exquisite-corpse drawing is beloved but async and blind — you never see how the pieces connect until the reveal, and the joke is that they *don't*. Party drawing games (Drawful) are really guessing games, and the art gets thrown away. There's no real-time co-op drawing game where the whole point is making the seams *disappear* — and keeping what you made. The itch: build one genuinely nice thing together, live.

## How it works
The host TV shows the full mural grid (e.g. 2×2 panels) and a shared subject ("an underwater city"). Each phone privately owns ONE panel and draws on it by touch. The crucial private view: your panel PLUS a thin strip of your neighbors' *edges* streaming in live — you see the lines poking across your shared borders so you can connect to them, but you cannot see or touch the rest of their panels. Everyone draws simultaneously under a 3-minute timer.

Host SHARED view: the assembling full mural updating live (the keepsake taking shape), the subject, the timer. The challenge is continuity: a coral branch you start has to meet the branch your neighbor is growing toward the same edge. At time-up the mural is "framed" — composited into one image and pushed to every phone. Optional co-op gate: the room taps "frame it" together, and any one player may request 30 more seconds, once.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { code, subject, phase, panels: {playerId → strokeList} }, where a stroke = {points[], color, width}. Sync: each phone streams its own strokes to the server; the server fans out to (a) the host at full resolution and (b) each neighbor, but ONLY strokes whose points fall within the shared-edge margin, transformed into that neighbor's coordinate frame. Genuinely hard part: real-time *edge-strip projection* — clipping each player's strokes to just the neighbor-visible margin and streaming them at interactive latency so seam-matching feels live, plus a consistent coordinate mapping across differently sized/aspect phones so seams actually align. Keepsake export composites all panels into one high-res PNG delivered to every phone.

## v1 scope
- 3-4 players, one 2×2 (or 1×3) grid, one subject, one 3-minute round.
- Single brush, ~4 colors, undo-last.
- Live neighbor edge-strip streaming.
- Framed-mural PNG to every phone at time-up.

## Out of scope
- Layers, fill, image stamps, custom grids, 5+ players.
- Any scoring/voting — pointless by design.
- Reconnection and spectator polish.

## Risks & unknowns
- Edge-strip latency: if neighbors' incoming lines lag, seams won't match and the core fun collapses.
- Coordinate mapping across phone sizes/aspect ratios could misalign the seams.
- Is "match the seam" enough fun without competition? Needs a playtest to confirm.

## Done means
Three phones join via QR, each draws its panel while seeing neighbors' edge lines stream in live, the host shows the mural assembling in real time, and at time-up every phone downloads the same framed-mural PNG.

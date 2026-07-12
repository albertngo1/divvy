## Overview
Overspray is a 3–5 player concurrent-room party game where the whole group collaboratively (and secretly at cross-purposes) paints a single graffiti mural. It's for people who like drawing games but can't draw — the constraints do the comedy. There is no scoreboard; the win condition is the finished mural itself, plus the reveal of how badly everyone's secret intentions collided.

## Problem
Co-op drawing games (Telestrations, Drawful) either pass one device around or give everyone a full blank canvas. Nobody feels the delicious tension of contributing to *one* shared surface while being unable to fully control it. Overspray makes the shared artifact literal and gives every hand a hidden, conflicting agenda.

## How it works
The host TV shows one blank 'wall'. Each phone is a spray can. Two things are PRIVATE per phone: (1) a **stencil mask** — an irregular hidden region; your paint only deposits where your stencil allows, so you can influence only your slice of the wall, and you never see your own mask outline, only where paint lands; (2) a **secret target card** — a simple line-art image ('a cat', 'a rocket', 'a house') that is *different for every player*. Everyone sprays SIMULTANEOUSLY for 90 seconds: drag on your phone to aim, hold to spray, pick from 4 colors. The shared TV shows the mural accreting in real time from all cans at once; overlapping sprays blend. Because each player can only reach their stencil zone and each is nudging toward a different picture, the wall becomes a beautiful argument. At time-out the host freezes the mural, then flips each player's secret target card onto the TV one by one — 'Priya was trying to make a CAT' — over the muddle they actually produced. The mural exports as a shareable PNG keepsake with everyone's conflicting intentions listed underneath.

Private phone shows: your live paint reticle, your 4 colors, a spray meter. Shared TV shows: the whole accreting wall and a countdown. Nobody sees stencils or targets until reveal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room{wall: pixelbuffer, players[]}`, `Player{id, stencilPolygon, targetImageId, color}`. Phones send spray events `{x,y,pressure,color,t}` at ~20Hz; server clips each event against that player's `stencilPolygon`, composites onto the authoritative wall buffer, and broadcasts wall deltas (dirty tiles, not full frames) to the host only. Phones are input-only — they never need the full wall, which keeps their bandwidth trivial. The genuinely hard part is real-time compositing at party latency without the host stuttering: chunk the wall into e.g. 32×32 tiles, coalesce sprays per tick, ship only changed tiles, and interpolate spray strokes server-side so a laggy phone still lays a continuous line.

## v1 scope
- 3 players, one 90-second mural, one round
- 4 fixed colors, 3 hand-authored stencil masks, 3 secret targets
- Reveal sequence + PNG export

## Out of scope
- Undo, brush sizes, more than 4 colors
- Judging/voting on whose target 'won'
- Reconnect mid-round, spectators

## Risks & unknowns
- Does stencil-limited spraying feel constraining-fun or just frustrating? Needs playtest tuning of mask size.
- Compositing latency with 5 simultaneous sprayers on a cheap host laptop.
- Blend math must make overlaps look like paint, not mud.

## Done means
Three phones spray one wall simultaneously for 90s with each phone confined to its hidden stencil; the host renders the live blended mural; at time-out it reveals the three divergent secret targets and exports a single PNG that all three players can save.

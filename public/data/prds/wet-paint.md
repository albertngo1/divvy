## Overview
A real-time silent territory-painting game for 3–4 players. The host TV shows one shared canvas; each phone is a private, invisible brush on it. It's for a group that likes co-op with teeth: you're on the same team, filling a wall, but you can't see each other's brushes and every overlap ruins shared progress.

## Problem
The itch is the "we both grabbed the same thing" cringe, made spatial and continuous. Most collaborative games let you watch teammates and dodge. Here the whole point is that you're blind to where the others are working, so you have to *infer* the empty space and stay out of it — coordination by avoidance, not by watching.

## How it works
The TV shows a blank rectangular canvas. Each player is assigned a color and drags a finger on their phone (a 1:1 mini of the same canvas) to paint. Your brush is invisible to everyone else, and on your own phone you see only YOUR trail. Goal: cooperatively cover ≥70% of the canvas before a 60s timer. BUT wherever two players' paint overlaps, that region turns to dead brown MUD — it counts against coverage and can never be repainted. Mud scars appear on the TV and your phone as feedback that you just collided with someone, but never who, and never where their brush currently is. So you must read where fresh mud blooms, guess the unclaimed regions, and silently carve non-overlapping territories.

Private per phone: your live brush position, your own trail, the mud you personally caused. Shared TV: the aggregate canvas (all colors + mud), coverage %, timer — and crucially NO live cursors, only laid paint, so you can't just stare at the screen to dodge; you infer from mud.

Per-phone is load-bearing: each brush is a private, simultaneous, continuous cursor, and the hidden-cursor inference IS the game. A single passed-around phone can't host three people painting at once.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Canvas is a coarse grid (e.g. 48×32 cells), each cell owner ∈ {empty, colorA…D, mud}. Phones send stroked cell coords at ~15Hz; the server resolves each write: empty→color, color(other)→mud, mud→stays mud. It broadcasts full-state cell deltas to the host and only own-cells + mud to each phone. Hard part: authoritative many-writer conflict resolution on the grid — overlap must deterministically become mud under near-simultaneous writes — plus cheap delta sync so the TV stays smooth and coverage % is computed server-side.

## v1 scope
- 3 players, one fixed canvas
- Drag-to-paint; mud on overlap
- 60s timer; coverage % + win/lose at 70%
- Blocky cells, three colors, no polish

## Out of scope
- Brush sizes, erasing/undoing mud, templates or reference images
- More than 4 players, saved-artifact export
- Any mobile art polish

## Risks & unknowns
- Inferring rivals from mud alone may be too hard/frustrating
- Grid resolution vs latency tradeoff
- Whether hidden cursors feel unfair
- Tuning the 70% threshold and mud penalty weight

## Done means
Three phones join via QR and paint simultaneously. Overlapping strokes deterministically produce mud on the TV within one tick; a coordinated disjoint fill reaches ≥70% clean coverage and wins, a sloppy overlapping one muds out and loses. Testable: two players paint the same corner → mud appears reliably; disjoint quadrants → clean win.

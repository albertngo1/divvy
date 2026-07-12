## Overview
Dovetail is a blind collaborative-drawing party game for 3 players. The host screen shows one wide picture split into three side-by-side panels; each player privately owns one panel and draws in it, never seeing the neighbors' panels. The room 'wins' by making the finished panels connect cleanly across the two shared seams — a river that flows unbroken, a horizon that lines up, a snake whose body crosses tile borders without a jump. It's a Jackbox-shaped game about silently agreeing on where the picture crosses a line you can't see.

## Problem
Most drawing party games are guess-the-doodle (Quiplash-with-pens). Nobody makes a game about the *seam* — the delight of two people independently drawing halves of the same thing and discovering they line up. That only works if each panel is genuinely private and drawn simultaneously.

## How it works
All players get the same one-line prompt ('a road going all the way across', 'a dragon stretched across the wall'). **Each phone privately shows:** its own blank panel (a canvas), the prompt, and a thin dashed 'seam edge' on the side(s) it shares with a neighbor — but nothing of what the neighbor is drawing. Players draw for 60s (Pass 1).

Then the server reveals to each phone ONLY a 12px-wide sliver of its neighbor's edge pixels — just enough to see where a line crossed the border, not the whole panel. Pass 2 (30s): everyone redraws to reconnect to the slivers they now see. That reveal-a-sliver-then-reconcile loop is the convergence: the room silently negotiates the seam over two passes.

**The host screen** shows a blurred/hidden collage during drawing, then assembles the three panels edge-to-edge and computes a **Connection Score** per seam (do stroke endpoints near the border match in position and color?), animating the seams 'snapping' green where they align.

## Technical approach
Host browser tab + phone PWA canvases + authoritative WebSocket server (PartyKit / Durable Object). **Data model:** `room{prompt, phase}`, `panel[playerId]{strokes:[{pts,color,width}]}`. Strokes stream as point batches; the server is authoritative on panel ownership and phase timing. **Sync strategy:** at the Pass-1→Pass-2 boundary the server extracts each panel's border band (rasterize the owned edge column) and pushes only that sliver to the adjacent phone — never the full panel. **Genuinely hard part:** seam scoring that feels fair and legible — matching stroke crossings within a tolerance band, robust to different colors/pressures, and rendering the 'snap' so players *understand* why a seam scored low.

## v1 scope
- 3 players, 3 horizontal panels, 2 seams, one round
- One fixed prompt, two passes (60s + 30s)
- Seam score = fraction of border-crossing strokes on both sides within tolerance
- Host assembly + green-snap reveal

## Out of scope
- 2x2 grids, >3 players, color/style matching beyond position, undo history, saving art

## Risks & unknowns
- Blind seams may look messy and unsatisfying; the sliver-reveal must give enough signal without giving away the panel
- Scoring could feel arbitrary — needs a tolerance that rewards 'close enough'

## Done means
3 phones each draw a private panel, exchange only edge slivers between passes, and the host assembles a strip whose two seams each show a numeric Connection Score with a visible snap animation on aligned crossings.

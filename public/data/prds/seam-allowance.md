## Overview

A 4-player, one-round drawing game where the phones are not controllers — they are the canvas *and* the final display. The room paints a single image split into four tiles, nobody ever sees the whole thing on a screen, and the artifact is the thirty seconds where four phones sit in a 2×2 on a coffee table and the picture is briefly real. Then someone photographs it, and that photo is the only copy.

## Problem

Every collaborative-drawing party game ends with a big composite on the TV — the phone was just a stylus, and the output is a JPEG in a folder nobody opens. The physical fact of four phones in a room is the most interesting hardware in the house and no game uses it as a display surface.

## How it works

**Calibrate (30s).** Each phone shows a white rectangle and asks you to hold a credit card against it and pinch until they match. This yields real mm-per-pixel per device, so tiles are drawn at true physical scale and line up across a mixed pile of iPhones and Androids.

**Paint (5 min, simultaneous).** The TV shows one prompt for everyone: *"the kitchen of a house nobody has lived in yet."* Each phone shows **only its own tile** — a full-bleed canvas with three brush sizes and six colors — plus a live 6mm strip of each adjacent neighbor's edge pixels along the shared borders. You can see where their railing arrives at your edge; you cannot see anything else they've drawn.

**The host TV shows only the seams**: a live plus-shaped diagram of the four internal borders, 12mm wide, rendered at scale. The room watches continuity succeed or fail in public and argues out loud ("whatever's coming into my top-left, keep it going down") without ever seeing an interior.

**Lay out.** On lock, each phone fills its screen edge-to-edge with its finished tile, max brightness, screen-sleep disabled. Players physically place the four phones in the 2×2 the TV diagrams. The TV counts down 30 seconds and instructs someone to take the photo. The server discards all tile bitmaps at the buzzer; it never composites them.

## Technical approach

PartyKit DO per room. Model: `room {code, prompt, layout: [[p0,p1],[p2,p3]]}`, `tile {playerId, strokes[], mmPerPx}`. Strokes are `{x_mm, y_mm, w, color}` in *millimeters*, not pixels — the whole design depends on a device-independent physical coordinate space.

The hard parts: (1) **edge-strip streaming** — each phone publishes only strokes whose bbox intersects its 6mm border band, at ~10Hz, so bandwidth stays tiny and interiors never leave the device except as border crumbs; (2) **physical alignment** — phone bezels and notches mean the drawn image has a gutter; v1 accepts a visible gutter as part of the look rather than fighting it; (3) **screen-brightness/color drift** across devices, which is a feature.

## v1 scope

- Exactly 4 players, 2×2, one prompt, 5-minute timer
- 6 colors, 3 brush sizes, undo, no eraser
- Credit-card calibration, 6mm edge strips, seams-only TV view
- No export, no compositing, no persistence — the photo is the user's problem

## Out of scope

- 3, 5, or 6-phone layouts; landscape phones; tablets
- Server-side composite render or gallery
- Pressure, layers, fill tools, images

## Risks & unknowns

- Calibration accuracy on cheap Androids; if mm-per-px is off by 5% the seams visibly step.
- People may not have the discipline to not peek over shoulders — the game leaks by neck.
- 5 minutes of drawing on a phone may be too long, or nowhere near enough.

## Done means

Four heterogeneous phones calibrate, draw four tiles in a shared millimeter space, show live edge strips to their neighbors and seams-only to the TV, and when laid in a square produce a picture whose lines cross the gaps within 2mm — with no composite bitmap existing on any server or screen.

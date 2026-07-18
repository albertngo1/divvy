## Overview
Kiln is a 3-4 player concurrent-room game where the group collaboratively sculpts one 3D vessel — a vase, a jug, a wobbling amphora — that becomes an exportable keepsake (PNG poster or STL for 3D printing). There is no score. The win is the pot itself, and the delight is that nobody saw it coming together.

## Problem
Most 'make a thing together' games let everyone see the shared canvas the whole time, so people just correct toward a boring consensus. The itch: make one physical-feeling object where each person's contribution is committed *blind*, so the artifact carries everyone's fingerprints and nobody can sand out the weirdness.

## How it works
The host TV shows a pottery wheel spinning a *veiled* lump of clay — a featureless silhouette that never reveals the actual profile during sculpting. The vessel is divided top-to-bottom into one horizontal band per player, assigned secretly.

Each phone PRIVATELY shows only: a vertical slider strip for its own band (8 control points controlling radius at each height), and a single 'seam tension' readout — a number/haptic pulse that says how sharply your band's edge disagrees with your neighbor's current edge, computed server-side. It does NOT show your neighbor's actual radius, only the mismatch. So you must *talk*: 'I'm flaring wide at my bottom, pull your top out to meet me.'

The shared host screen shows the veiled spinning lump and a global 'wonkiness meter'. After 90 seconds, everyone commits, and the host dramatically spins the *finished* vessel — a lathe-revolved surface through all bands — for the first time. Export as a keepsake.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object holding one room). Data model: `{ bands: [{ ownerId, radii: number[8] }], seams: computed }`. Phones stream radius edits (throttled ~15Hz). The server recomputes each shared seam (the boundary between adjacent bands) and pushes to ONLY the two adjacent phones the scalar mismatch — never the raw neighbor geometry. Host receives only the veiled state until the reveal event, which unlocks full geometry. Reveal renders a lathe surface in three.js (revolve the stacked radii, Catmull-Rom smoothed vertically). Export: canvas → PNG; optional STL from the revolved mesh.

Genuinely hard part: designing seam-tension feedback that is *useful* (enough to coordinate verbally) without leaking the whole profile — too much and it's just a shared canvas, too little and it's random. Second: lathe smoothing so blind mismatches look like intentional organic curves, not broken cliffs.

## v1 scope
- 3 players, exactly 3 bands, one 90-second round
- Fixed vessel height, 8 control points per band
- Seam tension as a single number + color
- Reveal spin + PNG export only

## Out of scope
- STL export, glazing/color, texture, multiple rounds, more than 4 players, mobile-host.

## Risks & unknowns
- Is blind radius editing legible enough on a phone slider? Needs a tactile control feel.
- Does the reveal actually delight, or just look broken? Smoothing is load-bearing.
- Verbal coordination may stall with shy groups.

## Done means
Three phones each sculpt one band blind for 90s, the host reveal-spins a single continuous lathe vessel combining all three, and the group can save a PNG of it — with no phone having seen the full profile before reveal.

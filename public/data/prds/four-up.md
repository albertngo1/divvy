## Overview

**Four Up** is a four-player cooperative game where the phones stop being controllers and become *the artifact*. Each phone displays one quadrant of a hidden image. Players physically arrange the four handsets face-up on a table until the mosaic resolves; the host laptop's webcam, pointed down at the table, confirms the layout and takes one photo. That photo — four glowing screens and eight hands — is the win condition. No score, no leaderboard, one JPEG.

For a living room with a coffee table and four people who own phones with different screen sizes. That mismatch is a feature.

## Problem

Party games render everything on the TV and leave the phones as dumb buttons. The most interesting surface in the room — four bright rectangles you can pick up, rotate, and slide against each other — goes unused. And nothing survives the game night.

## How it works

One round, ~4 minutes.

**Privately, each phone shows:** a heavily downsampled (16×16, blurred) rendering of *its own* quadrant of a source image, rotated by a random multiple of 90°, plus one text edge-clue naming what continues off one of its four edges ("my LEFT edge runs into a hand"). A phone never shows another phone's quadrant.

**The host screen shows:** the four edge-clues attributed to nobody, a live webcam feed with detected phone-screen rectangles outlined, and a big LOCKED/UNLOCKED state. It never shows the image.

Players talk, rotate their handsets (a two-finger twist rotates the on-screen quadrant, decoupled from the physical phone's orientation), and shove them together. Every 500ms each phone flashes a 3-frame color-ID sequence at low alpha; the host webcam does blob detection to recover each phone's centroid, rough orientation, and identity. When the four centroids form a 2×2 whose relative positions and per-phone rotations match the true layout, the server sends REVEAL: all four screens simultaneously switch to full-resolution, correctly rotated quadrants, the TV counts 3-2-1, and the webcam grabs a still. That still is the keepsake — QR-served to all four phones, then deleted from the server after 10 minutes.

## Technical approach

Host browser tab (webcam + canvas), phone PWAs, authoritative PartyKit Durable Object per room.

**Data model:** `Room { imageId, layout: [{playerId, quadrant:0-3, trueRot:0-3}], phase }`; `Phone { playerId, colorId, currentRot }`. Rotation state lives server-side; phones send `rot_delta`, never assert truth.

**Sync:** phones run a shared clock (NTP-style offset over WS, ±30ms) so the color-ID flashes are frame-aligned to the host's capture loop. Host samples webcam at 15fps, thresholds for the three ID hues, emits `detections[]` to the server at 5Hz; the server alone decides SOLVED.

**The hard part** is vision under a TV's flicker and mixed screen brightnesses: auto-exposure hunts, and a phone at 20% brightness vanishes. Mitigations: force `screen.wakeLock` plus max brightness prompt, use temporal differencing across the flash sequence rather than absolute color, and require SOLVED to hold for 3 consecutive frames.

## v1 scope

- Exactly 4 players, one 2×2, one hardcoded image
- Manual-claim fallback: tap your cell on a 2×2 grid if the webcam fails
- Reveal + single still capture + QR download
- No accounts, no persistence beyond 10 minutes

## Out of scope

3×3 layouts, player-supplied photos, phone-to-phone bump detection, printing, any scoring.

## Risks & unknowns

Webcam localization may be too flaky in dim party lighting — the manual fallback must be genuinely playable, not a consolation. Rotation-decoupled-from-physical-orientation may confuse people. Table space for four phones plus a laptop looking down at it is a real constraint.

## Done means

Four strangers, one table, no instructions beyond the TV: they assemble the 2×2 within 5 minutes, and all four phones hold the same photo of the moment it resolved.

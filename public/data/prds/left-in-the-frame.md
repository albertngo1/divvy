## Overview

A 3-5 player camera game for a room that's already physically together. The host TV shows an empty 5-panel filmstrip. Each phone is assigned one vertical slice of a single composite photograph and must physically go take that slice. The output is one stitched image — a group portrait shot by nobody, assembled from five people's separate camera frames. There is no score. The artifact is the win.

## Problem

Group photos are a chore: someone holds the camera and is therefore absent, or a timer runs and everyone freezes into a bad pose. Meanwhile every party generates a hundred phone photos that nobody ever looks at again. The itch: make the act of photographing the room itself the game, and end with exactly one image worth keeping.

## How it works

The host screen shows five empty panels side by side and a shared 90-second timer. Nothing else — no faces, no previews.

Each phone privately shows: (a) its panel index and a live camera viewfinder with a vertical crop guide, (b) a private **Frame Brief** describing what its slice must contain — "a slice with exactly two hands in it", "a slice where the ceiling is visible", "a slice containing someone laughing", (c) a private horizon line and an exposure target the phone must match, shown as a bubble level plus a live brightness bar.

Crucially, no phone can see any other panel. You cannot see whether your neighbour already captured the person you're pointing at. The room has to talk, physically arrange itself, and hand-wave each other into position while five people simultaneously line up five incompatible briefs.

One randomly chosen phone additionally gets a private **Ghost** flag: your secret goal is that no recognizable part of you lands in the final image, while still satisfying your own brief. You must be the one shooting, always. Nobody is told a Ghost exists until reveal.

On capture, the phone uploads a downscaled JPEG. When all five land, the host composites them left-to-right with a shared exposure normalization pass and does a big slow reveal — panel by panel. Then one question on the TV: "Who is missing?" Every phone privately names one player. The Ghost's success is announced, the poem-of-a-photo is exported, and a QR code on the TV lets everyone download it.

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object as the authoritative room.

Data model: `Room { code, phase: lobby|briefing|shooting|reveal|guess|export, players[], ghostId, panels: {playerId, index, brief, imageKey, exposureStats, capturedAt} }`.

Phones use `getUserMedia` with `facingMode: environment`, draw to a canvas at capture time, crop to the panel aspect ratio, and encode JPEG at ~q0.7 / 900px tall. Upload goes over HTTP POST to an R2 bucket (not the socket) with a presigned key issued by the DO; the socket only carries the key. Sync strategy is simple phase broadcast — the DO owns phase, and panel-captured events are idempotent by panel index so a re-shoot overwrites.

The genuinely hard part is **making five independently-shot frames look like one photograph**. Different phones mean different white balance, exposure, and rolling-shutter tint. v1 does a cheap fix: each phone reports mean luma and mean R/G/B of its frame; the host computes a target from the median and applies a per-panel gain via canvas `filter: brightness() saturate()` before compositing. It will not be seamless. Being visibly seamy is acceptable and arguably the charm — but if it looks like garbage instead of like a collage, the keepsake fails and so does the game.

## v1 scope

- 3 players, 3 panels, one round, one photo.
- 6 hardcoded Frame Briefs, drawn without replacement.
- Ghost role on exactly one player.
- Luma-only exposure normalization (no color matching).
- Host-side canvas composite, download via QR to a temporary R2 URL.
- Single "Who is missing?" guess, shown as a tally, no scoring.

## Out of scope

Face detection, seam blending, multiple rounds, retakes after reveal, printing, persistent galleries, any leaderboard, panels that aren't equal-width verticals.

## Risks & unknowns

iOS PWA camera permission inside a home-screen app is historically flaky — may need to run in Safari proper. 90 seconds may be far too short for five people to physically choreograph; likely needs 3 minutes. Briefs may be trivially satisfiable by pointing at a wall, which kills the coordination. The Ghost may be undetectable in a 3-panel game, making the guess phase hollow.

## Done means

Three phones in one room, given three different briefs, produce three uploaded slices within one timer; the host composites them into a single visibly-continuous-ish image; the Ghost appears in zero panels while at least one other player appears in two; and all three phones successfully download the same PNG from the QR code.

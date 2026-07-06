## Overview
Swatch is a fast camera-scavenger party game for 3-5 players sharing one room. Each phone becomes a private color-picker: it shows you a secret target color chip, and your job is to physically hunt through the actual room, point your camera at a real object, and hold steady until its live sampled hue matches your chip. Every match fills one tile of a shared mosaic on the host TV. The room's furniture, books, mugs, and clothes are the board.

## Problem
Camera games usually mean scanning QR codes or filming faces. Swatch turns the camera into a cheap ambient color sensor and makes the physical room the content — no props, no setup, just whatever's lying around. The itch: everyone scrambling at once, each chasing a color only they can see, so you can't just copy the person next to you.

## How it works
Each phone runs `getUserMedia`, draws the center of the video feed to a small canvas, and averages the pixels into a live HSV reading (a 'reticle' in the middle of the screen shows the current sampled color). PRIVATELY, each phone displays: your target chip, your live sample, and a 'warmth' proximity meter that heats up as your sample nears the target hue. It never shows anyone else's target.

The shared host screen shows the communal mosaic — a grid of empty tiles, one per target color across all players — and fills a tile the instant its owner holds a match (within hue tolerance) for 1.5 seconds. Cooperative v1 goal: fill the whole mosaic before a 90-second timer.

Because targets are private AND simultaneous, one phone passed around collapses the game into a slow serial checklist — the fun is the parallel scramble where four people fan out to four different objects at once. You literally cannot follow someone to their answer, because you don't know their color.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `room { players[], mosaic: tile[], phase, timer }`, `player { id, targetHSV, currentHSV, matchedAt }`. Phones sample the camera at ~8Hz, compute hue distance locally, and only post 'locked/unlocked' transitions (plus their live sample for spectator flair) to keep bandwidth tiny. Server owns the mosaic and timer; host renders it. Sync strategy: phone is sensor + local matcher, server arbitrates tiles, host displays.

Genuinely hard part: color is not a stable sensor. White-balance auto-correction, warm indoor lighting, and shadows shift the same object's measured hue dramatically. Mitigations: match on HUE ANGLE with generous tolerance (ignore saturation/value), a one-time calibration where each phone samples a known white surface, and picking target colors that are boldly distinct from each other.

## v1 scope
- 3 players, one private target chip each, one shared 3-tile mosaic.
- Center-reticle hue sampling + warmth meter.
- Hold-1.5s to lock a tile; 90-second cooperative timer.

## Out of scope
- Object recognition / ML; it's pure color.
- Competitive stealing, multiple rounds, difficulty tiers.
- Saturation/brightness matching or gradient targets.

## Risks & unknowns
- Auto white-balance may make matches feel arbitrary; needs real-lighting playtest.
- iOS camera permission + HTTPS + user-gesture gating.
- A drab monochrome room could lack enough matchable colors.

## Done means
Three phones in a normal room each get a distinct color chip, players fan out and fill all three mosaic tiles off real objects within the timer in a majority of test runs, with matches feeling earned rather than random.

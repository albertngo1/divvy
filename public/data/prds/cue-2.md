## Overview
Cue is a cooperative convergence game for 3 players. A short silent motion clip loops (a diver hitting water, a domino run toppling, a rocket clearing the tower). Each player privately scrubs their own timeline and drops a single pin on *the* moment — the splash, the first tile, liftoff. There is no scored 'right' frame; the room wins when everyone independently pins the same instant.

## Problem
Most timing party games are reaction tests — hit the button when the light flashes. That's reflex, not agreement. The itch here is the private, unspoken question every player argues in their own head: *which* single frame is THE moment? A domino run has no objective peak; a diver's splash spans 200ms. You have to model what your friends will feel is the instant, then commit alone.

## How it works
Host TV shows only: the clip title, a horizontal 'spread bar' (the gap between the earliest and latest pin, shrinking as the room converges), and a lock counter (2/3 locked). It never shows anyone's frame.

Each PHONE privately shows a full-width scrubber over a silent 8–12s clip that plays inline as you drag. You scrub freely, back and forth, and drop one pin. You can nudge it frame-by-frame with left/right taps, then LOCK. After locking you can't see others' pins — only that they've locked. Once all three lock, the host reveals every pin on one timeline and whether they fell inside a 3-frame (~100ms) window. Miss → the pins are cleared, the spread bar's best-so-far notch stays as a taunt, and the room re-scrubs. Win → the clip replays paused on the consensus frame.

Per-phone is load-bearing: the whole point is that you explore the timeline *blind to each other*. One shared phone would show everyone the same scrub position and destroy the private-commitment tension.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { clipId, players[], phase }`, `Player { id, pinFrame|null, locked }`. Clip is a pre-decoded silent MP4/WebM served to each phone; total frame count is fixed and known to the server. Sync strategy: phones send only `{pinFrame}` on lock; the server computes spread = maxFrame − minFrame and broadcasts that scalar plus lock count to the host — never individual frames until all locked. The genuinely hard part is frame-accurate seeking that's consistent across phones with different decoders: solve by driving the scrubber off `requestVideoFrameCallback` and snapping the pin to an integer frame index (not a float timestamp), so 'frame 137' means the same instant on every device regardless of playback jitter.

## v1 scope
- Exactly 3 players, one clip, one session.
- Single hardcoded clip bundled locally; one convergence window (100ms).
- Host screen = spread bar + lock counter + reveal. Phone = scrubber + pin + lock.
- Best-of-nothing: replay until they hit it, no scoring.

## Out of scope
- Clip library, difficulty tiers, audio clips (headphone problem).
- 4+ players, competitive scoring, rounds/leaderboard.
- Adjustable convergence window.

## Risks & unknowns
- Frame-seek consistency across iOS/Android video decoders is the make-or-break.
- The 'obvious' moment may be too obvious (trivial win) or too diffuse (never converges) — needs clip curation.
- Scrubbing a small phone timeline for frame precision may feel fiddly.

## Done means
Three phones join, each scrubs a silent clip and locks a pin; the host shows only the shrinking spread bar and lock count; when all three pins fall within 100ms the host reveals them on the consensus frame and declares the room synced, otherwise it clears and loops.

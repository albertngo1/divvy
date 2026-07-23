## Overview
Reframe is a 3-player cooperative convergence game about visual agreement. Everyone gets the same cluttered photograph and privately drags a viewfinder rectangle to frame the true subject — the thing everyone will agree the photo is 'about.' No talking; you win when the three crops overlap tightly. For groups who enjoy the wordless 'we all saw the same thing' click.

## Problem
Convergence games lean on words, taps, or timing. Visual attention is a rich, under-used Schelling space: a photo of a crowded market has one obvious focal point to most people, but not always the same one to everyone. Reframe turns 'where does your eye land' into a shared guessing game — and the private per-phone framing is what makes it work.

## How it works
The TV (shared) displays the round's photo at full size plus, during play, only an anonymized heat overlay: a translucent shading of how many viewfinders currently cover each region (0–3), never whose or the exact rectangles. It's ambient warmth, not a leaderboard.

Each phone (private) shows the SAME photo with a draggable, pinch-resizable viewfinder rectangle. You move and size it over the region you believe the group will also frame — the real subject. A size floor and ceiling stop degenerate 'select everything' or 'one pixel' answers. When satisfied you tap LOCK; your rectangle freezes.
Win condition: pairwise Intersection-over-Union of all three locked rectangles exceeds a threshold (e.g. IoU ≥ 0.55 for every pair). On win the TV reveals the three rectangles overlaid and zooms the shared intersection — the payoff is seeing three people independently frame the same tired dog asleep under the market stall.

Per-phone architecture is load-bearing: each player must privately choose a crop without seeing others' choices, simultaneously. One passed phone would leak framing intent and kill the blind-convergence read; the heat overlay only works because inputs are private and parallel.

This is distinct from picking a *moment* in a clip — Reframe is static spatial framing on a still image, judged purely by rectangle overlap.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `room{ photoId, phase }`, `player{ id, rect:{x,y,w,h}, locked }` in normalized 0–1 photo coordinates so every device agrees on framing regardless of screen size. Phones stream rect updates at ~8Hz for the live heat overlay; the server holds authoritative lock state and runs the IoU win check on lock. The heat overlay is computed host-side by rasterizing current rects into a coarse grid. Hard part is less about latency (low data rate) and more about fairness of the coordinate mapping: letterboxing the photo identically on every device and clamping rects to normalized space so a phone in portrait and one in landscape still compare apples-to-apples.

## v1 scope
- Exactly 3 players, one hand-picked photo, one round.
- Drag + pinch viewfinder with size clamps, lock button.
- Host heat overlay + overlaid-rectangles reveal with IoU result.

## Out of scope
- Photo library / rotation, difficulty tuning, multi-round scoring.
- >3 players, spectators, rematch.
- Auto-selecting photos with a 'good' focal point via ML.

## Risks & unknowns
- Threshold tuning: too loose feels unearned, too tight feels impossible.
- Some photos have two equally strong subjects, making convergence luck-based — needs curation.
- Pinch-zoom UX on small screens can be fiddly; may need coarse handle targets.

## Done means
Three phones load the same photo, each privately frames and locks a viewfinder in normalized coordinates, the host shows only a live heat overlay, and a round where all pairwise IoUs clear threshold triggers the overlaid-rectangles win reveal — verified end to end on real devices.

## Overview
Salvo steals the danmaku / bullet-hell genre and splits its two jobs — *authoring* a barrage and *surviving* one — across the table. For 3-5 players, each phone is simultaneously a bullet-pattern designer (for one neighbor) and a pilot dodging a completely different pattern (from another neighbor). Nobody dodges the same field.

## Problem
Bullet-hell is thrilling but stubbornly single-player: one player, one screen, one pattern. Its social potential — 'I built this hell specifically to kill *you*' — is untapped. And a passed-around phone can't do it: the fun requires every player dodging their own private incoming field at the same instant.

## How it works
Players sit in a ring. Each turn has two overlapping phases on **your phone only**:

1. **Design (10s):** the top half of your screen shows a blank arena. You place up to 3 emitters from 4 templates (spiral, aimed burst, sweeping wall, ring) and set aim/speed. This barrage will be fired at the player on your **left** — and you never see it play out.
2. **Dodge (30s):** the bottom half becomes a pilot arena. You drag your ship (or tilt, accelerometer) to weave through the barrage the player on your **right** secretly designed for you. Grazing bullets closely banks 'graze points'; getting hit costs a life.

The **host TV** shows only public aggregate: a ring of ship-dots with life/graze meters and a live elimination feed ('Maya went down to Sam's spiral'). It never shows anyone's actual bullet field. **Private per phone:** your incoming pattern, your ship position, your lives, your design canvas. This asymmetry is the point — you're reading your right-neighbor's cruelty in real time while gambling that your own design outlasts your left-neighbor.

One phone passed around cannot reproduce this: three-plus people must dodge three-plus different live fields simultaneously.

## Technical approach
Authoritative WebSocket server (PartyKit / Socket.IO over Tailscale Serve). Data model: `Player{ring position, lives, graze, shipPos}`, `Pattern{emitters:[{type,x,y,angle,rate,speed}]}`, mapping `left/right` neighbor edges. Sync strategy: bullet *positions are computed on each phone locally* from the deterministic emitter spec + a shared server clock (server broadcasts `startTick`), so we ship tiny pattern specs, not thousands of bullet coordinates. Phone reports only `shipPos` at ~15Hz plus hit/graze events; server is authoritative on collisions to prevent cheating. Hard part: deterministic bullet simulation that stays frame-synced across heterogeneous phones off one server clock — drift makes a graze on one device a hit on another. Fixed-timestep integer math + server-side collision reconciliation.

## v1 scope
- 3 players in a fixed ring (left = target, right = threat)
- One 30-second dodge round after one 10s design phase
- 4 emitter templates, max 3 emitters, drag-to-move only
- 3 lives, last-ship-standing or most-graze wins

## Out of scope
- Tilt/accelerometer control (drag first), bombs, power-ups
- More than one round, rotating the ring, boss patterns
- Fancy TV visuals beyond dots + elimination feed

## Risks & unknowns
- Cross-device frame sync: the make-or-break technical risk
- Small-phone dodging ergonomics (finger occludes ship)
- Design phase may feel abstract without seeing your barrage fire — need a 1s post-round replay of who you killed

## Done means
3 phones join, each privately designs a barrage for their left and dodges their right's barrage simultaneously for 30s, the server reconciles collisions authoritatively, the TV shows a live elimination feed, and grazes/hits register identically regardless of device — with no two players ever seeing the same bullet field.

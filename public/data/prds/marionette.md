## Overview
Marionette is a 3-5 player slapstick cooperative party game. One player is the Puppeteer, whose phone shows the entire stage — a floppy ragdoll and an obstacle course. Every other player controls exactly ONE limb of that shared body from their own phone, blind to the stage. It's QWOP divided among friends.

## Problem
Physical-comedy control games (QWOP, Getting Over It) are lonely solo struggles. The joke gets far funnier when a single body is split across a room of people — but that only works if each limb is a genuinely separate, private controller and nobody but the director can see the whole picture.

## How it works
**Puppeteer phone / host TV (the map):** side-view stage — a ragdoll made of connected limbs, a start line, a finish line, and obstacles (a gap, a low bar). The Puppeteer sees everything and can only TALK.
**Each limb player's phone (private):** a single control for their body part only. Legs get a "push" pad (swipe direction + force to kick/step); arms get grab/swing pads; torso gets a lean slider. They see NO stage — just their control and a tiny "tension" indicator showing the force on their joint.
Physics: the server runs a simple 2D ragdoll. Each limb's input applies a force/impulse to its own body segment. Because limb players are blind, they must obey the Puppeteer's shouted timing — "LEFT LEG, big kick NOW... right leg, plant it!" The body flops toward the finish. Falling in the gap resets to the last checkpoint; the goal is to drag the ragdoll across before a 2-minute clock.

Load-bearing: limbs move continuously and simultaneously, each is a separate private controller blind to the stage, and only the Puppeteer holds the map. Impossible with one passed phone.

## Technical approach
Host tab + phone PWA + authoritative WS server; the server owns the physics sim (~30-60Hz). Clients are dumb controllers plus renderers.
Data model: `Ragdoll{ segments:[{id,ownerLimb,x,y,angle,vx,vy}], joints[] }, course, checkpoint, clock`.
Sync: limb phones send continuous force-vector input at ~20Hz; the server steps a Box2D-style sim and broadcasts segment transforms to the Puppeteer/host only (limb phones don't render the body).
Hard part: stable, deterministic ragdoll physics under jittery multi-client input and latency — it must run authoritatively server-side and be forgiving (input smoothing, impulse caps) so it's funny-hard, not broken-hard. Mapping a variable player count onto a fixed limb set is the second wrinkle.

## v1 scope
- 3 players: Puppeteer + 2 legs (arms auto-limp).
- One flat course with a single gap and a finish line.
- 2-minute clock; checkpoint reset on fall.
- Verbal-only direction from the Puppeteer.
- Win screen when the torso crosses the finish.

## Out of scope
Arms/torso as separate players, multiple courses/levels, skins, scoring, replays, >5 players, any PvP.

## Risks & unknowns
- Ragdoll feel — could be uncontrollable garbage or delightful chaos; needs heavy tuning.
- Latency making impulses feel disconnected from the shout.
- Is 2-legs-only rich enough, or does v1 need arms?
- Frustration threshold when the body just won't cooperate.

## Done means
3 phones join; 2 players each drive one leg they can only feel (not see); the Puppeteer sees the full stage and calls timing; and a playtest can flop the ragdoll across one gap to the finish under the clock.

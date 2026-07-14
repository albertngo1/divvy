## Overview
Enfilade steals bullet-hell (danmaku) and inverts it: instead of one hero dodging a boss's guns, three-to-four players ARE the guns, and a single opponent is the dodger. It's for people who love the beautiful-menace of a Touhou pattern but have never been the one drawing it. Shared TV is the arena; each gunner's phone is a private turret.

## Problem
Bullet-hell is a lonely, high-skill solo genre. The gorgeous part—the *pattern*, the sweep of fire that corners a target—is authored by the game, never by players. And in a party you can't hand a bullet-hell around: it's one person, one screen. Enfilade turns the pattern itself into a group act of coordination.

## How it works
The TV shows a top-down arena with one glowing DODGER token, controlled by one player tilting/dragging on their phone (they see the full field—every bullet). The other players are GUNNERS. Each gunner's phone privately shows ONLY their own turret: a reticle they drag to aim, a fire button, a spread/charge cooldown, and a faint ghost of where their own last volley went—but NOTHING about the other gunners' reticles or cooldowns. On the TV, all bullets appear together as one converging storm. Because no gunner can see where the others are pointing, they must call it out loud—'I've got the left wall, you pin the top'—or their fire overlaps and leaves an escape lane. The dodger listens in on that chatter to predict the gap. One 75-second round; the dodger survives or gets clipped three times. Then swap roles.

## Technical approach
Host browser tab renders the arena via requestAnimationFrame canvas; phone PWAs are thin controllers. Authoritative WebSocket server (PartyKit / Durable Object) owns the simulation at a fixed 30Hz tick: it holds `{dodger:{x,y}, gunners:[{aim,cooldown,volleys}], bullets:[{x,y,vx,vy,ownerId}]}`. Phones send only intent (aim vector, fire press); the server spawns bullets and broadcasts a compact bullet delta. The genuinely hard part is fairness under latency: the dodger must react to bullets it can actually see, so the server timestamps spawns and the host interpolates, while collision is judged server-side with a small grace hitbox to avoid 'I dodged that!' disputes. Per-gunner private reticles never leave the server-to-owner channel.

## v1 scope
- 1 dodger + 3 gunners, one 75s round, one arena
- One turret type (aimed 3-round spread, 1.5s cooldown)
- Tilt-drag dodger movement, drag-aim gunners
- Server-authoritative bullets + hit count on TV

## Out of scope
- Multiple weapon types, charge shots, power-ups
- Score/leaderboard, multi-round matches
- Reconnect handling, spectators

## Risks & unknowns
- Latency fairness for the dodger is the whole ballgame
- Is verbal gunner coordination fun or just chaotic noise?
- Bullet density readable on a TV from couch distance?

## Done means
Four phones join; three gunners each see only their own reticle, the dodger tilts to move, and a playtest room can produce at least one round where gunners verbally close a gap and clip the dodger—provably impossible with one passed phone.

## Overview
Curtain steals the danmaku (bullet-hell) genre and makes it asymmetric party fare: one rotating "Boss" player authors bullet patterns in secret on their phone; 2-3 "Dodgers" each pilot a private micro-hitbox trying to survive. The shared TV is the arena the whole room watches fill with bullets. For groups who want a twitchy, gleefully-mean 3-minute game.

## Problem
Bullet-hell is a solo genre — thrilling to play, boring to watch, impossible to share around one screen. And party games rarely let one person be the *villain in real time*, hand-drawing cruelty while the others sweat.

## How it works
One player is Boss. Their phone privately shows a composition pad: they drag to set a spray's origin, direction, spread, and speed, and tap to fire it — **the Dodgers never see the pad**, only the bullets once they're live on the shared TV. Each Dodger's phone privately shows the same arena but centered/tuned for *their own* hitbox: a thumb-drag pad giving fine control of just their dot, with a subtle proximity-pulse when a bullet is about to graze them (info only they get). The TV shows the full arena with all bullets and all dodgers for the audience. Boss earns points per Dodger clipped; Dodgers earn points per second survived. One 90-second round, then the Boss role passes.

Per-phone is load-bearing three ways: the Boss's authoring must be *hidden* (a shared/passed phone would leak the next attack), each Dodger needs *simultaneous* private tactile control of their own dot, and each Dodger's proximity-pulse is individual. One phone passed around cannot deliver secret authoring plus three concurrent dodgers.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Server owns the bullet simulation: `Bullet{ pos, vel, spawnTick }`, `Dodger{ pos, alive }`, `SprayCmd{ origin, dir, spread, speed }`. Boss phone streams SprayCmds (~low rate); Dodger phones stream analog stick vectors at ~20Hz. Server steps physics at fixed tick, does circle-vs-point collision, and broadcasts authoritative bullet+dodger positions to the TV and (subset near them + own dot) to each phone. Hard part: real-time sync of a few hundred bullets to 3 phones + TV with sub-100ms feel; needs delta-encoded position frames and client-side interpolation, with the server as sole collision authority to prevent "I dodged that!" disputes.

## v1 scope
- 4 players: 1 Boss, 3 Dodgers, one round of 90s
- Boss has exactly 2 spray types (radial burst, aimed line)
- One rectangular arena, no walls/powerups
- Score = Boss clips vs Dodger survival seconds

## Out of scope
- Multiple bosses, boss health/phases, bombs or dodger powerups
- Pattern presets/library, replays, more than 3 dodgers
- Reconnection, spectator scaling

## Risks & unknowns
- Bullet-count sync to phones may jank on weak Wi-Fi.
- Boss authoring UI could be too slow to feel threatening in real time.
- Balance: a decent Boss may trivially wipe all dodgers.

## Done means
A Boss can privately compose and fire a bullet spray that appears on the TV without any Dodger having previewed it, three Dodgers simultaneously steer their own dots on their own phones, and the server authoritatively kills a dodger whose hitbox overlaps a bullet — reflected consistently on TV and phones within a round timer.

## Overview
Darkroom is a 3-6 player cooperative game for co-located groups who want to move through a space instead of tap a screen. The room's invisible light gradients — bright windowsill, lamp pool, closet dark, under-the-couch gloom — are the board. Everyone's phone is a private light meter, and together the group "develops" a photograph on the host TV.

## Problem
Phones ship with ambient-light and camera-lux sensing that no party game touches, and every room has a rich, free-to-use spatial light gradient that never gets played. The itch: a physical scavenger game where the thing you're hunting is invisible (light level), each player is chasing a *different* hidden target, and success is a shared, satisfying reveal rather than a leaderboard.

## How it works
The host TV shows a blurry, under-exposed "latent image" and a row of ghosted exposure pins, one per player. Each phone privately shows three things nobody else sees: (a) a secret target brightness band on a dark→blazing meter, (b) a live lux reading from its camera, and (c) warmer/colder feedback as you move. Players physically roam the room to park their phone where its live lux lands inside its private band, then lock. Each lock sharpens one region of the shared photo; everyone locked before the timer = fully developed = win. The private target is the whole point: my band might be "near-dark" (find a closet or cup my hands over the lens under a coat) while yours is "blazing" (windowsill, or beg a friend to aim their flashlight). Different bands force different micro-locations, so one phone passed around physically cannot hold two exposures at once — every player must be somewhere different, simultaneously.

## Technical approach
Host browser tab + phone PWA + WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, photoState, players[]}; Player{id, targetBand:[lo,hi], liveLux, locked}. Sync: phones sample lux ~4Hz via getUserMedia → canvas → average luma (Ambient Light Sensor API as progressive enhancement where available), sending throttled liveLux; the server computes locked/win and broadcasts photoState plus pin states to the host only — target bands never leave the phone. The genuinely hard part is lux normalization across wildly different phone cameras and their aggressive auto-exposure: a per-phone calibration (cover the lens = floor, point at a white frame on the TV = reference) makes bands comparable, and locking camera exposure via track constraints where supported stops auto-exposure from fighting the player.

## v1 scope
- 1 photo, 3-4 players, one 90s round
- Camera-luma only; 3 fixed bands (dark/mid/bright)
- Lock = hold in-band for 2s
- Cover-and-point calibration; win/lose screen

## Out of scope
Multiple photos, competitive scoring, flashlight-sabotage duels, moving targets, native apps.

## Risks & unknowns
Camera-lux reliability and camera-permission friction; auto-exposure overriding readings; rooms lit too uniformly to offer real gradients; whether "find a light spot and hold it" stays fun for 90s or turns fiddly.

## Done means
Four phones in a normal living room each calibrate, find, and hold their private band by physically moving to distinct spots, the TV photo visibly develops region-by-region, and all-locked triggers the win screen — inside two minutes, first try.

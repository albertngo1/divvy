## Overview
Rubberneck is a 3-player cooperative convergence game for a living room with a TV and phones. A single busy, detailed scene sits on the host screen (a crowded beach, a cluttered desk, a street festival). With no talking, each player must silently guess the ONE spot in the scene that everyone's attention is magnetically drawn to — the Schelling point of a glance — and tap it. Win only if all three taps cluster tightly.

## Problem
Most 'guess where people look' games are either solo (heatmap toys) or reveal choices instantly, killing the tension. The delicious itch is committing to 'obviously THAT spot' in secret and finding out whether your certainty is shared. That only works if nobody can nudge anyone.

## How it works
The host TV shows the full scene, unmarked, as a shared anchor. Each phone shows the SAME scene but as a privately pannable/zoomable canvas, and — crucially — each phone starts panned to a different random corner, so nobody can coordinate on 'top-left' or copy a neighbor's obvious framing. You explore privately, then drag a single crosshair and lock it.

Privately on each phone: your own crosshair, a zoom control, a LOCKED button. The host screen shows, during play, only how many of 3 players have locked (three dots filling in) — never where anyone tapped. On reveal, the host overlays all three crosshairs and draws the smallest circle containing them; if that circle's radius is under a threshold (say 4% of image width), the room wins and the scene 'blooms' at the consensus point. Otherwise it shows the spread and you get another scene.

The fun is the shared visual anchor with strictly private commitment: a lone weird bright object, a face mid-scream, the one dog looking at camera — you feel the pull, but so does everyone, and the question is whether your read of 'the obvious thing' is the group's.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room { sceneId, phase, players[{id, locked, point:{x,y} normalized 0..1}] }. Scenes are static high-res images with a precomputed natural size. Sync: phones send only {locked:true, point} on commit; server withholds all points until phase==='reveal', broadcasting only the lock-count during play. The genuinely hard part is trust, not latency — the server must never leak points early, and must normalize coordinates against the image's intrinsic dimensions so per-phone pan/zoom is purely cosmetic. Radius check is done server-side at reveal so no client can fake a win.

## v1 scope
- 3 players, one fixed scene, one round.
- Hardcoded win radius; single reveal animation.
- Pan/zoom on phone; single crosshair; lock button.
- Host shows lock-count during play, overlay + circle at reveal.

## Out of scope
- Scene library, difficulty tuning, scoring across rounds.
- Handling >3 players or player drop/rejoin.
- Curated 'good Schelling scene' authoring tools.

## Risks & unknowns
- Some scenes have TWO equally obvious spots — great tension or frustrating stalemate?
- Threshold calibration: too tight = never wins, too loose = trivial.
- Per-phone random pan may just annoy rather than prevent coordination.

## Done means
Three phones join a room, each explores the same scene from a different start position privately, all lock a point; the host reveals three crosshairs and a bounding circle, and correctly declares win iff the circle radius < threshold — with no point ever visible before reveal.

## Overview
Lantern is a 3-5 player convergence game for a living room with a TV and phones. A single dense, detailed image is hidden in darkness. Everyone explores it alone through a small movable light on their own phone, then silently commits to the one spot they believe the whole room will converge on. It's a Schelling-point hunt where the map is real and the searching is genuinely private.

## Problem
Most "guess what others picked" games hand everyone the same static view, so convergence collapses to whoever shouts first or to the obvious center. The itch: a matching game where you literally cannot see what your friends are looking at, so agreement has to be intuited, not negotiated. Fog of war makes the silence load-bearing.

## How it works
The host TV shows a black rectangle — a rich scene (a grey crowd with one red balloon; a cluttered desk; a night skyline) lives underneath but is 95% unlit. Each PHONE privately shows that same scene, also black, except for a soft circular "lantern" (~15% of the frame) that the player drags with a finger to reveal the scene locally. Every player's lantern position — and therefore what they've seen — is private and different. Nobody knows which patches anyone else has uncovered.

The brief on every phone: *"Light up the one spot everyone else will light up too."* Players sweep around for 25 seconds hunting the most striking detail, betting others will find it. At the buzzer each phone locks its lantern center as a hidden pin. The host then fully illuminates the scene and drops all pins simultaneously, drawing the smallest circle containing them. If every pin falls within a target radius, the room wins and the scene stays lit as a little shared trophy; otherwise the pins scatter and the balloon everyone missed is spotlit.

PRIVATE per phone: your lantern position, your revealed patches, your pin. SHARED on host: only darkness during play, then the full reveal + convergence circle. No live positions leak — the exploration is truly solo.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { sceneId, phase, players: { id, name, lanternXY, pinXY|null } }`. Scene is a single static image shipped to all clients; masking is done client-side with a radial gradient over a canvas, so no pixel streaming. During play, phones send throttled `lanternXY` only to the server for liveness/timeout, never rebroadcast to peers. On timer end the server collects `pinXY`, computes the centroid and minimum enclosing circle, and emits the reveal event. Genuinely hard part: authoring scenes with exactly one honest salient Schelling point (not zero, not three), plus a clean synchronized lock-and-reveal so no phone reveals early. Real-time load is trivial; the design work is the scene.

## v1 scope
- One hand-authored scene with a single obvious-in-hindsight hotspot
- 3 players, one 25-second round
- Client-side lantern masking, drag to move
- Server computes enclosing circle; binary win against a fixed radius
- Reveal screen with pins + circle

## Out of scope
- Multiple rounds / scoring across rounds
- Zoom, multiple lanterns, scene packs
- Live glimpses of others' lanterns
- Mobile-camera or user-supplied scenes

## Risks & unknowns
- Scenes may have no clear Schelling point (unwinnable) or a trivial one (boring) — needs playtesting
- Small phone screens may make sweeping tedious; lantern size/scene scale need tuning
- 3 players is a thin convergence signal

## Done means
Three phones join a room, each independently reveals a different part of one hidden scene, all lock a pin, and the host shows every pin plus a convergence circle with a correct win/lose verdict — with no phone ever seeing another's lantern.

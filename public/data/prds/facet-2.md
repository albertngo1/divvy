## Overview
Facet is a 3-player cooperative party game where a real object at the center of the table is the board and the ring of seats around it is the mechanism. Each player's phone back-camera can only see the faces of the object currently pointed toward their seat. The group's shared goal: get every marked face of the object 'captured' by *someone's* camera before the timer runs out — which means constantly rotating and re-aiming the object so its hidden faces swing into view of a seat that can see them. For people who want a cooperative, physical, talk-your-way-out puzzle.

## Problem
Camera party games are usually solo scavenger hunts. The itch: a game where the camera is load-bearing *because you're all pointed at the same thing from different angles* — nobody has the full view, and the fun is negotiating around each player's literal blind spots.

## How it works
Place a small object with four colored/QR-tagged faces (a mug, a toy — the game ships printable stickers) in the table's center. Each player sits at a fixed side and points their phone's back camera at it. Each phone PRIVATELY shows its own live camera feed plus tiny 'you can see: ●●' dots for whichever tagged faces its lens currently detects. The host TV shows a collective checklist of the four faces — grey until captured, green once any phone holds a clear read of that face for 1.5s — but it NEVER shows *who* can see what. Since some faces point at the wall or straight down (visible to nobody), players must call out ("I've got red and blue, someone turn it toward Sam") and physically rotate the object. Win when all four faces go green within 90s. Passing one phone around defeats the point — the whole tension is three simultaneous fixed viewpoints.

## Technical approach
Host tab + phone PWAs + WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: Room{faces[4]{captured, byWhom}, timer}; Player{seat, visibleFaces[]}. Phones run `getUserMedia` → canvas → a lightweight per-frame detector: jsQR for QR-tagged faces or a coarse hue-blob classifier for colored stickers, emitting {faceId, confidence} at ~5fps. The sync strategy is trivial fan-in — phones stream detected-face events; server debounces (1.5s sustained read) and broadcasts the checklist. The genuinely hard part is robust face detection across angles and lighting on mid-range phones without heavy CV: v1 leans on high-contrast QR/AprilTag stickers so 'do I see this face' is a cheap, reliable boolean rather than fuzzy matching.

## v1 scope
- 3 players, one object, four tagged faces, single 90s round.
- Printable sticker sheet; QR-based face detection only.
- Binary captured/not on the host checklist.

## Out of scope
- Untagged / arbitrary real objects via real CV.
- Competitive scoring or multiple objects.
- 3D reconstruction / actual scanning output.

## Risks & unknowns
- Glare and low light may drop marker reads — needs decent room lighting.
- Getting-up-and-leaning may let one player cheat multiple faces, softening the blind-spot tension; seat discipline is a house rule.
- Fun may hinge on the object shape offering real hidden faces.

## Done means
Three phones ringed around a four-face tagged mug; rotating the mug turns a grey face green on the TV when exactly the seat now facing it holds the read for 1.5s, and no single phone can green all four without the others.

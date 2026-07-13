## Overview
Go Around is a 3–5 player concurrent-room party game for the Jackbox-shaped setup: a shared host runway on the TV, every player's phone a private cockpit. It's a mutual-exclusion nerve game — everyone desperately needs the single runway, and using it at the same moment is catastrophic.

## Problem
Most 'don't collide' party games let you see the whole board, so avoidance is just reflexes. The itch here is *hidden urgency*: you can tell the runway is busy, but you can't tell how close anyone else is to flaming out — so you can't know whether they'll gamble the same window you're eyeing. Coordination would trivially solve it; the game forbids it.

## How it works
Each player is an inbound plane. On a shared clock, planes drift down their own approach corridors toward one runway.

**Each phone shows PRIVATELY:** your plane's position on final approach (a vertical strip), your FUEL gauge (starts staggered per player and only you can see it), and one big **CLEARED TO LAND** hold-button. Fuel drains continuously; at zero you crash on your own (a loss). To land, you hold the button while over the threshold for 1.5s.

**The host TV shows PUBLICLY:** the runway from above, all planes as blips on their corridors, and a single occupancy light — GREEN (runway clear) or RED (someone committed). Crucially the TV never shows anyone's fuel.

The runway holds exactly one plane. If a second player commits their landing while the light is RED, both planes collide — a public fireball, both eliminated. If you're low on fuel you're *forced* to gamble a tight window; everyone else must read the occupancy light and guess whether a desperate pilot is about to dive in front of them. A voluntary 'go around' (release, re-enter the approach queue) costs fuel but avoids a crash.

Round ends when everyone has landed or died. Clean landing = score by fuel remaining; crash/flameout = zero.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object; Socket.IO over Tailscale Serve for local).

**Data model:** `Room{planes:{id, corridorPos, fuel, state:'approach'|'committing'|'landed'|'dead'}, runwayOccupantId|null, clock}`. Fuel and corridorPos are server-authoritative; only the owning phone is sent its own fuel.

**Sync:** server ticks at 15Hz, advancing corridorPos and draining fuel. Phones send `commit`/`release` events. Server resolves landings: first `committing` plane over threshold claims `runwayOccupantId`; any second commit while occupied → both flagged `dead`, broadcast fireball. Host renders from a public state slice (positions + occupancy light, no fuel); each phone gets a private slice (its own fuel).

**Genuinely hard part:** the collision-resolution window under latency — two near-simultaneous commits must deterministically both die (not race to one winner). Server timestamps commits on receipt and treats any overlap inside the 1.5s hold as a mutual crash, so lag can't save you — which is thematically correct.

## v1 scope
- 3 players, one round, ~90 seconds.
- Straight-line corridors, no wind/turns.
- Fixed staggered starting fuel; single runway.
- Host: top-down runway + occupancy light + fireball animation.
- Phone: approach strip, fuel gauge, hold-to-land button.

## Out of scope
- Multiple runways, taxiways, weather, blinker-style signaling.
- Persistent scoring across rounds, lobbies, spectators.

## Risks & unknowns
- Is hidden fuel enough tension, or do players just wait safely? (Tune drain rate so waiting is fatal.)
- Latency fairness on public wifi.
- Reading a single occupancy light may feel thin — may need a subtle 'plane descending fast' visual tell.

## Done means
3 phones join from a QR code; three planes approach with private fuel; a forced low-fuel dive that overlaps another commit produces a public fireball killing both within one tick; an unopposed hold-to-land scores by remaining fuel; round ends and shows a scoreboard.

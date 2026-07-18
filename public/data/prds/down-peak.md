## Overview
Down Peak is a real-time cooperative dispatch game for 3 players, each secretly driving one elevator in a shared building during a down-peak rush (everyone heading to the lobby). Two cabs arriving at the same floor is a wasted, penalized trip — so the group must silently divide the floors between them. Coordination (both serving the same call) is the failure. For friends who like tense operations under fog.

## Problem
Anti-coordination games are usually static, one-shot picks. Down Peak makes anti-coordination continuous and spatial — a live dispatch problem drawn from real elevator "down-peak" traffic engineering, where the losing move is two operators redundantly answering the same call while other floors pile up.

## How it works
The host TV shows the shaft: floors 1-8 with call buttons lighting as passengers arrive, plus a delivered counter. It shows the call board and aggregate progress, but NOT each cab's exact position or who's whom (cabs are anonymous ghosts). Each phone PRIVATELY shows your own cab's floor, door state, passengers aboard, and the full active-call board. You tap up/down to move one floor per tick and "open" to load/unload. Catch: if two cabs open on the SAME floor in the SAME tick, it's a collision — passengers scatter, both cabs eat a delay penalty, and the call is NOT cleared (jam). You can't see the other cabs' floors — only a proximity buzz when a cab is adjacent. Goal: deliver all N passengers to the lobby within 90s; win = all delivered with ≤1 collision.

Private per phone: your cab's position/load + private proximity hint. Shared: the call board + delivered count. Load-bearing: three hidden cabs piloted simultaneously can't be reproduced by one passed phone.

## Technical approach
Authoritative WS server (PartyKit). Model: `building {floors, calls[], delivered}`, `cab {id, floor, dir, load, doorTick}`. ~1s tick; phones send intents (`moveUp`/`moveDown`/`open`); server integrates, detects same-floor same-tick opens as collisions, updates calls. Broadcast: host gets calls + delivered + anonymized cab glyphs; each phone gets its own full cab state + an adjacency flag. Server-authoritative tick loop with client-side reconciliation for own cab. Hard part: defining the collision window cleanly and tuning call-spawn rate against 3 cabs so anti-coordination actually bites (too few calls → forced collisions; too many → coordination unnecessary), plus giving just enough proximity signal to dodge without full visibility.

## v1 scope
- 3 players, 8 floors, one 90s down-peak rush, ~9 passengers.
- Phone: floor readout, up/down/open, call board, proximity buzz.
- Host: shaft with call lights, delivered counter, win/lose.

## Out of scope
- Multiple buildings, up-peak/interfloor traffic, express zones, capacity tuning, reconnection, competitive scoring.

## Risks & unknowns
- Could feel like solo Elevator Saga if collisions are rare — tune spawns so cabs naturally converge on low floors.
- "No full visibility" may frustrate rather than intrigue; the proximity buzz must read clearly.
- Discrete tick vs continuous movement feel.

## Done means
3 phones + host on a LAN; calls light on the TV; each player moves a private cab and loads passengers; two cabs opening on the same floor same tick shows a collision penalty and fails to clear the call; delivering all passengers with ≤1 collision triggers a win.

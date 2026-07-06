## Overview
Setback is a blind, real-time land-grab for 3-6 players around a shared TV. Each phone is a private plot of land you expand across a field you can barely see; the whole game is the anti-coordination dread of grabbing space greedily while fearing the neighbor you can't locate.

## Problem
Most party games reward reading the room. This one punishes it. The itch is the specific adrenaline of committing to territory blind — the near-miss buzz warning you someone is right there, the gut call to keep pushing or pull back. Co-op games ask you to converge; here, converging is a mutual wipeout.

## How it works
The host screen shows a rectangular field with N colored seeds scattered (one per player) and a 45-second timer. During play it renders ONLY a fogged, low-res heat blur — enough for spectacle, not enough to plan from.

Each phone privately shows a zoomed view centered on YOUR seed. Drag outward to claim cells (your flood-fill edge grows as you hold). Your claimed area glows bright; every other player's territory is invisible to you — except a metal-detector signal: as your frontier nears another player's cells, your phone buzzes and a private proximity bar rises. Overlap is the failure: any cell claimed by two or more players turns 'contested,' is deleted from BOTH owners, and deducts a penalty. Your score is cells you solely own.

At time-out the host defogs: the full map animates in, contested zones flash red and evaporate, solo territory tallies. Biggest clean plot wins.

Private per phone: your seed, your cells, proximity bar/haptic, live solo-area count. Shared: fogged blur, timer, then the reveal.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Cloudflare Durable Object) over Tailscale Serve. Field is a coarse grid (e.g. 30×30). Model: `cells: Map<cellId, ownerId | 'contested'>`, `players: {id, seedCell, claimedCount}`. Phones send claim intents (cellIds from drag) at ~10Hz; the server is authoritative — unowned cell → assign; already owned by another → mark contested, decrement both. The server pushes each phone a private delta: its own cells plus a proximity SCALAR = min distance from its frontier to any foreign/contested cell (computed server-side so a phone learns how close, never which direction). Host receives only aggregate density for the blur. Hard part: 10Hz authoritative conflict resolution for 6 phones without leaking neighbor position, and tuning the directionless proximity feedback so it warns without pointing.

## v1 scope
- 3 players, one 30×30 field, one 45s round.
- Drag-to-grow, haptic + bar proximity, contested-cell deletion, defog reveal.
- QR join over local Wi-Fi/Tailscale, no accounts.

## Out of scope
- Multiple rounds, persistent scoring, obstacles/shapes, spectator mode, mobile-data play.

## Risks & unknowns
- Does directionless proximity feel fair, or maddening? Playtest the buzz curve.
- 10Hz conflict resolution latency under real Wi-Fi.
- Grid coarseness vs. drag precision on small screens.

## Done means
3 phones join via QR, all grow simultaneously, at least one contested-cell mutual-deletion fires with a haptic warning beforehand, the defog reveals correct solo tallies, winner declared — one round start to finish in under 90 seconds.

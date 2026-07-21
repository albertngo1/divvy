## Overview
Near Miss is a real-time air-traffic collision-avoidance party game for 3–5 players in a room. The host TV is a shared radar scope; each player's phone is the cockpit of exactly one aircraft. You collectively survive by NOT touching each other while each pilot reaches a destination only they can see.

## Problem
Most party games reward agreement — matching, converging, piling onto the obvious answer. Near Miss punishes it. The itch it scratches is the white-knuckle thrill of watching blips drift toward each other on a radar, knowing your instinct (take the nearest open lane) is the same instinct everyone else has, which is precisely what causes the pileup.

## How it works
Each phone shows a dark cockpit: a virtual thumbstick that steers your plane's heading, your own blip and heading vector, and — critically — a PRIVATE glowing gate marker ("Gate C") that only you can see, placed somewhere on the field. Planes fly at a constant speed; you only control heading. The host TV shows the full radar: every plane's blip and trail, public to all — but NO gates. When two planes enter the same radar cell, both crash and the round ends. Win = all planes parked at their private gates, zero collisions, before the 60s clock runs out.

Because the radar is shared but destinations are hidden, you can see a convergence forming but can't tell whose path truly conflicts with yours until the last second — so you bank early, blindly, out of everyone's way.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `room { planes: { id, x, y, heading, gateId, alive } }, gates[]`. Server ticks at 20–30 Hz: it integrates each plane's position from that phone's latest heading intent, runs collision detection (grid-cell or distance threshold), and broadcasts a world snapshot to the host plus each phone's own-state privately. Phones send only heading intents (low bandwidth) and client-side predict their own plane for responsiveness while the server reconciles. The genuinely hard part is fair collision under variable phone latency — a crash must feel earned, not lag-inflicted; the server is sole authority and input latency is normalized against measured RTT.

## v1 scope
- 3 players, one 60-second round
- Fixed square airspace, 3 private gates
- Thumbstick steering, constant speed, no fuel
- Any collision ends the round instantly with a replay button

## Out of scope
Obstacles, weather, fuel/scoring, levels, more than 5 planes, spectator mode, deep mobile-perf tuning.

## Risks & unknowns
Latency fairness (a laggy crash feels cheap); steering feel on small screens; whether pure avoidance is fun or just tense; radar readability as blips multiply.

## Done means
Three phones each steer a distinct plane on one shared radar; two planes touching ends the round visibly; all three reaching their private gates fires a win screen; a plane's gate never appears on the shared radar.

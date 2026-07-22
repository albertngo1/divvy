## Overview
Curtain is a cooperative danmaku (bullet-hell) party game for 3 players sharing lives against a single boss. The host TV shows the whole bullet curtain; each phone is a private, zoomed-in radar of only the danger immediately around that player's ship. It's for friend groups who want the panic of Touhou without needing arcade-stick reflexes on one screen.

## Problem
Bullet hell is thrilling but unwatchable on a shared screen — with three ships on one TV, nobody can track their own dot in the noise, and passing a controller kills the co-op. The itch: distribute the chaos so each person owns a survivable slice, and force the group to talk about incoming patterns.

## How it works
The boss (top of the TV) fires telegraphed "spell cards" — radial waves, aimed streams, spiraling lasers. Three ships live at the bottom, sharing a pool of 5 lives.

PRIVATE (each phone): a zoomed viewport centered on YOUR ship — you drag your thumb to move, and you see only the ~40 bullets near you, rendered large and readable, plus a graze-glow when one passes close. You literally cannot dodge from the TV.

SHARED (TV): the full field, all three ships as dots, the boss's HP bar, and the BIG telegraph flash announcing the next pattern ("AIMED BURST — 2s"). Since the telegraph only lives on the TV, players must shout warnings ("spiral incoming, drift left!") while heads-down on their phones. Bosses auto-take damage over time; the goal is to survive one 30-second spell card without draining shared lives.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `boss{pattern, t}`, `bullets[{id,x,y,vx,vy}]` (server-owned), `ships{id, x, y, alive}`, `lives`. Server simulates bullets at 60Hz in normalized field coords and broadcasts. TV renders the full field; each phone receives the same stream but culls to a viewport window around its ship and up-scales. Sync strategy: server is authoritative for bullet positions and collision; phones send only thumb-drag deltas (~20Hz), server integrates ship position and detects hits. The genuinely hard part: streaming a few hundred moving bullets to phones at readable framerate over WS without jank — solved via delta-encoding, spatial culling to each phone's viewport, and client-side dead-reckoning between server ticks.

## v1 scope
- 3 players, shared 5 lives, ONE boss, ONE 30-second spell card.
- Two hard-coded patterns (radial wave + aimed burst).
- Drag-to-move only; no shooting, boss dies on a timer.
- Win = survive to the timer.

## Out of scope
- Multiple bosses, bombs, scoring, ship abilities, difficulty tiers, mobile tilt controls.

## Risks & unknowns
- Bullet stream framerate on mid phones; may need bullet-count caps.
- Whether the split TV/phone attention is thrilling or nauseating.
- Collision fairness under latency (grace radius tuning).

## Done means
3 phones each show a distinct private viewport, all dodge simultaneously, a mistimed dodge drains a shared life on the TV, and the group can survive a 30s pattern only by shouting telegraphs aloud.

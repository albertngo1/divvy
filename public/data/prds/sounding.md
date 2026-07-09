## Overview
Sounding is a cooperative Jackbox-shaped party game for 3–6 players. One player is the **Keeper** — their phone is the sea chart, showing rocks, currents, and a harbor mouth. Everyone else is a **Boat**, lost in fog, seeing only their own compass and hull. The Keeper sees everything but can barely say anything: once per turn they may sound the horn toward exactly one boat. The room wins together by getting every boat into the harbor before the tide runs out.

## Problem
"Guide the blind player" games collapse into one person calmly narrating a solution. The itch here is **triage under a hard bandwidth cap**: four boats drifting at once, one horn, and you can only help one. The Keeper feels the exquisite pain of picking who to save while the others scrape the rocks.

## How it works
The host TV shows fog and vague boat lanterns — no chart, no rocks. It's shared theatre, not an information source.

**Keeper's phone (private):** the full chart — a ~7×7 hex sea, rocks, one-way currents, the harbor mouth, and every boat's exact position and heading. Once per turn they tap ONE boat and pick a nudge: `HOLD`, `HARD LEFT`, `HARD RIGHT`, or `FULL AHEAD`. That is the entire channel.

**Each Boat's phone (private):** a compass ring, current heading, a "last horn" banner, and two controls — rotate heading, and commit "steam one cell." Boats see nothing of the chart or each other; they know only whether they just scraped (red buzz) or found open water.

Each turn: Keeper sounds one horn → all boats simultaneously commit a move → host animates drift, rock collisions cost a hull point, currents shove boats sideways. Tide drops one notch per turn. Reach harbor and you're safe (and may then shout encouragement out loud — table talk is allowed and is the fun; the Keeper just can't name a cell). Everyone home before the tide bottoms out = win.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO behind Tailscale Serve). One Durable Object per room holds the chart, boat states, tide, and turn phase.

Data model: `Room { code, phase, tide, chart: Hex[], boats: {id, pos, heading, hull, docked}[], keeperId }`. Server is authoritative for all positions; clients render only their private slice. Keeper receives full state; each boat receives a redacted view (own pos/heading/hull + last-horn only).

Sync strategy: turn-gated, not real-time-continuous. Server broadcasts `TURN_OPEN`, collects one horn + N boat commits (or a short timer auto-commits `HOLD`), resolves deterministically, broadcasts `TURN_RESULT`. The genuinely hard part is **fair simultaneous resolution** — order-independent movement so two boats swapping cells or piling onto one rock resolve consistently. Do it in a fixed server pass (currents → intents → collisions), never on clients.

## v1 scope
- 1 Keeper + 3 Boats, single fixed 7×7 chart, one round.
- Four nudge verbs, one horn per turn, 8-turn tide.
- Host shows fog + lanterns + tide bar; win/lose screen.
- No accounts — 4-letter room code.

## Out of scope
- Multiple charts, monsters, Keeper-as-traitor mode, reconnect polish, sound design beyond one horn SFX.

## Risks & unknowns
- Is one horn/turn too starving to ever win? Tune tide length and chart openness.
- Boats with zero chart info may feel purely lucky — the "scrape" feedback must teach enough to build a mental map.
- Table talk could trivialize it; test whether banning cell-naming (only vibes allowed) holds.

## Done means
3 phones + 1 host on a LAN complete a full round: horns route privately to single boats, simultaneous commits resolve without desync across all four clients, and a rock scrape docks a hull point on exactly the boat that hit it. A cold group either reaches harbor or watches the tide beat them — and immediately wants a rematch as Keeper.

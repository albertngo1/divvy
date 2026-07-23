## Overview
Defilade is a 3-player cooperative tactics game — one turn-based grid on the shared TV, one mech per phone — that steals Into the Breach's 'enemies telegraph, you reposition' loop and adds asymmetric fog of war. 'Defilade' is the dead ground an enemy can't see or shoot; finding it together is the whole game.

## Problem
Tactics games are single-player solitaire: one brain holds the whole board. Great tension, zero social. Meanwhile most co-op phone games make the phone a glorified button. Defilade puts the *board knowledge itself* on separate phones — no one player can see the full battlefield, so planning becomes a spoken intel exchange under a shared clock of enemy threats.

## How it works
The TV shows an 8×8 grid, three friendly mechs, a building to protect, and — crucially — the highlighted tiles enemies will strike next turn (telegraphs are public; danger is shared). What is *not* public: where the enemies actually are, and which tiles are safe from **unseen** threats.

Each phone privately shows only its own mech's vision radius: the enemies within it, the terrain it can see, and its reachable move/shove tiles. An enemy only renders on the TV if *some* mech can see it — so units blink in and out of the shared view as people move. Players plan simultaneously (each drags their mech + one shove/shot on their phone), but nobody sees the others' plans until the shared RESOLVE. Because your mech might be about to walk into a threat only *another* player's mech can see, you must narrate — 'there's a spider at B4 aimed down column B, don't stand there.' One round = survive 3 enemy turns with the building intact.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Grid`, `Enemies[{pos,telegraph}]`, `Mechs[{id,pos,visRadius,plannedMove,plannedAction}]`, `Building{hp}`. The server computes per-mech visibility each turn and pushes each phone a *masked* board; the TV gets telegraphs plus the union of currently-seen enemies. Planning is a two-phase commit: phones submit plans, server locks on all-in (or a timer), then runs one deterministic resolution (moves → shoves → enemy strikes → new telegraphs) and broadcasts an animated diff. Sync is turn-paced, so the hard part isn't latency — it's the *visibility solver* (fair, legible fog per unit) and making simultaneous resolution feel deterministic and un-surprising given that players acted on partial info.

## v1 scope
- Exactly 3 players, one 8×8 hand-made map.
- 2 enemy types (one ranged/telegraphed, one melee), 3 spawns.
- Move + one shove per mech; 3 enemy turns; protect a 3-HP building.
- Host screen + phone PWA, room-code join, no accounts.

## Out of scope
- Campaign, unit upgrades, more enemy types, elevation.
- Reconnect/spectator, undo, difficulty tiers.
- Procedural maps or scoring beyond win/lose.

## Risks & unknowns
- Fog + simultaneous commit may overwhelm — first-timers might not grasp that others see different things; needs a crisp onboarding beat.
- Deterministic resolution of blind simultaneous moves can feel unfair if a hidden threat kills you 'unavoidably'; telegraph tuning is delicate.
- Legible per-phone fog on tiny screens is a real UI challenge.

## Done means
Three phones join; each sees only its mech's vision while the TV shows public telegraphs and only-currently-seen enemies; players verbally share intel, commit blind simultaneous plans, and a deterministic server resolution either saves or loses the building over 3 turns — with at least one moment where one player's private sighting demonstrably saves another's mech.

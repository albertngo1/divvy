## Overview
Graze is a competitive bullet-hell brawl for 3-4 players where each phone is a separate private danmaku arena. It steals the genre's most beautiful risk mechanic — *grazing*, skimming a bullet without dying to build meter — and turns aggression into a weapon aimed at your friends. For reflex/arcade lovers who want personal panic, not a shared screen.

## Problem
Bullet-hell is the purest "private panic" genre ever made, and it's stubbornly single-player. Put everyone on one TV and the intimacy of *your* near-death dodge evaporates. Nobody has built the obvious party version: three people each drowning in their own bullets, screaming, because the only way to attack is to dance closer to death than the next person.

## How it works
Each phone is YOUR arena: a dot you steer by tilting the phone (accelerometer). Bullets rain; skimming one without dying fills a private **Bomb meter**. Tap a rival's name-button and spend the meter to launch a bullet pattern straight into THAT opponent's arena. Aggression is literal: to attack you must graze harder. The host TV shows all arenas side-by-side as read-only spectator feeds — dots, bullet density, and a red flash when someone gets bombed — plus a live "alive" count. Private = your exact arena, dot, and meter. Shared = the side-by-side overview. Last dot alive wins.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server. Each phone runs its OWN seeded, deterministic bullet simulation locally for latency-free dodging, sending only dot position + `bomb → targetId` events. The server relays bomb events to the target phone (which spawns the incoming pattern) and streams low-rate (10fps) arena snapshots to the host for the overview — it never mirrors full sims. Data model: `player { seed, alive, meter, pos }`. Hard part: per-phone tilt **calibration** (a neutral recentre so flat-on-a-table works), keeping the host overview cheap, and fair bomb timing over WS so an incoming barrage never feels teleported-in.

## v1 scope
- 3 players
- One 45-second survival brawl
- Tilt-to-move, graze-to-fill, one bomb pattern
- Target-select by tapping a rival button
- One hit = out; last alive wins; TV shows 3 mini-arenas

## Out of scope
Multiple bomb types, teams, best-of rounds, power-ups, revives, leaderboards, touch-control fallback.

## Risks & unknowns
Tilt controls can feel janky if calibration is off; one-hit-out means early-eliminated players spectate (45s cap mitigates); local-sim divergence could make bombs feel unfair; potential motion sickness.

## Done means
3 phones join via code; each dodges its own bullets via tilt with under ~100ms felt latency; a graze visibly fills the meter; a bomb tap spawns a pattern in exactly the chosen target's phone within 200ms; the TV shows all three arenas live; the last dot alive is declared winner.

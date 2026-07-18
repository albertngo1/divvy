## Overview
Breach steals turn-based tactics (XCOM, Frozen Synapse, Door Kickers) and squeezes it into a Jackbox shape. 3 players are a breach team clearing a single hostile-filled room shown on the shared TV. Each turn you privately plan your one operator's path and action; all three plans resolve simultaneously. It's for groups who like cerebral co-op and yelling 'NO don't cross my lane.'

## Problem
Tactics games are the best blind-commit genre ever made, but they're solo and slow. Nobody hosts a tactics night. The itch: a fast, loud, 4-minute version where the tension is that you *can't see your teammates' orders* and have to negotiate coverage out loud, then trust each other on a blind commit.

## How it works
The TV shows one top-down room: a grid, three operators at the door, and a handful of enemies with hidden intents. Each phone PRIVATELY shows: your operator, a draggable route (up to N cells) into the room, and one action to arm — a firing arc, a flashbang throw, or 'hold'. You do NOT see teammates' routes or actions; you only see your own plan overlaid on the shared map. Players talk out loud to deconflict, then each taps COMMIT (locked, no take-backs). When all three are in, the server runs a deterministic tick-by-tick simulation and the TV animates all three operators + enemies moving and firing at once. The danger: if your route walks through a teammate's committed firing arc, that's friendly fire; if two of you plan to clear the same corner, the third corner is open and an enemy tags someone. The privacy is the whole game — because no phone sees another's plan, coordination *must* be verbal, and the blind commit is where it goes gloriously wrong.

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Cloudflare Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `room { grid, enemies[], phase, turn }`; per-player private `plan { route:[cells], action:{type,params}, committed:bool }`. Plans are stored server-side and NEVER broadcast to other clients until all commit — this enforces the hidden-simultaneity that makes phones load-bearing. On full commit, the server runs a deterministic fixed-step sim (seeded, integer positions) and emits an ordered frame list; the TV interpolates for animation while phones show 'committed — watching.' Hard part: the deterministic sim + smooth host animation, plus guaranteeing no plan leaks (all resolution server-side; clients get frames, not intents).

## v1 scope
- Exactly 3 players, one room, 4 enemies.
- Up to 2 turns, then win/lose screen.
- Three action types only: fire-arc, flashbang, hold.
- One hand-authored room layout.

## Out of scope
- Multiple rooms / campaign, cover mechanics, operator classes, reconnection mid-turn, spectators, more than 3 players.

## Risks & unknowns
- Is a 2-turn round enough to show the fun, or does tactics need more beats? Playtest.
- Route/arc editing on a small phone screen may be fiddly — needs snap-to-cell.
- Blind-commit could feel punishing rather than funny if friendly fire is too frequent; tune arc widths.

## Done means
3 phones each privately plot a route + action, all commit, and the TV animates a single simultaneous resolution where a friendly-fire incident caused by two crossing plans is visibly attributable — proving no phone ever saw another's orders before the reveal.

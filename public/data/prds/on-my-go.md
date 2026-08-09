## Overview

A living-room theft of simultaneous-turn tactics (Frozen Synapse, Gloomhaven's commit phase) for 4 people, one TV, four phones, one eight-second round. The arena is public. The plotting is private. The twist: you never move yourself. You draw the path of the player to your left; the player to your right draws yours. You score on where **your** body ends up, which you do not control.

For groups who want a tactics game that is actually a talking game, and a talking game where the talk has a physics consequence they all watch happen.

## Problem

Negotiation party games are all promise and no proof — you say "I'll help you," the game resolves in the fiction of a vote, and nobody feels the betrayal in their body. Tactics games are the reverse: total consequence, zero table talk, because you already control everything you need. Splitting control from scoring makes the deal the only lever anyone has, and makes breaking it visible in 60fps.

## How it works

The **host TV** shows a top-down 12×12 arena: four colored objective tiles, four named avatars at their start positions, and a laser sweep that will cross the arena at a publicly-telegraphed time (t=4s). The handler ring (who plots whom) is public and shown as arrows — that's what makes deals possible.

**Each phone privately shows** three things nobody else sees: (1) your own objective tile, drawn at random from the four colors; (2) an editable copy of the arena with exactly one draggable path — your ward's, not your own — where you place up to 3 waypoints; (3) your commit button. Draft waypoints are never broadcast, not even as a "they're editing" hint.

A 60-second negotiation timer runs while people plot. Everyone talks out loud, freely, and may lie: "Put me on blue and I'll keep you clear of the laser." Your handler can promise blue and plot red, and you will not know until the movie plays.

On commit (or timeout), the TV plays one continuous 8-second movie: all four bodies walk their plotted paths at once, the laser sweeps, collisions shove. Then every objective tile is revealed at once, +3 each for anyone standing on theirs, and the room finds out who kept their word.

## Technical approach

PartyKit / Durable Object room, one object per party code, host tab plus phone PWAs over WebSocket.

State: `{ arenaSeed, phase, players: [{id, name, handlerId, objectiveTile, path: [{x,y}], committed}] }`. Objectives and draft paths live server-side and are fanned out **only** on the owning socket; the host tab receives a redacted view with no paths and no objectives until reveal.

Resolution is deterministic and server-side: step the 8 seconds at 20 ticks/s from the four committed paths, apply speed clamp, laser, and collision shove, emit a keyframe list, ship it as a single payload to the host, which renders with `requestAnimationFrame`. Nothing streams during playback — that removes the obvious sync problem entirely.

The genuinely hard part is the commit barrier, not the movie: private editing with zero leakage (no presence pings, no path-length telemetry), a visible timer all four phones agree on within ~100ms (server-stamped deadline, client renders locally), and reconnect handling — a dropped phone yields a straight-line path, announced loudly on the TV so nobody suspects a betrayal that was really a dead battery.

## v1 scope

- Exactly 4 players, fixed handler ring (left neighbor), no lobby options
- One round. No score across rounds. No rematch button.
- 12×12 arena, one hazard (the laser sweep at t=4s), 4 objective tiles
- 3 waypoints max, 60-second plot window, tap-to-place only
- Reveal screen: all four objectives and all four handler arrows

## Out of scope

Sabotage credits, multi-round campaigns, cover/line-of-sight, shooting, more than one hazard, spectators, avatar customization, any AI opponent, sound.

## Risks & unknowns

- Plotting on a phone may be fiddlier than plotting for yourself feels worth it; waypoint UI needs to be one-tap-per-point, no dragging.
- 60 seconds may be too long (dead air) or too short (deals unfinished) — needs a playtest dial.
- If your handler doesn't care about your objective, the deal has no currency. Mitigation to test: your score also feeds your ward's bonus, so routing well pays.
- Risk of a dominant strategy: everyone just parks their ward on their own stated tile and the round is friendly and boring.

## Done means

Four phones join a code, the ring is assigned and shown on the TV, all four commit within the window, and the TV plays one 8-second movie in which every body moves along the path its handler drew — verified by having one handler deliberately plot a promised-blue ward onto red and seeing exactly that happen on screen, with objectives revealed after. In a live playtest of one round, at least one player audibly bargains for a tile and at least one handler breaks the deal.

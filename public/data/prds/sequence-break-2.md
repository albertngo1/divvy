## Overview
A co-op timing party game that steals the metroidvania traversal power-fantasy — dash, double-jump, grapple, wall-cling — and splits it across the room. 3-5 players share one auto-running avatar on the host screen; each phone is the sole owner of one ability. For groups who love the flow of chaining moves but never get to feel it *together*.

## Problem
Metroidvania traversal is a solo, single-brain joy: the satisfaction of a clean dash→jump→grapple chain lives in one player's hands. Nobody else feels it. Existing phone co-op (Spaceteam-likes) is about reading panels and shouting jargon, not sharing one precise, moving body. Nothing makes a whole room *become* the moveset.

## How it works
The TV shows a side-scrolling avatar advancing on a rail toward a run of gates: a chasm needs JUMP, a laser wall needs DASH, a ceiling needs GRAPPLE, a crush-block needs CLING. Each phone is assigned exactly ONE ability plus a cooldown. Crucially, the cue lives on the phone, not the TV: each phone privately shows a **tension meter** that fills as the avatar nears an obstacle needing *that* ability, and a shrinking timing ring. You watch your own screen for your beat. Fire in the green window → gate cleared. Miss or fire early → lose a heart. Some gates need two abilities within 400ms (dash *then* jump), forcing two owners to sync live. The TV shows the avatar, the gauntlet, and hearts — never whose turn is next.

**Load-bearing privacy:** cues are simultaneous and distributed across phones; abilities cool down independently; two players' windows routinely overlap. You physically cannot pass one phone around — the game demands parallel hands.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Objects). Server runs the avatar clock at a fixed timestep, broadcasting state every ~50ms. Data model: `room {avatarX, speed, gates[], hearts}`, `players[{id, ability, cooldownUntil}]`. The server owns the timeline and grades each tap against the relevant gate window using server-receive-time minus a per-player latency offset measured by a join-time ping handshake. The genuinely hard part is fair sub-200ms grading over jittery phone links: generous ±120ms windows, a short commit buffer so a tap 30ms early still counts, and clock-sync on join. TV interpolates between ticks via requestAnimationFrame.

## v1 scope
- 3 players, 3 abilities (jump / dash / grapple)
- One hand-authored gauntlet of ~8 gates, including exactly one two-ability combo
- 3 shared hearts; win = reach the end
- Phone UI = one giant ability button + tension meter + timing ring
- No accounts, no lobby beyond a room code

## Out of scope
Ability upgrades, multiple/procedural maps, actual movement control, PvP, cosmetics, difficulty settings.

## Risks & unknowns
Latency-grading fairness is the whole ballgame. "Watch your phone, not the TV" may split attention too hard — might mirror a tiny avatar on-phone. Two-ability combos could be brutal; gauntlet pacing needs tuning.

## Done means
Three phones join, the avatar runs, each obstacle routes its cue to the correct phone's meter within a fair window, correctly-timed taps clear gates while mistimed ones drop a heart, and a full clean run shows a win screen.

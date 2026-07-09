## Overview
Blind Spot squeezes the stealth-action genre — patrol routes, sweeping vision cones, freeze-in-the-shadows — into per-phone party form for 3–4 players. The TV is a dim top-down room with a patrolling guard; each phone is a heist crew member with a *private detection clock*. For groups who want the held-breath tension of Metal Gear as a shared, wordless coordination puzzle.

## Problem
Stealth is a solo, first-person feeling — the private dread of "is that cone about to sweep me?" Shared-screen co-op stealth ruins it: everyone sees the same threat, so it's just one person calling shots. The itch is to give each player their *own* invisible danger that only they can feel, forcing a room full of people to manage individual jeopardy toward a common goal.

## How it works
The host TV shows a top-down grid room: a **guard** walking a fixed patrol loop, plus each crew token's position, a door, and a vault. Crucially, the guard's **vision cone is NOT drawn** — the room reads as dark. The TV also shows one shared **Alarm meter**.

Each phone privately shows only: *your* token, the adjacent tiles you can tap to move (one step per 2s beat), and a private **heat clock** — a 3-2-1 countdown telling *you alone* when the guard's cone will reach *your current tile* (computed server-side from the guard's path + your position). If you are mid-move (not frozen) when the cone arrives on your tile, you're spotted → the shared Alarm ticks up. Freeze during your window, advance during your safe gaps, and get all crew to the vault before the timer.

Per-phone is load-bearing: every player has a *different* private detection timing at every moment, so no single passed phone could feed four people their simultaneous freeze cues — the asymmetric private clocks are the game.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Cloudflare DO). Data model: `Room{ guardPath[], guardTick, alarm, tokens{} }`, per-player `heatCountdown` derived each tick. Sync: server owns a fixed 2s tick loop, advances the guard, and pushes each phone *only its own* heat countdown + legal moves; the TV gets guard + token positions but never cone geometry. Phones send `move(dir)` between ticks; server validates adjacency and resolves detection at tick boundary. Hard part: keeping the guard tick perfectly synced so a phone's "freeze in 1" lines up with the TV frame — clock drift here breaks trust in the private cue.

## v1 scope
- 3 players, one room, one guard on a single loop.
- 60-second heist, door → vault.
- Shared alarm: 3 spots = fail; all reach vault = win.

## Out of scope
- Multiple guards, cameras, distractions/items, multiple rooms, level editor.

## Risks & unknowns
- Can players trust an invisible cone, or does hiding it feel unfair? May need a brief calibration reveal.
- 2s beats might feel sluggish or too fast — needs playtest tuning.

## Done means
Three phones join, each shows a *different* private heat countdown as the guard walks, a player who moves during their lit window trips the shared alarm, the crew reaches the vault within 60s, and the vision cone never appeared on the TV.

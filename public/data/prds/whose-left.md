## Overview

A 3-player co-op packing game that steals the grid-inventory minigame from survival-horror and looter-shooters (the RE4 attaché case, Tarkov's rig, Diablo's bag) and shatters the grid across phones. One shared 7×7 case must swallow five awkward shapes in three minutes. The catch: no one can see the case. Each phone shows a rotated, partial, overlapping window into it, and the room has to invent a shared vocabulary for space on the fly.

## Problem

Inventory Tetris is a solitary, fiddly, deeply satisfying activity that nobody has ever made social. Meanwhile co-op spatial party games all collapse into one person describing a picture while everyone else waits. This makes the picture genuinely un-holdable: there is no player who could just describe it, because no player has it.

## How it works

The case is a 7×7 grid. Each phone is assigned a 5×5 window over it, positioned so windows overlap pairwise, no window covers the whole case, and 3–4 cells fall in nobody's window (dead space, discoverable only by failed placement). Each window is rendered at a different rotation — 0°, 90°, 180° — with its own local coordinate labels. "Slide it left" is a different direction on every screen.

Items arrive one at a time from a public queue. Each item is assigned to exactly one player, who alone can drag it, and only into cells inside their own window. Already-placed items show up on any phone whose window contains them — partially, clipped at the window edge. Overlap or out-of-window drops are rejected and cost a strike (3 strikes = case bursts).

**Phone (private):** its rotated 5×5 window, live, with local labels; its own held item; its own strike buzz.
**TV (shared):** the item queue, the strike counter, a fill percentage, and a timer. Never the layout. The room's only picture of the case is the union of three phones held next to each other — which players will physically do, and which is the intended comedy.

The fifth item is sized so it only fits if the first four were pushed to the edges, forcing coordination before anyone knows the geometry.

## Technical approach

PartyKit Durable Object per room holds the authoritative 7×7 occupancy grid (`cell[49] = itemId | null`), an item queue, window assignments (`{playerId, originX, originY, rotation}`), and strikes. Phones send `{itemId, localX, localY, localRot}`; the server transforms local→world with the player's rotation matrix, validates bounds/window-membership/overlap atomically, and broadcasts a clipped, re-rotated view to each phone individually — the server never sends a cell a phone shouldn't see.

The hard part is per-client view filtering plus drag preview: a drag must feel local-instant while validity is server-truth. Optimistic ghost placement locally, server confirm within 80 ms, snap-back with a shake on reject.

## v1 scope

- 3 players, fixed 7×7 case, one round, 3 minutes
- 5 hand-authored item shapes in a fixed order
- 3 fixed window/rotation assignments (no randomization)
- Drag-and-drop on phone, one item held at a time
- TV: queue, strikes, fill %, timer, win/burst screen

## Out of scope

Rotating items, multiple rounds, scoring beyond win/lose, 4+ players, moving an item once placed, audio, spectator view, reconnect.

## Risks & unknowns

Rotation may be cognitively brutal rather than funny — 180° might be one turn too far; playtest 0/90/90. Blind cells could feel unfair rather than mysterious. Drag precision on small phones is a real fail risk; cells need ~44 px minimum.

## Done means

Three phones join by room code, each sees a differently rotated window, a placement by one player appears within 200 ms on the other phones whose window contains it, an overlapping drop is rejected and increments a shared strike counter on the TV, and a room can both win and burst the case.

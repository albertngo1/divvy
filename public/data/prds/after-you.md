## Overview

**After You** is a 5-player, 3-minute real-time party game about the sidewalk dance — two people stepping the same direction to avoid each other, over and over. The TV shows one hum-and-bar readout of how broken the room is. Every phone shows a different, tiny, lagged window onto the same problem. It's for a group that likes physical comedy without standing up, and for anyone who has ever said "sorry — sorry — okay, you go."

## Problem

Party games about agreement are everywhere. Games about *anti*-agreement usually resolve in one blind simultaneous reveal, which is a coin flip, not a dance. The comedy of collision lives in the *second* collision — the correction that collides again. Nothing captures that, because nothing gives players a live, lagged, partial view of each other.

## How it works

The server builds a hidden graph: 5 players, each connected to exactly 2 others (a ring, but nobody is told it's a ring). Each player must hold a color that differs from both neighbors' colors. Nobody knows the graph, who their neighbors are, or how many neighbors they have.

**Private on each phone:** three big color buttons — and critically, each phone is dealt only 3 of the 5 colors in the game, so the room cannot simply all pick distinct. Above the buttons, two anonymous lamps labeled only ○ and ◑ show each neighbor's *current* color, delayed by 700 ms. When your color matches a lamp, that lamp buzzes the phone. You never learn which human is ○.

**Public on the TV:** a single conflict count ("4 CLASHES") and a rising drone whose pitch tracks it. No names, no colors, no graph. Talking is legal and useless — you can't name a color you both understand as the same slot, because the lamps are unlabeled and the palettes differ.

Because of the 700 ms lag, both ends of a clashing edge see the clash at once and both flip at once — straight into a new clash. Livelock. The room wins by holding 0 clashes for 3 consecutive seconds, which requires someone to *stop reacting* and eat the buzz while others route around them.

## Technical approach

PartyKit Durable Object per room, authoritative at 20 Hz. State: `{players: {id, palette[3], color, edges[2]}}`. Phones send `SET_COLOR` (throttled to one per 250 ms, server-enforced); the server computes conflicts and pushes each phone *only* its two neighbors' colors, buffered 700 ms in a per-edge delay queue, plus a haptic flag. The TV subscribes to an aggregate-only channel.

The hard part is that the lag must be *server-side and honest*, not client animation — a phone that receives fresh state and renders it late can be defeated by a fast reconnect. Delay queues live in the DO; late-joining sockets replay from the delayed buffer, never live truth.

## v1 scope

- Exactly 5 players, hardcoded ring graph, 5 colors, 3-per-phone palettes
- One round, 180 s cap, win = 3 s at zero conflicts
- TV shows conflict count + drone only
- No accounts, no scores, no rematch button (refresh the tab)

## Out of scope

Other graph shapes, variable player counts, per-player scoring, spectator mode, sound design beyond one oscillator.

## Risks & unknowns

The ring may be too easy for 5 sharp players; a denser graph may be unsolvable-feeling. 700 ms may be the wrong livelock constant — needs playtest tuning between 400–1200 ms. Biggest risk: the room discovers a verbal protocol in 90 seconds and the game dies. Mitigation is the mismatched palettes plus unlabeled lamps.

## Done means

Five phones on a LAN join by QR, and a naive room visibly livelocks at least twice before winning; a stopwatch confirms the TV's zero-conflict window matches the server log within 100 ms.

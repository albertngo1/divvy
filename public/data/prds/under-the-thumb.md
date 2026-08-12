## Overview
A 4-player cooperative panic game. One **Handler** holds the only map of a flooding basement; three **Divers** move blind. The Handler's map is unlit except for a small disc under their fingertip, and that disc pins whoever stands in it. Every act of looking is an act of restraint, felt physically by the person being looked at.

## Problem
In most map-holder games, observation is free and the holder becomes a calm oracle. Making sight cost *the holder* (burned tiles, timers) is well-trodden. The unexplored angle: make sight cost *the person being seen*, in real time, in a way they feel — which turns the holder's attention into a scarce, negotiated, resented resource and forces all guidance to be issued from memory about someone you are not currently looking at.

## How it works
The Handler's phone shows PRIVATELY a 10x10 basement map rendered black, plus a 1.5-tile-radius lit disc that follows their finger. Inside the disc they see walls, doors, the flood edge, and any Diver dots — accurate and live. Lift the finger and everything goes dark instantly.

Each Diver's phone shows PRIVATELY four direction buttons, a haptic tick per tile entered, and one state word: FREE or **PINNED**. While inside the lit disc, a Diver's buttons are dead and their phone buzzes at 2Hz. They know they're being watched; they don't know why, and they will say so out loud.

Water rises one tile from the far corner every 5 seconds. Each Diver must reach their own colored exit within 120 seconds; anyone the flood catches is out and the run fails at two losses. So the Handler must repeatedly check the flood edge (costing nothing) and check Divers (costing them their legs), then guide from a decaying mental image while looking elsewhere.

The shared TV shows the *shape* of whatever the disc currently lights — the terrain patch alone, floating with no position, no dots, no orientation. Enough spectacle for the room, useless as navigation. It also shows the flood timer and a live per-player "pinned seconds" tally, which is the postgame comedy: someone was held down for 40% of the round.

## Technical approach
Host tab + phone PWAs on a PartyKit Durable Object. The Handler's phone streams normalized touch coordinates at 20Hz; the server (not the client) computes the lit tile set, the visible-dot list, and the pinned set, then pushes visibility only to the Handler and pin flags only to affected Divers. State: `{grid, divers:[{id,pos,pinned,exit}], floodFront, touch, tick}` at 10Hz.

Hard parts: (1) pin fairness — a Diver mid-step when pinned must complete the step atomically or the server desyncs from the felt experience; (2) a dead-man switch — a dropped Handler socket would pin someone forever, so any Diver auto-unpins after 500ms without a fresh touch frame; (3) finger occlusion — the thumb physically covers the disc it creates, so render the lit patch as an offset lens 120px above the contact point.

## v1 scope
- Exactly 4 players: 1 Handler, 3 Divers
- One hand-authored 10x10 map, three fixed exits, one flood, 120s, one round
- Pin = buttons dead + buzz; no other status effects
- Room code join, no accounts, no rematch flow

## Out of scope
Multiple maps, doors/keys/items, Handler pings or drawn waypoints, more than one Handler, difficulty tiers, persistent scoring.

## Risks & unknowns
The Handler may simply never look at Divers and guide purely off flood geometry — needs a reason to check (fog that displaces Divers on unlit tiles). Buzz-while-pinned may read as a bug rather than a rule; the first 10 seconds need an explicit tutorial pin. Sustained finger-drag on a phone for two minutes is physically awkward.

## Done means
Four phones plus a laptop run a full 120s round where pin state visibly toggles within 150ms of the Handler's finger arriving, the postgame screen reports per-player pinned seconds, and at least one playtest ends with a Diver shouting at the Handler to stop looking at them.

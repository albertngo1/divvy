## Overview

A 4-player real-time cooperative game where one player (the Cartographer) holds the only map of a dark building and three blind Walkers move through it. The map is lit by movement alone: a soft disc of light follows each moving Walker and fades within a second of them stopping. Stand still and the Cartographer sees nothing at all.

## Problem

In map-holder games the holder usually has stable, complete vision and the pieces are just remote hands. That makes the holder a dispatcher, not a player. Here the holder's *information supply* is produced by the very actions they're trying to direct — so every instruction is also a decision about whether to burn light, and stillness is genuinely blinding.

## How it works

A 9×9 floor, three Walkers, one goal tile, and four "anchor" tiles that must each be stepped on before the goal opens.

**Cartographer's phone (private):** the map, rendered as pure black with a fading light disc (radius 2) around every currently-moving Walker. Crucially all Walkers render as identical white dots with no labels. So while one person moves, the Cartographer knows exactly who that dot is. The moment a second person moves, there are two dots and no way to attribute them — and once both stop, the Cartographer has to re-derive who ended up where. Walls and anchors seen under light persist as a faint 4-second afterimage, then decay to black.

**Each Walker's phone (private):** four compass buttons, a private step budget (starts at 18, only they can see it), and their own last sensation ("wall", "anchor underfoot", "open"). Steps are the fuel *and* the flashlight, and nobody knows how much anyone else has left unless they say so.

**Host screen (public):** the mission timer, how many of the four anchors are lit, and a room-wide "light level" bar that spikes with any motion. It never shows the floor.

The tension is that the fast play — everyone walks at once — destroys the Cartographer's ability to attribute dots, while the legible play — one Walker at a time — is slow and burns the clock. Groups invent verbal turn-taking protocols within one round, then break them the instant the timer gets tight.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object as the authority. Model: `{ grid, anchors, goal, walkers: {id, cell, steps, lastMoveTick}, tick }`. Server runs a 200ms tick; each tick it computes `isMoving = tick - lastMoveTick < 3` per walker and emits to the Cartographer only the union of lit cells plus anonymous dot positions — attribution is stripped server-side, not hidden in the client. Walkers get a payload containing nothing but their own cell-local sensation and step count.

The hard part is the lighting/afterimage state being both authoritative and cheap: a naive per-tick full-grid diff to one client is fine at 9×9, but the fade must be computed server-side (client-side fade drifts under jitter and lets a lagging Cartographer see stale geometry that the room has already changed). Store per-cell `lastLitTick` and send only cells whose brightness bucket changed.

## v1 scope

- Exactly 4 players (1 Cartographer, 3 Walkers), one hand-authored 9×9 floor
- One round, 4 minutes, four anchors then the goal
- 18 steps per Walker, no refills
- Identical unlabeled dots; no per-player colors anywhere

## Out of scope

Role rotation, generated floors, hazards, multiple floors, scoring, reconnect, sound.

## Risks & unknowns

Anonymous dots may be frustrating rather than fun if the Cartographer can never recover attribution — a cheap "who just moved?" verbal check may trivially solve it, in which case the fix is a short attribution blackout after simultaneous motion rather than more rules. Step budgets may be a fifth wheel: if players just announce their counts aloud, the private budget stops being load-bearing and should be cut or made unreadable (a fuel *bar* with no number).

## Done means

Four phones join by code; the Cartographer's screen is verifiably black during a 3-second full stop; two simultaneous Walkers produce two indistinguishable dots; and across six playtests at least two groups spontaneously invent a spoken one-at-a-time protocol.

## Overview

Quitclaim is a 4-player cooperative room game for a TV plus phones. One player is the **Assessor**: their phone holds the entire map and they are not allowed to speak for the whole round. Three players are **Runners**: blind tokens on that map, free to talk to each other, holding nothing. The Assessor's only communication channel is *conveyance* — dragging a single tile off their map onto a Runner's name. That tile appears, correctly placed, on that Runner's black phone, and goes permanently dark on the Assessor's. Telling someone something costs you the ability to see it.

## Problem

"One phone is the map" games nearly always collapse into one person narrating turn-by-turn directions while everybody else obeys. The map-holder is a router, not a player. Quitclaim gives the map-holder a real, agonizing decision every few seconds by making their information *finite and transferable*: they start omniscient and end blind, and they choose exactly how they go blind.

## How it works

A 5×5 grid. Tiles are **clear**, **pit**, or the single **vault**. Three Runner tokens start at known corners. Eight turns, each turn two phases.

**Convey (20s).** The Assessor must deed exactly 3 tiles, each to a named Runner. Drag tile → name chip. Gone from their board forever.

**Move (15s).** All three Runners commit a step simultaneously. A Runner may step onto a tile they personally hold the deed to — safe, known. Or they may step into darkness: an undeeded tile is a gamble, and a pit eliminates them.

Private on each Runner's phone: a black 5×5 with only *their own* deeded tiles lit, plus their own token. Runner A's scraps are invisible to Runner B — they have to describe them out loud, badly, under a timer. Private on the Assessor's phone: the shrinking map, and every Runner's live position. Public on the TV: turn number, a silhouette of *which* tiles have been deeded to *someone* (not their contents, not to whom), the eliminated count, and a giant SILENT badge under the Assessor's name.

Win: any Runner stands on the vault before turn 8.

## Technical approach

PartyKit / Cloudflare Durable Object, one DO per room code, phone PWAs over WebSocket. Server state: `map: Tile[25]`, `deeds: Record<tileIdx, runnerId>`, `assessorVisible: Set<tileIdx>`, `runners: {id, pos, alive}`, `turn`, `phase`.

The genuinely hard part is not latency, it's **masked broadcast**. There is no shared view to diff — the server must project a *different* state per socket every tick (Runner sees own deeds only; Assessor sees map minus deeds; TV sees a redacted silhouette) and must never ship the full map down any wire, because one leaked payload in devtools ends the game. Implement projections as pure functions of authoritative state, and fuzz-test that no Runner projection ever contains a tile type they don't hold a deed to. Deed transfer must be atomic: reveal-to-runner and blackout-on-assessor in one committed mutation, both pushed inside 200ms.

## v1 scope

- Exactly 4 players, one round, 5×5, 8 turns
- 3 deeds per turn, no deed-back, no trading between Runners
- Silence is a social rule printed on the TV — no enforcement
- Pit = elimination; no rescue mechanic
- No accounts, no rematch, no persistence

## Out of scope

Mic-based silence policing, variable map sizes, a traitor Assessor, deed-trading economies, replays, mobile install prompts.

## Risks & unknowns

The Assessor may feel punished rather than powerful — if going blind isn't fun, the whole thing dies. Three deeds per turn may be too generous (map fully conveyed by turn 3) or too stingy; tune on real players. Runners describing scraps out loud may become the *entire* game, sidelining the Assessor.

## Done means

Four phones join a code. The Assessor deeds a tile; within 200ms it lights on exactly one Runner's phone and blacks out on the Assessor's, permanently. A Runner stepping into an undeeded pit is eliminated on the TV without any client ever having received that tile's type. The round resolves win or loss within 8 turns.

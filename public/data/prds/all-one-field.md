## Overview

A 4-player, 7-minute tile-laying area-majority game where the terrain is fully public and the ownership is entirely private. Built for people who love Carcassonne's fields and hate scoring them.

## Problem

Farm scoring is the canonical tedious tabletop mechanic: at game's end four adults crawl around a table tracing which grass touches which grass, lifting tiles, discovering a meeple buried under three expansions, and arguing about connectivity for fifteen minutes after the fun stopped. The interesting part — *two big regions just became one* — happens silently mid-game and nobody notices until the argument.

## How it works

Turn order, 6 turns each. On your turn you place one tile from your private hand of 3 onto the growing 6×6 map, then may optionally spend one of your 3 claim markers on a region touching that tile.

PUBLIC on the TV: the terrain, every region border, each region's current value (its tile count), and a merge klaxon whenever a placement welds two regions into one. Claim markers are never drawn. The room can see exactly how the land looks and has no idea who owns any of it.

PRIVATE on each phone: your 3-tile hand, your remaining claims, and a live card for every region you hold a claim in showing (a) its current value and (b) the *total* number of claims in it — including strangers' — but never whose. So when a merge fires, your card jumps from "value 5, 1 claim" to "value 9, 3 claims" and you learn, alone, that you just got buried. The room saw a merge; only you know it mattered.

Scoring is instant: majority of claims takes the region's value, ties split it. The TV then reveals ownership region by region — the payoff moment that in person takes a quarter of an hour.

The bluff layer is placement. Bridging a fat contested region into a small one you own is a public, legible act with a completely private meaning.

## Technical approach

Cloudflare Durable Object holds the room; host tab plus four phone PWAs over WebSocket. State: `grid[36]` of tile shapes, a disjoint-set union over per-tile region fragments, `claims: Map<rootId, seat[]>`, `hands[seat]`, `turnCursor`. Placement runs DSU unions across the four new edges, then broadcasts a public snapshot (grid, root→value, merge events) and per-socket private frames (`hand`, `myClaims`, `perRegionClaimCounts`).

Turn-based play makes latency trivial. The genuinely hard part is *identity across merges*: when roots A and B unite, both members' phone cards must animate into a single card without either learning the other's membership, and the surviving root id must be stable so reconnecting clients don't see cards teleport. Union by size with a persistent alias table, and merge events described publicly as `{losers: [ids], winner: id}` with no seat data attached.

## v1 scope

- Exactly 4 players, one region type (grass), 6×6 map
- 24 tiles total, 6 placements each, 3 claims each, one round
- No lobby: four fixed seat codes on the host screen
- Reveal is a static ownership overlay, no animation
- No undo, no reconnect, no rematch

## Out of scope

Multiple region types, roads/cities, meeple retrieval, variable player counts, spectators, an AI opponent, sound design.

## Risks & unknowns

With ownership fully hidden, the round may feel like blind flailing rather than tense deduction — claim-count leakage might not be enough signal. Merges may be too rare on a 6×6; tune tile shapes so a typical game fires 3–5 merges. Players may forget which region on their phone corresponds to which patch on the TV, so private cards must carry the region's centroid as a tiny thumbnail.

## Done means

Four phones complete a 24-tile round in under 8 minutes, at least three merges fire, the final overlay produces a winner nobody has to hand-verify, and at least one player says out loud that they saw their claim count jump and knew they'd been buried.

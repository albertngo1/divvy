## Overview

A 4-player one-round co-op. One player (the Surveyor) holds a floor plan of the building on their phone. Three blind Walkers move through it. The plan is an old edition: five things have been changed since it was drawn — a door bricked over, a new partition, a corridor widened. Nobody is lying, nobody is a traitor. The building simply isn't the building on the phone anymore, and the whole game is the room trying to tell *map error* apart from *position error*.

## Problem

Blind-navigation party games collapse into obedience: the sighted player is always right, and a failed move means someone miscounted. The genuinely interesting failure — "my model of the world is stale" — never comes up, because the map-holder is always given ground truth. And hidden-role variants solve it with a liar, which turns a spatial game into another social-deduction game.

## How it works

**Surveyor's phone (private):** the old floor plan, plus three dots showing where the Surveyor *believes* each Walker is — dead-reckoned from the instructions the Surveyor issued, not from truth. If a Walker misexecutes, or is pushed off-plan by a wall the Surveyor doesn't know about, the dots silently drift. The Surveyor can never see real positions.

**Each Walker's phone (private, all different):** no map ever. A heading-relative D-pad, and after each move, one terse body-frame sensation: "you stopped short — something solid at knee height on your left" or "open, you walked further than expected." Walkers also get one private *feel* action per round that costs a turn and returns a slightly richer description of one adjacent surface — old brick vs. fresh drywall, which is the only tell that distinguishes a renovation from a mistake.

**Host TV (public):** turn count, how many Walkers have reached their marks, and a running list of every *contradiction* the room has surfaced aloud — pressed by whoever noticed it. Never the plan, never positions.

The payoff loop: a Walker reports a wall. The Surveyor's plan says corridor. Two explanations, one costly move to test each. Groups that guess "new wall" and re-plan around it get burned when the real cause was a drifted Walker three tiles from where the Surveyor thinks; groups that always assume drift waste the clock re-syncing.

## Technical approach

PartyKit Durable Object, authoritative. State: `{trueMap, staleMap, diffs[5], walkers:{pos,heading}, believedPos:{}, turn}`. The server holds both maps and never ships `trueMap` to anyone. Walker clients receive only a one-line sensation string; the Surveyor client receives `staleMap` plus `believedPos`, which the server integrates from *issued instructions* (typed into the Surveyor's phone as a queued order per Walker) rather than from movement. Simultaneous 5-second ticks.

Hard part: dead reckoning must be simulated server-side and stay believable — the drift has to come from real misexecution and real map error, never from injected noise, or players will smell a rigged game and stop reasoning.

## v1 scope

- 4 players, one hand-authored 6×6 building with exactly 5 authored diffs, one round, ~5 minutes
- Surveyor types orders as a dropdown (direction + count), one per Walker per tick
- One `feel` action per Walker for the whole game
- Win = all three Walkers on their marks within 20 ticks

## Out of scope

Procedural buildings, scoring, 5+ players, more than one round, any traitor role, reconnects.

## Risks & unknowns

- Five diffs on a 6×6 may be too dense to distinguish from noise; two or three may be the real number.
- Dead-reckoned dots could make the Surveyor feel merely punished rather than usefully uncertain.
- Distinguishing brick from drywall in one text line may read as arbitrary rather than diagnostic.

## Done means

Four phones join; the Surveyor's dots visibly diverge from server-truth after a misexecution; no client's network traffic ever contains the true map; and in playtest a group audibly argues both explanations — "that's a new wall" vs. "you're not where I think you are" — before spending a turn to test one.

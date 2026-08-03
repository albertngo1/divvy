## Overview

A 90-second real-time cooperative steering game for exactly three players. Each of you drives a dot you cannot see, using a thumbstick that is secretly miscalibrated, toward a meeting point nobody has been told. It is a distributed-consensus algorithm executed by three humans with their thumbs, and it is very funny to watch from the couch.

## Problem

Convergence games are almost always turn-based: guess, reveal, adjust. The few real-time ones let you watch your own cursor, which turns them into a mechanical race with no thinking. Take away self-view and the same simple loop becomes a real inference problem — you have to work out where *you* are from how the world responds to you.

## How it works

Each phone shows a dark field containing exactly **two dots — the other two players, live**. Your own dot is never drawn. The field is rendered **ego-centrically**: you are always the unmarked center of your own screen, so when you move, the whole world slides past you. That sliding is your only proprioception.

Below the field is a virtual thumbstick. It nudges your invisible dot through a **private secret transform**: a random rotation (0–360°) and gain (0.6×–1.6×). Push up, you might drift left and slowly.

Win condition: all three dots inside a 60px radius, held for 2 seconds, within 90 seconds. The only strategy that works is the classic averaging rule — steer toward the midpoint of the two dots you can see — which provably converges on the centroid. Getting there requires first discovering your own miscalibration by pushing and watching which way the world slides.

- **Private per phone:** an ego-frame view of the other two players; your secret rotation and gain (never displayed).
- **Public on the TV:** *no live dots.* A "tightness" ring that contracts as the triangle's perimeter shrinks, plus a slowly accumulating spirograph of all three trails — beautiful and useless as real-time information.
- **On win or timeout:** full replay in the true world frame, each trail labeled with that player's rotation and gain.

## Technical approach

PartyKit Durable Object running an authoritative 20Hz tick. Clients send stick vectors `(x, y ∈ [-1,1])` at 20Hz; the server applies each player's secret rotation+gain, integrates with fixed dt (client timestamps ignored entirely), clamps to arena bounds.

The design *is* the transport: the server broadcasts nothing global. Each socket receives only the other two positions, already transformed into that player's ego frame. Your own position is literally never on the wire to you, so opening dev tools buys you nothing. The host socket receives only the perimeter scalar during play; full trails ship at end-of-round.

Hard part: per-socket divergent payloads at 20Hz with jitter buffering, rendering at 60fps by interpolating between ticks. Latency spikes must not read as calibration noise — a hitch that makes the world lurch feels like the game cheated.

## v1 scope

- Exactly 3 players, one 90-second round, one arena
- Fixed win radius, fixed 2-second hold
- Secret rotation + gain assigned once at round start
- Host: tightness ring, trail spirograph, end replay
- No scoring, no rematch button

## Out of scope

4+ players, difficulty tiers, obstacles or moving targets, mid-round recalibration, haptics, disconnect/rejoin, any leaderboard.

## Risks & unknowns

Might be unwinnable in 90 seconds, or nauseating — an ego-frame that slides under your thumb is a motion-sickness candidate. Three is the minimum player count where averaging works at all; two degenerates into mutual chasing. The host screen may be dull for the ~80 seconds before anything converges. And a player who simply doesn't grasp "aim for the midpoint" can hold the whole room hostage.

## Done means

Three phones each receive a different secret rotation and gain; a player who holds still sees a perfectly static world; the room converges and holds for 2 seconds within 90 seconds in at least 3 of 6 playtests; no player's own position ever appears in their socket traffic; the end replay renders three visibly distinct trails with their calibrations labeled.

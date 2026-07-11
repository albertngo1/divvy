## Overview
Blindside is an asymmetric stealth party game for 3 players (1 runner, 2 sentries) around a shared TV. It steals the patrol/vision-cone tension of stealth-action (Metal Gear, Splinter Cell) and makes the guards' eyes *private*, so the fun is the coordination the runner can overhear.

## Problem
Stealth is a single-player genre; the delicious "am I about to walk into a sightline" dread is never shared socially. Hide-and-seek has position but no information asymmetry — everyone sees the same room. Nobody has turned a guard's field-of-view into a private, negotiable resource at a party.

## How it works
The TV is a shared "situation board": a 5x5 grid with two walls and an EXIT, but it holds no tokens — it only flashes public events (alarms, the final reveal). Each tick (~4s, or when all lock), everyone acts at once.
- **Runner's phone (PRIVATE):** the grid with walls, the exit, and *their own position*; queues one move (N/S/E/W/wait). Goal: reach the exit in ≤8 ticks.
- **Each Sentry's phone (PRIVATE):** the grid with only *their own* guard and its 3-cell facing wedge, plus controls to rotate it. A sentry cannot see the other sentry's cone, nor the runner — unless the runner ends a tick inside their wedge, which privately lights up "CONTACT — B3" and flashes a public alarm on TV.

Two contacts = capture, sentries win; a clean exit = runner wins. The core: sentries can't see each other's coverage, so they must talk ("I've got the east column, you cover the vents") — and the runner, whose position is secret, listens to that very negotiation and threads the seam between their cones.

PRIVATE: runner's position; each sentry's own cone. SHARED TV: walls, exit, alarms, tick counter, final reveal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server. Data model: grid cells, walls, `runner.pos`, `guards[]` with pos+facing — all server-owned. The server sends each client a *filtered* view: runner gets only its cell + static map; each sentry gets only its guard, cone cells, and any contact. Lockstep ticks: server collects locked moves, resolves, computes cone intersections, broadcasts filtered results. The genuinely hard part is authoritative server-side fog — visibility must be computed and filtered *on the server* so no other player's hidden state ever reaches the wire (client-side hiding would leak). Plus cone geometry (facing → covered cells) and the simultaneous-lock timeout.

## v1 scope
- 3 players: 1 runner, 2 sentries
- 5x5 grid, 2 walls, 8 ticks
- Guards rotate only (no movement); fixed 3-cell wedges, 4 facings
- Win: runner exits, or sentries score two contacts

## Out of scope
- Guard movement, variable cone shapes, multiple runners, noise/gadget mechanics, reconnection.

## Risks & unknowns
- Is rotate-only too static to feel like stealth?
- Does hidden-cone coordination create fun table talk or just confusion?
- Lock-timeout UX; server-side fog correctness under packet loss.

## Done means
On 3 phones + a TV, a full round plays: the runner privately navigates, each sentry sees only its own cone, a contact fires privately plus a public TV alarm, and the round ends in capture or escape correctly — with no phone ever receiving another player's hidden state on the wire.

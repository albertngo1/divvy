## Overview
A cooperative simultaneous-turn tactics game stealing the Frozen Synapse / door-kicker genre: everyone plans at the same time, in secret, then all plans resolve together in one tense cinematic burst on the TV. For 3 players, one shared objective.

## Problem
Turn-based tactics is a solo, slow, one-screen genre — impossible to run as a party game if everyone stares at the same board and takes turns. The fun only becomes social if each player commits their own unit's plan privately and simultaneously, so the resolution is a shared surprise nobody fully predicted.

## How it works
Host TV (public): a small overhead room — a couple of guard turrets and a briefcase. Between turns it shows only last-known unit positions. On resolve, it plays the full 4-second simulation of everyone's plans at once: operators sprinting, turrets tracking, someone eating a bullet in the doorway.

Each phone (private): you control exactly ONE operator. Your screen is a planning canvas — tap to lay a path of waypoints for the next 4 seconds and set one order (HOLD, PEEK, or FIRE-ON-SIGHT). Crucially you cannot see your teammates' plans. You're guessing whether your partner will clear the left corner before you cross it.

Everyone locks in blind, then hits READY; when all three are in, the server resolves. Because planning is simultaneous and hidden, a single passed-around phone cannot reproduce the game — the blind-commit-at-once tension is the entire point.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `room = grid`, `unit {id, owner, pos, plan:[waypoints], order}`, `turrets = [{pos, arc}]`. Phones send their `plan` on lock-in; the server runs a deterministic fixed-timestep simulation of all plans together, computing movement, line-of-sight, and turret fire, then streams the resolved frame timeline to the host for playback. Genuinely hard part isn't real-time input (planning is async) — it's a fully deterministic sim so every client's replay matches, plus a clean lock-in barrier that won't deadlock if one player never readies (timeout auto-locks their last plan).

## v1 scope
- One 6x8 room, two static auto-turrets, one briefcase.
- Exactly 3 co-op players, each one operator.
- A single 4-second planning turn, one resolution.
- Win = any operator reaches the briefcase alive.

## Out of scope
- Multiple turns / replanning after seeing the outcome.
- Enemy AI movement, cover destruction, PvP.
- Unit abilities beyond move + fire order.

## Risks & unknowns
- Whether one blind turn is satisfying or just feels random without a replan.
- Path-drawing UX on a small phone screen.
- Deterministic sim edge cases (simultaneous same-tile entry).

## Done means
Three players independently plan on their phones, lock in blind, and watch a single deterministic replay resolve on the TV where the outcome visibly depended on all three plans meshing — and a miscoordinated set of plans reliably gets someone shot.

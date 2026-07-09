## Overview
An asymmetric hidden-movement game for 3-5 players. One player is the **Beast**, whose phone is the board — the full grid with every token on it. Everyone else is blind **Prey** who feel only how close death is. For groups who love one-vs-many tension (Nyctophobia, Scotland Yard) but without a physical board or a trusted human referee.

## Problem
Hidden-movement board games need either a big physical rig or an honest overseer who won't peek. The itch: make the blindness *real, private, and simultaneous per player* — enforced by the architecture, not by promising not to look — while the map-holder is the one player who sees all.

## How it works
The board is a grid. Turn structure:
1. **Prey move simultaneously.** Each Prey phone shows NO map — only a private **proximity meter**: a 3-tier warm/cold state driving pulse rate and haptic buzz, reflecting that prey's own Chebyshev distance to the Beast. Each prey taps one direction, secretly, at the same time.
2. **The Beast moves.** The **Beast's phone (the board)** shows the entire grid: every prey token, its own token, one step per turn.
3. Server resolves. If the Beast shares a cell with a prey → caught. Prey win by surviving N turns.

Private simultaneous movement + a private per-prey proximity signal is the load-bearing part: a single passed-around phone cannot hand each prey their own secret meter and take each prey's secret move. Prey can't see each other either, so the delicious failure mode is two panicking prey fleeing *into* each other's danger.

The **host TV** shows tension only — a heartbeat drum that speeds up with the closest prey, the count of prey still alive, the turn counter. No positions, ever.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `grid{w,h}`, `beast{cell}`, `prey[]{id, cell, alive}`, `turn`. Each turn: collect all prey moves (barrier until submitted or timeout), apply, then apply Beast move; the server computes each prey's proximity tier and pushes **only that scalar + haptic pattern to that one phone**, while the Beast socket gets the full board. Hard part: clean simultaneous-turn resolution, per-prey private-signal fan-out with no leakage, and tuning proximity granularity so it's a *hint*, not GPS.

## v1 scope
- 3 players: 1 Beast + 2 Prey
- 6×6 grid, survive 8 turns, one round
- Proximity as 3-tier haptic buzz (cold / warm / hot)

## Out of scope
- Escape hatches, power-ups, multiple beasts
- Reconnect, cosmetics, matchmaking

## Risks & unknowns
- Proximity tuning is the whole game: too precise → trivial dodging, too vague → random.
- Simultaneous vs. alternating turns — which *feels* more dreadful? Playtest both.
- Beast may just chase the nearest token; prey need real agency (blindness to each other supplies some).

## Done means
3 phones join; the Beast's phone shows the full grid with all tokens while prey phones show no map; each prey feels only its own proximity buzz and submits a private simultaneous move; a prey is caught when the Beast shares its cell; the host shows the surviving count after 8 turns.

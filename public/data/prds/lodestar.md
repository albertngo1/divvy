## Overview
A turn-based hidden-traitor game for 3-4 players. One player is the **Star**, whose phone is the map: a grid of safe tiles, pits, and one exit. The other 2-3 players are **Walkers** — tokens on the host TV, which shows only tokens on a black grid. The Star privately steers each Walker one step at a time. The catch: the Star is secretly Guide or Wrecker, and Walkers collect their own private evidence.

## Problem
Map-holder games assume the map-holder is trustworthy. The itch is asymmetric trust: the only person who can see is the one you can't be sure of — and giving the blind pieces private ground-truth turns obedience into deduction.

## How it works
- **Star's phone (PRIVATE):** the full 5x5 grid — safe tiles, pit tiles, exit, and every Walker's position. Each turn the Star taps a direction (N/E/S/W) on each Walker's private pad, one instruction per Walker.
- **Walker's phone (PRIVATE):** only the single arrow the Star sent them this turn, and a **Break Rank** button (usable once all game) to move a direction of their own choosing instead. After moving, the Walker privately feels a **truth-ping**: green pulse if the tile was solidly safe, an orange shudder if it was a pit-edge (adjacent to a pit). Each Walker's ping is theirs alone.
- **Host TV (SHARED):** tokens sliding on a black grid, turn counter, and a communal **Trust meter** players nudge by discussion. Never shows tiles, pits, or exit.
- **Secret role:** Star is Guide (win = every Walker reaches the exit) or Wrecker (win = shove a Walker into a pit and deny the exit). Walkers win with the Guide by all reaching the exit; talking between turns is encouraged — 'my last two steps both shuddered, why does the Star keep sending me east?'
- **Round:** ~8 turns. A Walker in a pit is out; exit reached = safe.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `grid{tiles[25], exit, seed}`, `walker{id, pos, alive, break_used}`, `star{role}`. Server owns the grid and resolves moves — it computes each Walker's truth-ping (`pit-adjacent?`) so the client can't peek. Star's phone renders full grid; Walker phones receive only their arrow + ping event; TV receives positions only. Sync is simple turn-locked messaging (no real-time physics). Hard part is airtight information hiding: pings and instructions must never leak cross-client, and the traitor's role stays server-side until reveal.

## v1 scope
- 1 Star + 2 Walkers (3 players).
- One fixed 5x5 grid layout, ~8 turns.
- One Break Rank per Walker, 50/50 Guide/Wrecker role.
- Reveal screen naming the Star's role.

## Out of scope
- Bigger grids, multiple Stars, multi-round scoring.
- Voice/text channels beyond the room.
- Balancing knobs, difficulty modes.

## Risks & unknowns
- With 2 Walkers a lone Wrecker may be too easy to catch; needs enough pit density that honest guiding also produces shudders.
- Break Rank could trivialize the traitor — tune to one use and near the exit.
- Truth-pings must be legible enough to reason about but not a full map.

## Done means
3 phones join, the Star sees a grid neither the TV nor the Walkers can; each Walker receives a private arrow and, after moving, a private safe/shudder ping the others don't see; a Wrecker Star can walk a trusting Walker into a pit, and a suspicious Walker can Break Rank to survive — ending on a role-reveal screen.

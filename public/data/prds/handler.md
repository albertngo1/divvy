## Overview
Handler is a real-time cooperative party game for 3–5 people in one room. One player's phone is the map: a full top-down hazard-maze with the live position of every other player's token plus the extraction point. Everyone else is a blind *agent* who can drive their own token but can only see a single tile around it. The host TV shows tension (timer, agents-remaining, near-misses) but never the map.

## Problem
'Guide the blindfolded person' is a great party bit, but doing it with your voice for one person at a time is slow and turns everyone else into spectators. The itch: make ALL the blind players move at once, and starve the guide of words so the guiding itself becomes a frantic skill.

## How it works
The handler holds a phone showing the maze: walls, hazard tiles, the extraction pad, and a colored dot per agent updating live. Each agent's phone shows only a black screen with their own token and a one-tile keyhole of floor/wall immediately around it; they steer by tilting or a thumb-stick, continuously and simultaneously. The handler's ONLY channel is a per-agent pulse: tap an agent's dot, flick a compass direction, and that agent's phone buzzes once and flashes an arrow that direction for 0.5s. No text, no voice-required, no map-sharing. Because agents move at the same time, the handler is constantly overloaded — nudge the one about to walk into a hazard, or the one drifting away from extraction? Stepping on a hazard resets that agent to the entrance. Win = all agents on the extraction pad before a 90s clock.

## Technical approach
Authoritative WebSocket server (PartyKit / a Cloudflare Durable Object per room, or Socket.IO behind Tailscale Serve) holds the room: maze grid, hazard set, and `{agentId: {x,y}}` positions. Agents send input deltas at ~15Hz; server integrates movement, does collision/hazard checks, and broadcasts the full position map ONLY to the handler client and each agent's own keyhole slice to that agent. Handler pulses are one-shot messages routed to the target agent. Hard part: real-time sync at party-latency — 60–120ms round-trips make blind steering feel mushy, so agents run local dead-reckoning prediction and the server reconciles; hazard hits must be server-authoritative to avoid disputes.

## v1 scope
- 3 players: 1 handler + 2 agents (scales to more later)
- One hand-authored 8×8 maze, ~4 hazard tiles, one extraction pad
- Directional-pulse channel only; tilt-to-move agents
- One 90s round, win/lose screen on the TV

## Out of scope
- Multiple mazes / procedural generation
- Moving hazards, fog that regrows, agent abilities
- Reconnect grace, matchmaking, accounts

## Risks & unknowns
- Blind tilt-steering may feel too imprecise; may need a coarser grid or step-move
- Handler overload could tip from fun-frantic to hopeless with >3 agents
- Pulse-only comms might be too thin — a tiny fixed lexicon may be needed

## Done means
Three phones join a room; handler sees the live maze, agents each see only their keyhole; a handler pulse visibly nudges the correct agent; stepping on a hazard resets that agent; all agents reaching extraction before 90s shows a win on the TV.

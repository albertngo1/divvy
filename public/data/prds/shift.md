## Overview
A cooperative repair-the-machine party game. Something breaks — a nuclear reactor, a coffee grinder, a submarine — and each player's phone holds part of the repair manual. Steps have to happen in a specific order, but nobody has the whole sequence, and every step requires calling out a cue so the next player can go. Voice is the wire that stitches the manual back together.

## Problem
The Devils & the Details is beloved for its collaborative chaos, but it requires a physical box, a full manual, and everyone reading at once. It doesn't survive over Zoom, and it doesn't work well when someone's spatial reasoning is loud enough to hoard the whole puzzle. A per-phone version enforces that the fun *is* the shouting — no one player can just take over.

## How it works
3–5 players join a room. A "machine" is randomly chosen from a small pool; each player receives a private list of 3–5 steps they can perform, with prerequisites they can't see. Player A's phone might say: "STEP: pull the coolant lever. Only after: someone confirms 'valve is green.'" Player B has: "STEP: rotate valve until green. Only after: 'reactor pressure below 40.'" Player C sees the pressure gauge. The dependency graph is a chain that only resolves when everyone reads their steps aloud and cues in order. Wrong order = pressure spikes. Time limit = 3 minutes.

## Technical approach
Socket.IO on the homelab. Server holds the machine's state machine — a small DAG of 12–15 steps, distributed across players so each phone owns 3–5 nodes. Each phone shows: your current step, your "unlock" cue phrase, and one live gauge (analog SVG dial). Tapping "DONE" reports completion; server validates prerequisites and updates the shared state. If prereqs unmet, the reactor destabilizes (a hull-integrity bar). LLM Haiku pre-generates the step text in flavorful language ("the coolant lever, hissing like an angry cat") — cached per machine, no live calls. The per-phone architecture is load-bearing: if the DAG were visible on one screen, one person would just direct traffic; hiding the graph across phones forces cue-based voice sync.

## v1 scope
- 4 players fixed
- One machine ("reactor"), one 3-minute round
- 12 steps distributed across the 4 phones
- One live shared gauge (pressure) that ticks toward failure on wrong order
- Success = all steps completed in order before timer; failure = pressure hits max

## Out of scope
- Multiple machines
- Difficulty tiers or step-count scaling
- Speech recognition of cue phrases (players just shout)
- Reconnect
- Persistent stats

## Risks & unknowns
- 12 steps may be too few (over in 60s) or too many (can't finish in 3 min)
- The DAG must produce meaningful branching, not a straight line
- Reading step text aloud may feel like homework rather than play
- Balancing "voice cue" wording to be shoutable, not sentence-long

## Done means
Four people complete or fail a reactor repair, everyone had to talk to make it work, and the group can articulate why they lost when they lost.

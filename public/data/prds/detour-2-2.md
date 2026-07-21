## Overview
Detour is a 3–4 player cooperative-with-a-traitor navigation game. Together you drive one car across a fogged city map to a goal, each player privately holding a contiguous slice of the turn-by-turn directions — but the imposter's slice has exactly one turn secretly flipped. For groups who like hidden-traitor games and want the betrayal grounded in an artifact instead of vibes.

## Problem
Hidden-traitor games (Saboteur, Avalon) make the traitor act arbitrarily malicious, which is easy to spot and easy to deny with talk. Detour anchors the betrayal in a concrete private view: the imposter isn't "being bad," they're reading a route that genuinely says left where everyone else's says right — and because they never see the real turn, hiding means guessing it.

## How it works
The host TV shows a grid city, a start, a goal, and fog — only visited cells and their neighbors are lit. The true route (say 6 turns) is split into contiguous slices, one per player, each shown privately ("your turns: ↑ →"). One random phone is the imposter: its slice is identical except one arrow is flipped to a plausible wrong direction, and it's privately told so.
Driving: the car advances step by step; whoever owns the current step taps their arrow to move it. Thanks to fog, a wrong turn rarely dead-ends immediately — the car wanders and only later strands in a cul-de-sac or misses the goal. When the imposter's bad step arrives, they must either drive their wrong arrow or gamble on the true direction they never saw.
Deliberation: if the car fails, players retrace aloud over the now-revealed map, arguing whose slice hid the error. Each phone privately votes one suspect. Crew fingers the imposter = crew wins; imposter hides = imposter wins.
Private per phone: your route slice and role. Shared: the car, the fog, the vote.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Room{grid, start, goal, path[], slices:{pid:[stepIdx]}, imposterId, alteredStep, carPos, revealed[], phase, votes}. The server owns carPos and fog; on a drive tap it validates ownership, moves the car, recomputes revealed cells, and broadcasts to the host. Route generation: pick a solvable path, split into contiguous per-player slices, then mutate exactly one imposter step to a direction that stays legal but eventually dead-ends — search for a mutation whose failure is delayed ≥2 steps. The hard part is that generator (guaranteeing delayed, ambiguous failure) plus tight car-animation sync so everyone sees the same position.

## v1 scope
- 3 players, one round, one 8×8 map, 6-turn path split 2/2/2
- Fog reveal, tap-to-drive, one altered turn, single vote

## Out of scope
- Multiple rounds, scoring, procedural map packs
- Multiple imposters or multiple altered turns
- Undo / in-app chat (talk in the room)

## Risks & unknowns
- If step ownership is obvious, the derailing step names the imposter outright — mitigated by fog + delayed failure so the culprit step stays ambiguous.
- The generator may struggle to guarantee delayed dead-ends on small maps.
- Could feel more like a puzzle than a bluff if the talk phase is thin.

## Done means
Three phones join, each gets a private route slice with one flagged imposter, tapping drives the shared car with correct fog reveal, a wrong turn produces a delayed non-arrival, retrace plus private vote resolves, and the reveal shows the true path versus the altered arrow — proving the different-slice view drives real suspicion.

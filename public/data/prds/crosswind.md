## Overview
A cooperative nautical navigation game for 3–5: one **Navigator** whose phone is the only map, plus 2–4 **Wind** hands who are blind pieces. The Navigator can see everything and move nothing; the Winds can move the boat and see nothing.

## Problem
Blind-coordination party games usually park the board on the TV so everyone half-sees it, which quietly kills the asymmetry. The delicious social situation — one person owning the whole map and having to *talk* everyone else through it while they act on faith — is almost never built, because it only works when the map genuinely lives on a single private screen.

## How it works
The **Navigator's phone** shows a top-down sea chart: foggy grid, a boat token, a harbor goal, and 2–3 rocks. They can see it all but cannot touch the boat. Each **Wind phone** owns one movement axis: Wind-NS shows only ↑/↓, Wind-EW shows only ←/→, plus a private *puff counter* (e.g. 6 puffs) hidden from the other Wind.

Each round opens a ~10-second commit window. Every Wind secretly picks one of {+, 0, −} on their axis. On resolve, the boat moves by the **vector sum** of the gusts (↑ and → together = one diagonal tile; ↑ and ↓ from a hypothetical extra pair would cancel and waste both puffs). Landing on a rock = a leak = loss. The Navigator coaches out loud between rounds — "hold NS, tap East, gently!" — but never touches anything.

**Private vs shared:** Navigator phone = full chart (private). Each Wind phone = its own axis + its own puff count (private, hidden from other Winds). The **host TV** shows only ambient sea, the round number, and a shared *total-puffs-remaining* pressure clock — never the boat's position. The map exists on exactly one phone.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `Room {mapGrid, boatPos, harborPos, rocks[], puffsRemaining, phase}`, `Player {role, axis, puffsLeft, committedThisRound}`. Sync: server is authoritative; each round it opens a commit window, collects secret gust intents, resolves the vector sum, and broadcasts the new `boatPos` **only to the Navigator** plus the puff clock to all. Hard part: fair simultaneous secret commit with a countdown, defaulting a non-committing Wind to 0, and server-side visibility filtering so `boatPos` never touches a Wind's or the TV's socket.

## v1 scope
- 3 players: 1 Navigator + 2 Winds (NS axis, EW axis)
- One 8×6 grid, 3 rocks, one harbor, ~12-puff shared budget
- One round; voice coaching allowed; win = reach harbor before puffs run out

## Out of scope
- More/diagonal dedicated Winds, currents & drift, multiple boats
- Scoring, leaderboards, reconnection polish, no-voice constrained-comms mode

## Risks & unknowns
- Is voice coaching delightfully chaotic or just frustrating?
- Unintended cancellation must feel like a funny group blunder, not a punish
- Commit-window timing; keeping the TV alive without leaking position

## Done means
Three phones join; the Navigator sees a chart the others can't; two Winds secretly commit axis moves each round; the server resolves the vector sum and the boat reaches harbor or leaks — and at least once the table erupts because a mistimed cancel burned the last two puffs a tile from safety.

## Overview
A 4-player asymmetric hidden-movement game for phones + TV. One player is the **Beast**, whose phone is the only place the monster exists; the other three are **Hunters** whose phones each show a private proximity 'heartbeat.' The Beast is the living board — a map that fights back.

## Problem
Hidden-movement games (Scotland Yard) put all the secret info in one guide's head and make everyone else deduce from public clues. The itch: give each hunter their *own private* sensor tied to their *own* position, so the deduction is distributed and physically parallel — no shared clue everyone stares at, but three overlapping partial truths that only combine when players talk.

## How it works
A small grid. Three Hunter tokens sit on it; one hidden monster, controlled by the Beast, roams it.

- **Beast's phone (PRIVATE, the map):** the full grid with the monster and all three Hunter tokens. Each turn the Beast secretly slides the monster one cell (orthogonal), trying to slip through gaps between the closing Hunters.
- **Hunter phones (PRIVATE, per-piece):** the grid outline with ONLY your own token visible. A big pulsing heartbeat meter shows BPM proportional to Chebyshev distance from your token to the monster (adjacent = frantic, far = slow). You tap to move your token one cell/turn. Once per game you may tap **NET** to strike your current cell.
- **Shared TV (PUBLIC):** the grid + three Hunter dots, a turn counter, and a room-wide 'tension' throb (aggregate of the three BPMs, so spectators feel it) — but never the monster.

Because each Hunter only knows their own distance, no one can pinpoint the monster alone; they must call out 'mine's racing!' and triangulate by talking. The Beast wins by surviving all turns or reaching an edge exit; Hunters win if a NET lands on the monster's cell (or they box it with no legal move).

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). **Data model:** `room{ grid, monster:{x,y}, hunters:{id,x,y}, turn, netsUsed:{} }`. **Sync:** turn-based, so hard-real-time isn't the enemy — the server resolves a turn once all three Hunters submit a move (or timeout), applies the Beast's queued monster move, then computes each Hunter's new BPM privately and pushes only that scalar to each Hunter phone. Hunters NEVER receive the monster coordinate. The genuinely hard part is *anti-leak*: the client must never hold data it shouldn't render, so BPM is computed server-side and sent as an opaque number; the monster cell only ships to the Beast and (on a NET/box resolution) to the TV for the reveal.

## v1 scope
- 3 Hunters + 1 Beast, one 5×5 grid.
- 6 turns; simultaneous Hunter move submission per turn.
- One NET per Hunter; BPM in three coarse bands (cold/warm/hot).
- Win/lose reveal animates the monster's whole path.

## Out of scope
- Multiple monsters, walls, role rotation, scoring across rounds.
- Continuous real-time movement; free-form chat channel.
- Reconnect mid-turn beyond rejoin-to-state.

## Risks & unknowns
- Coarse 3-band BPM may be too vague or too precise — needs playtest tuning.
- Beast may feel passive on a 5×5; edge-exit incentive must be strong enough to create chase.
- Turn timeout handling if a Hunter goes idle.

## Done means
Four phones join; the Beast sees a monster three others cannot. Each turn, submitting three Hunter moves advances the board, and each Hunter's heartbeat band updates from their own distance only. A NET on the monster's cell triggers a Hunters-win reveal tracing the monster's path; surviving 6 turns triggers a Beast-win.

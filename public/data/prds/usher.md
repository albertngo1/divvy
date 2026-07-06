## Overview
A 4-player cooperative navigation game for phones + a shared TV. One player is the **Usher**, holding the only view of a dark manor; the other three are **Guests** stumbling through it blind. It's a party game about rationing vision — the Usher literally cannot show everyone the way at once.

## Problem
'Guide-the-blind-friend' bits are fun but usually collapse into one person shouting turn-by-turn directions. That's a monologue, not a game. The itch: make the guide's attention a scarce resource, so the tension is *who gets helped now* while the others grope in the dark and try to remember.

## How it works
The hidden board is a small grid manor: walls, a few pits, one exit. Guests start scattered; every Guest must reach the exit.

- **Usher's phone (PRIVATE, the map):** the full manor — walls, pits, exit, and live positions of all three Guest tokens. The Usher drags a small circular 'lantern' around the grid. Any Guest token inside the lantern radius receives a 1.5s snapshot.
- **Guest phones (PRIVATE, per-piece):** almost entirely black. When the Usher's lantern lands on you, your phone flashes the 3×3 cells around your token (wall/open/pit/exit) for 1.5s, then fades to black. You tap D-pad arrows to move your own token one cell per tick. You must *remember* what you glimpsed.
- **Shared TV (PUBLIC):** the manor silhouette with fog obscuring layout; three Guest dots as vague blurs, plus a burning candle timer. It reveals drama, not the map — the room can cheer without spoiling.

The fun is the Usher's triage: three Guests wandering toward pits at once, one lantern. Guests shout 'me! me!' but must act on stale memory when unlit.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room, or Socket.IO over Tailscale Serve). **Data model:** `room{ grid[][], exit, pits[], guests:{id,x,y}, usher:id, lanternPos, candleMs }`. The server holds the authoritative grid; Guest clients never receive full grid, only the `reveal` payload (their local 3×3) when lit. **Sync:** Guest move → server validates against hidden grid (pit = eliminated) → broadcasts token position deltas to TV + Usher only. Usher lantern drag → server computes which Guests are inside → pushes private `reveal` events to just those phones. The genuinely hard part is *reveal fairness under latency*: the lantern is continuous and the snapshot brief, so the server must timestamp lantern-enter events and guarantee each lit Guest gets their full 1.5s window even if packets jitter — buffer the reveal server-side and let the client render the countdown locally.

## v1 scope
- 3 Guests + 1 Usher, one 5×5 manor, one exit, 3 pits.
- One 90-second round; candle = timer.
- Lantern lights any Guest inside a fixed radius; no lantern cooldown.
- Win = all Guests reach exit before candle dies.

## Out of scope
- Multiple rounds, role rotation, scoring.
- Moving hazards, keys/doors, larger maps.
- Reconnect handling beyond a rejoin-to-last-position.

## Risks & unknowns
- Memory load: is a 1.5s glimpse enough to act on, or maddening? Tune radius/duration.
- Usher may over-focus one Guest; needs a soft nudge (dimming an un-lit-too-long Guest's TV dot).
- Could degenerate into the Usher just parking the lantern on the leader.

## Done means
Four phones join via room code; the Usher sees a full 5×5 map and three others see black. Dragging the lantern over a Guest flashes exactly that Guest's surroundings for 1.5s and no one else's. A Guest stepping onto a pit is eliminated on the TV. All-Guests-reach-exit before 90s triggers a win screen.

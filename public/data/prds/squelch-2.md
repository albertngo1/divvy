## Overview
Squelch is a real-time, no-talking party game for 3 players about *not* landing on the same frequency as anyone else — while blind to where everyone else is. The host TV is a shared radio spectrum full of hiss. Each phone is a private tuner: you can only feel a rising interference buzz as a rival's frequency creeps toward yours, and only *you* know which channels are jammed dead for you. The room wins only if all three settle onto clear, well-separated frequencies at once. Coordination onto the same channel is the failure.

## Problem
Anti-coordination games usually give you a clean shared board to spread out on. The itch here is doing it *by feel*, with asymmetric private constraints: the open channel that looks perfect to you sits inside someone else's only clear zone. There's no map of the others — just a needle that trembles when you're too close, so you renegotiate the spectrum silently and physically, cranking your dial and listening.

## How it works
The host shows one horizontal spectrum bar (0–100) crawling with animated static and a single **CLARITY** meter — how close the room is to all-clear. It never shows anyone's frequency.

Each phone privately shows:
- A big **tuning slider** (drag or hold-to-crank).
- Its own **dead zones** — 2–3 greyed frequency ranges that are jammed *for that player only* (tuning into them = instant fail buzz). Every player's dead zones differ, so the clear channels differ per player.
- An **interference needle**: magnitude only, rising as *any* other player's current frequency approaches yours — no direction, no identity, no count.

Goal: within a 60s round, reach a state where all three players are (a) outside their own dead zones and (b) no two within 8 units of each other, held steady for 3 seconds. Because the safe channels overlap and contend, you must feel the buzz spike, back off, and let the room breathe apart. Collisions (two frequencies too close) spike everyone's on-screen static and reset the hold timer.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { players: { pid: { freq: number, deadZones: [[lo,hi]] } }, phase, holdStartTs }`. Phones stream their `freq` (throttled ~20Hz) to the server; the server computes each player's interference magnitude (min distance to any *other* freq) and pushes back only that scalar — never the raw positions. It also evaluates the global all-clear condition and drives the host CLARITY meter. The genuinely hard part is real-time sync: keeping the interference needle responsive under mobile latency without leaking directional info, and running the authoritative 3-second hold check so no client can fudge the win.

## v1 scope
- Exactly 3 players, one 60s round.
- Server-assigned private dead zones + private interference scalar.
- All-clear = outside dead zones + pairwise ≥8 apart, held 3s.
- Host spectrum + single CLARITY meter; reveal of all three dials on win/loss.

## Out of scope
- More players, multiple rounds, scoring ladders.
- Real mic/audio input (buzz is generated feedback, not ambient).
- Directional hints or any rival identity.

## Risks & unknowns
- Magnitude-only feedback may be too vague to converge in 60s — may need a coarse hot/cold pulse.
- With only 3 players the spectrum may be too roomy; shrink usable range or add more dead zones.
- Mobile drag latency could make the needle feel laggy and unfair.

## Done means
Three phones join, each sees its *own* dead-zone map the host never shows, live-tune with a private interference needle that never reveals who or where, and the server authoritatively detects the all-separated-and-clear hold to trigger a shared win — with a reveal showing all three final frequencies overlaid on the spectrum.

## Overview
Gantry is a co-op crane-operation game for 3 players. A single gantry crane lives on the host TV; its controls are split across three phones and no one can see the whole scene. The only shared bus is your voices.

## Problem
Most co-op games hand everyone the same view, so "coordination" is really just parallel play. Real coordination stress comes when both CONTROL and SIGHT are fragmented — when you literally cannot act without narrating to the person who can see what you're doing.

## How it works
The host TV shows a warehouse: a crane hook over a grid, a block, a target slot — but heavily fogged. Each phone PRIVATELY owns one control AND one fragment of the truth:
- Phone A: hold LEFT/RIGHT buttons; sees only where the BLOCK currently sits.
- Phone B: hold FORWARD/BACK buttons; sees only the TARGET slot.
- Phone C: LOWER / GRAB / RAISE; sees only the HAZARD cells.

No one alone can complete the pick — A knows the block but not the destination, B knows the destination but not the block, C must time the grab but can't move the hook. The only path is continuous voice: "left a hair — stop — no, you're drifting onto a hazard, back off — now down and grab." The shared TV shows the live hook position; everything else stays on the phones that own it.

PRIVATE per phone: your control buttons + your un-fogged map layer. SHARED on TV: the crane's live position and the countdown.

## Technical approach
Host + phone PWAs + authoritative WS server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Model: World { hook:{x,y,z}, block, target, hazards[], carrying }. Phones send control intents on button down/up; the server integrates hook motion on a fixed ~20 Hz tick and broadcasts hook state; each phone renders only its private layer over the shared hook position.

The hard part is real-time control feel over the network: turning held-button intents into smooth continuous motion despite latency. Use client-side prediction of the hook from locally held buttons + server reconciliation, and cap hook speed so lag-induced overshoot is always recoverable. Assignment logic must guarantee the puzzle is unsolvable solo — each of the three facts lives on a different phone.

## v1 scope
- 3 players, one block, one target, one hazard cell, one round
- Success = grab the block and drop it in the target without ever entering the hazard, within 2 minutes
- Three fixed control assignments, one fixed map

## Out of scope
- Multiple blocks, rotation, gravity/physics
- Timed scoring, mid-game control swaps, spectators, >1 round

## Risks & unknowns
- Latency making the crane feel floaty and frustrating rather than tense
- Whether three fragmented views reads as "coordination fun" or just "confusing"
- Players craning over each other's phones to cheat the fog (mitigate: keep fragments genuinely small and private)
- Tuning motion speed so voice-guided nudges land

## Done means
Three phones each drive one axis and see only their fragment; via voice alone the group grabs the block and lands it in the target while avoiding the hazard; and a solo player provably cannot finish because they are missing two of the three required facts.

## Overview
A competitive stealth game for 3–5: one **Hunter** whose phone is the only map of a dark maze, versus 2–4 blind **Prey** racing for private exits. The Hunter sees the board; the Prey are pieces who can't.

## Problem
Hide-and-seek-in-the-dark on a screen normally forces the board onto the TV, so everyone half-sees and the dread evaporates. The genuinely tense version — a predator whose *only* sense is the noise you make, and prey who literally cannot see the room they're stumbling through — only works if the map lives on one private phone and every prey decides, alone and simultaneously, whether to risk a step.

## How it works
The **Hunter's phone** shows the maze walls top-down — but **no prey dots**. Instead, whenever a prey *moves* on a tick, a noise ping blooms on the Hunter's map at that tile. Prey who **freeze** emit nothing and stay invisible. The Hunter moves one tile per tick, hunting toward pings; landing on a prey's tile eliminates them.

Each **Prey phone** shows a claustrophobic private slice: their own tile, the immediately adjacent walls, a compass arrow to *their* personal exit, and a "steps taken / steps allowed" bar. Prey see no other prey and never the Hunter. Every tick, each prey secretly chooses **MOVE(dir)** or **FREEZE**. Reach your exit = you escape.

**Private vs shared:** Hunter phone = walls + noise pings (private). Prey phone = own cell + exit compass (private). The **host TV** shows only anonymized fog: black maze, faint "someone moved" ripples with no identity or location, and a running Escaped/Caught tally. The map is on exactly one phone.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `Room {maze, exits{playerId→cell}, tick, phase}`, `Player {role, pos, stepsLeft, alive}`. Each tick: collect secret prey intents, resolve prey movement, compute noise pings from displacement, then advance the Hunter. Sync: server is authoritative and filters visibility per socket — the Hunter receives pings not positions, each prey receives only its local slice, the TV receives anonymized ripples. Hard part: a clean tick cadence with simultaneous secret commits, and tuning noise so freezing is viable but stalling loses (the step-budget clock forces motion), all while never letting a true position reach any client but its owner.

## v1 scope
- 4 players: 1 Hunter + 3 Prey
- One 8×8 maze, a distinct exit per prey, ~12 ticks, one round
- Freeze/Move only — no items, no flares

## Out of scope
- Flares/items, multiple hunters, real-mic sound, reconnection, cosmetics
- Cross-round scoring or progression

## Risks & unknowns
- Is blind movement tense or just random-feeling? Local-view legibility is everything
- Noise-radius and step-budget tuning make or break it
- Hunter role: thrilling or overwhelmed by ambiguous pings?
- Tick pacing — auto-advance vs. Hunter-triggered

## Done means
Four phones join; the Hunter sees a maze with noise pings nobody else sees; each prey sees only its own cell and an exit arrow; a prey freezes to dodge a closing ping and later gets caught mid-dash; the round ends with an Escaped/Caught tally on the TV.

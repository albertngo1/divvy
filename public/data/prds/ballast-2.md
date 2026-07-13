## Overview
Ballast is a 3-4 player cooperative balancing game for a host screen plus private phones. The host shows a ship (or a listing platform) rocking under waves; the only public information is how far it's tilted and which way. Each player privately controls one cargo hold. Keeping the deck level for one storm requires constant verbal negotiation — because nobody but you can see how much your hold weighs or what you can move.

## Problem
Most 'balance the thing' games are single-controller reflex toys. The itch here is a *continuous* coordination problem where the shared display deliberately hides who should act. You can see the boat is leaning to port, but you can't see whose hold is overloaded — so the room has to talk: 'I've got 40 in the port hold, I can dump 20, who's countering to starboard?' It's live, it drifts, and over-eager correction is punished.

## How it works
The **host screen** renders the ship, its tilt angle, a tolerance band (green = safe, red edges = danger), and a survival timer. It shows NO per-hold weights and no player identities — just the aggregate lean. Waves perturb the tilt every few seconds, so equilibrium is never static.

Each **phone** privately shows: its own hold's current weight, its capacity (overfill = your hold floods, instant loss), and its cargo pieces with LOAD / DUMP buttons of fixed increments. Your dumps shift ballast toward the opposite side. The load-bearing catch: because holds are on different sides and you can only see YOUR side of the ledger, leveling requires announcing your weight and intent aloud. And correction collides — if two players DUMP within the same ~250ms server window, the ship over-swings past level and lists hard the other way. So you must not just act, but *sequence* your actions by voice: 'you go first, then me on three.'

## Technical approach
- **Server:** authoritative WebSocket room (Socket.IO / PartyKit) over Tailscale Serve; a fixed-tick simulation (~20Hz) owns the true tilt.
- **Data model:** `Ship{tiltAngle, tiltVelocity, tolerance, timer}`; `Hold{seat, side, weight, capacity, increment}`; wave schedule as a seeded impulse list.
- **Sync:** phones send LOAD/DUMP intents; the server applies them to the tick, integrates tilt from net side-weight + wave impulses, and broadcasts only the aggregate tilt to the host while each phone gets only its own hold state. Collision rule: intents landing in the same tick window both apply, deliberately overshooting.
- **Hard part:** the physics feel and fair collision timing. Tilt integration must be twitchy enough that talking matters but forgiving enough that ~200ms voice lag doesn't guarantee a capsize; and simultaneous-dump detection must be RTT-normalized so a laggy phone isn't unfairly blamed for the overshoot.

## v1 scope
- Exactly 3 holds (port / starboard / center), 3 players.
- One 60-second storm with a scripted wave schedule.
- Fixed dump increment, single capacity limit, one win/lose screen.
- Host tab + phone PWA join by code.

## Out of scope
- 4+ holds, variable cargo types, weight the room can't see changing over time.
- Multiple storms, difficulty ramps, scoring.
- Reconnect handling, spectators.

## Risks & unknowns
- The fun hinges entirely on physics tuning — too stiff and it's frustrating, too soft and voice coordination is pointless.
- 'Only see the tilt' may be too little public info; may need a subtle direction arrow to keep it playable.
- Collision-punishment could feel like bad luck rather than a coordination failure if latency normalization is off.

## Done means
Three phones on one code each control one hold with private weight/capacity; the host shows only aggregate tilt drifting under a scripted wave schedule; the room keeps tilt in the green band for 60 seconds by voice-sequenced loads/dumps, and two dumps within the same server tick demonstrably over-correct the ship.

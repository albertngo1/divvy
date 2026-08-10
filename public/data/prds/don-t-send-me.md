## Overview

A 4-player, ten-minute semi-co-op. One **Navigator** holds the only copy of the board on their phone. Three **Legs** share a single token they will never see, and each privately owns a differently-shaped step die. Every turn the table argues about terrain they can't see, using capabilities they can lie about.

## Problem

Hidden-map games usually make the map-holder omniscient and the pieces obedient. That's a lecture, not a negotiation. The fix is two-sided fog: the Navigator can't see what the Legs are made of, and the Legs can't see what the Navigator is steering around. Neither side can verify the other, so both have to talk — and both can shade the truth.

## How it works

**Navigator's phone (private):** a 16-tile track with the shared token, the finish, and four pits. Landing on a pit knocks the token back 5. They can say anything in plain language — "I need 3, maybe 4, absolutely not 8" — but cannot show the screen.

**Each Leg's phone (private, different per phone):** their own six-face step die and nothing else. The shapes are deliberately unequal — steady (2,2,3,3,4,4), streaky (1,1,1,1,9,9), spiky (5,5,5,0,0,0). You know yours. You know nobody else's. After you roll, your die **fatigues**: your highest face drops to your lowest, silently. The hero of turn one is dead weight by turn four, and only they know it.

**Each turn:** the Navigator states a need out loud. All three Legs then privately and simultaneously submit VOLUNTEER or PASS with a stake of 1-3. Simultaneity is the whole point — nobody gets to see who steps up first. Exactly one volunteer rolls. Multiple volunteers: highest stake rolls. Nobody volunteers: the token slides back 2 and the turn burns.

**Host TV (shared):** an unlabeled progress ribbon with the token's position — the room feels progress but never sees danger — plus the turn counter and who volunteered *after* bids reveal.

Reach the finish in 6 turns and everyone wins. The texture is people insisting they're useless, or insisting they're not, about a number the Navigator can never audit.

## Technical approach

Host tab + phone PWAs + a Socket.IO server behind Tailscale Serve (turn-based, so no tick loop). State: `{ pos, turn, hazards[], legs: { id, faces[6], rolls } }`. The server owns every die and the RNG, and emits to each Leg socket only its own `faces` — dice never transit another client. Bids land in a sealed pool released only when all three arrive or a 15s deadline expires.

The hard part is not real-time sync; it's the sealed-bid barrier surviving reality. A backgrounded iOS PWA must not hang the table: per-turn deadline with auto-PASS, and a resume snapshot keyed to a session token so a reconnecting Leg gets their current (fatigued) die back, not a fresh one.

## v1 scope

- 1 Navigator + 3 Legs, one 16-tile track, hardcoded pits
- Three fixed die shapes, fatigue on, 6 turns
- One hazard type (pit), one round, win/lose card
- Voice is the only Navigator channel; no in-app messaging

## Out of scope

Multiple rounds or a series, per-Leg secret objectives, branching tracks, custom dice, role rotation, animation beyond a token sliding, any scoreboard.

## Risks & unknowns

The Navigator may leak the map by over-describing, flattening the game — a stated "no tile numbers" house rule may need to become an enforced vocabulary. Three dice may be too few shapes for real bluffing. Fatigue may be invisible in a 6-turn game; if so, make it steeper, not longer.

## Done means

Four players finish a round in under 6 minutes with no dead air waiting on a phone. A payload dump from any Leg client contains only that Leg's faces. In at least one of three playtests, the Navigator sends a Leg whose die cannot produce the needed number, and the table can reconstruct who oversold themselves.

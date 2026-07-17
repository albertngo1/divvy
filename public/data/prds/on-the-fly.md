## Overview
A cooperative real-time kitchen-chaos game for 2-4 players that steals *Overcooked* and rebuilds it as a per-phone controller party game. The host TV is "the pass"; each phone is a single cook station you cannot leave. The fun is the yelling.

## Problem
Overcooked's joy is coordination panic, but it needs a shared screen with split gamepads, and any "pass one phone around the room" party game destroys the simultaneity that makes a kitchen frantic. We want every player physically busy at their own station at the same time, unable to reach anyone else's controls.

## How it works
The host TV shows *shared* state only: the incoming ticket rail (orders arriving with countdowns), the plating zone where finished dishes are dropped, and the team score/clock. Crucially it does **not** show who is currently holding which ingredient.

Each phone is one station with *private* controls:
- **Grill:** raw patties queue up; you tap to flip, watching a private doneness bar — overcook and it burns (wasted).
- **Expo/Plate:** you assemble bun + patty into the order shown on the TV rail and slam it to the pass.

Ingredients only cross stations via a **two-phone handshake**: the holder taps "Pass →", the receiver must tap "Catch" within ~2s or the item drops and is lost. Since no phone shows another station's hands, you must call it out loud: "patty up — who's plating?" / "heard!". That verbal call-and-response *is* the game.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve for same-room LAN). Data model: `Kitchen { orders[], stations{grill,expo}, held{playerId->item|null}, score, clock }`. The server owns all cook timers and order timeouts; phones send *intents* (`flip`, `pass`, `catch`) and receive per-station deltas plus the shared TV rail. Hardest part: validating handoff windows with sub-200ms fairness while each phone's private doneness bar animates smoothly — client-side interpolation of the grill timer with periodic server reconciliation, and a server-timestamped 2s catch window so neither side can cheat lag.

## v1 scope
- 2 players only.
- Two stations: grill + expo.
- One recipe: bun + patty.
- 3 orders, 90-second round, single shared score.
- One successful/failed handoff per pass, no undo.

## Out of scope
- More stations (chop, fryer, drinks), multiple recipes, garnish.
- Fail states beyond order timeout / burn / dropped handoff.
- 5+ players, cosmetics, level select, persistence.

## Risks & unknowns
- Can players just stare at the TV instead of talking? Held-item ownership must stay hidden to force callouts.
- Handoff-window tuning: too tight = rage, too loose = trivial.
- Mobile drag/tap ergonomics under time pressure.

## Done means
Two phones complete at least 2 of 3 burgers in 90s, at least one cross-station handshake succeeds, the TV shows a final score, and playtesters audibly shouted a station callout during the round.

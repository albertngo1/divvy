## Overview
Four-Way is a cooperative real-time voice game for 3–4 players sharing a TV/laptop host and each holding a phone. Everyone plays a driver approaching a single-lane four-way stop. It's for groups who love the shout-over-each-other panic of Devils & the Details but want continuous flow instead of task lists.

## Problem
The itch is *hidden-stakes negotiation under a clock*. Party games rarely give each player secret, personal urgency that only they can see, forcing them to *announce* it verbally to coordinate a shared scarce resource. "Line up by your hidden number" is a known ice-breaker, but it's static and silent. Real intersections are dynamic, loud, and unforgiving — that's the feeling.

## How it works
A single intersection sits on the host screen with four approach lanes and a shared clock. Cars arrive in waves; only ONE car may cross at a time. Each phone privately shows *only that driver's* urgency for their current car — a rank plus flavor ("AMBULANCE — go now," "wedding, you're late," "carrying eggs, go slow"). Crucially the host screen never shows anyone's urgency, so the *only* way to share it is to say it out loud: "I'm an ambulance, let me through!" Each phone has a single GO button. Tap when the intersection is clear and it's your turn; the collective score rewards crossing in true-urgency order. But if two phones GO inside the same ~250ms window, they collide — both cars bounce back to the queue in a crunch of horns, and the wave timer ticks down.

Private (phone): your current car's urgency + your GO button. Shared (host): the intersection, who's mid-crossing, the wave clock, the collision animations.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit). State: `{ intersection: 'free'|carId, queue[], players: { id: { car: { urgency } } }, wave, clock }`. Phones send timestamped GO events; the server owns crossing state and broadcasts. The genuinely hard part is **fair collision detection under variable phone latency** — deciding whether two GOs truly overlapped or one legitimately preceded the other requires normalizing client timestamps against server-measured RTT so a laggy phone isn't unfairly blamed for a T-bone.

## v1 scope
- 3 players, one intersection, one 90s round
- Two waves of cars; one car per player at a time
- Urgency = simple 1–3 rank with flavor text
- Score = successful crossings minus collisions; bonus for correct order

## Out of scope
- Bluffing/lying incentives, 4-way vs roundabout variants, pedestrians, per-player scoring, turn-signal gestures

## Risks & unknowns
- Latency comp feels unfair if wrong; single GO button may be too thin without richer verbal stakes; do private urgencies generate enough *argument* to justify voice (tune rank spread)

## Done means
Three phones each show a distinct private urgency; players announce priorities aloud, cross one at a time, a simultaneous double-GO is detected and both cars bounce, and the host tallies clean crossings vs collisions at the buzzer.

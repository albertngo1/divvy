## Overview

**Aim Assist** steals the twin-stick shooter and removes the screen you are shooting at. Four players sit in a circle. Each phone runs two things at once with two thumbs: your own dot, which you steer to score, and a blind reticle you drag across an empty field hunting *someone else's* dot. Your only feedback is a hot-cold meter. Your best feedback is the sound of a person flinching.

For 4 players who can sit knee-to-knee and are willing to be loud.

## Problem

Shooters are the most anti-party genre there is: they need a screen each, and screens each means a silent room. But the good part of a shooter — the hunt, the near-miss, the tell — doesn't need pixels. It needs a target that *reacts*. Put the target in the room and the flinch becomes the aiming data.

## How it works

At start, the server draws a secret hunt cycle: A hunts B hunts C hunts D hunts A. Nobody is told either end of their own edge.

**Each phone (private):**
- *Left thumb — your dot.* A blank 2D field with a moving glowing **zone**. Sitting inside your zone earns 1 point per half-second. Your zone position is yours alone; it never appears anywhere public.
- *Right thumb — your reticle.* A featureless field of the same size and a **heat bar** giving the distance from your reticle to your prey's *actual* dot. Nothing else. A FIRE button with a 2s cooldown fires a small blast radius.
- A hit stuns you for 3 seconds, kills your scoring streak, and vibrates hard. You will make a noise.

**Host screen (public):** a 3-minute clock, four score bars, and a hit ticker ("someone was hit"), naming the victim but never the shooter. At the end it draws the hunt cycle as four arrows.

The decision is constant and clean: sitting in your zone scores but keeps you findable; drifting keeps you alive but idle. The real information channel is the room — a groan tells your hunter they were close, and tells *you* someone else just got tagged. Watching thumbs helps. Poker-facing a direct hit is the skill ceiling.

## Technical approach

Host tab + phone PWAs + one Durable Object (PartyKit) ticking authoritative state at 20Hz. Model: `Player{dot:{x,y}, zone:{x,y,r}, stunUntil, score}`, `Hunt{hunterId→preyId}`.

The security-shaped detail is the sync strategy: the server must never transmit anyone's coordinates to anyone but their owner. Each socket receives its own dot echo, its own zone, and a single **scalar** — `dist(reticle, prey.dot)` — computed server-side per tick. A player sniffing their own websocket learns nothing but a number they already see. Clients interpolate their own dot locally and reconcile.

The hard part is latency asymmetry: at 150ms a hit lands where the prey *was*, which reads as unfair. Mitigation is a generous blast radius (~12% of field width) and server-side rewind of ~100ms on FIRE. Tuning heat-bar responsiveness matters more than anything — too coarse and hunting is hopeless, too fine and it's a solved tracking task.

## v1 scope

- Exactly 4 players, one 3-minute round, fixed hunt cycle drawn once
- One field size, one zone that jumps every 8 seconds
- FIRE on 2s cooldown, one hit type, 3s stun
- Score = zone-time + 5 per landed hit; TV shows bars and the end reveal
- No lobby, no reconnect, no sound from the phones (the room is the sound)

## Out of scope

More than 4 players, obstacles or cover, weapon variety, mutual hunting (two-way edges), teams, rematch flow.

## Risks & unknowns

Biggest risk: blind hunting is unfun if the heat bar is too weak — the hunt has to feel like closing in, not guessing. Second: two thumbs on one phone may simply be too much; the fallback is alternating 10s hunt/dodge phases, which costs the simultaneity that makes the flinch-leak work. Third: quiet groups starve the audio channel entirely.

## Done means

Four phones and a TV. In a 3-minute round, at least 6 hits land, at least half of them follow a visible or audible reaction from the victim, and in the post-round reveal at least two players correctly name who was hunting them.

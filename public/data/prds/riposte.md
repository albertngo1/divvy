## Overview
Riposte steals the Souls-like parry: that knife-edge window where reading an attack's tell and countering at the exact frame turns death into a riposte. It splits a single boss's tell across every phone so no one player can read it alone. For groups who want a tense, real-time reaction game that isn't trivia and isn't drawing.

## Problem
Parry timing is the most satisfying beat in action games and the least shareable—it's one player's twitch, invisible to the couch. Meanwhile most co-op party games are turn-based or verbal-only. Riposte makes a reflex *collective*: the reaction window is real and unforgiving, but the information needed to hit it is scattered, so the room has to fuse it out loud in two seconds.

## How it works
The TV shows a boss that, every ~8 seconds, begins a 2-second WIND-UP into a named attack. During that wind-up each phone privately streams ONE channel of the tell, live: Phone A sees a COLOR swelling (red=parry-now, blue=dodge-instead, so a wrong call kills you); Phone B sees a shrinking TIMING RING that hits zero at the exact parry frame; Phone C feels/sees a RHYTHM (three pulses, act on the third). No phone shows more than its channel, and the TV shows none of them—only the boss's animation. The room must shout: 'It's RED!'—'ring's at half!'—'on my third pulse—now!' Everyone taps PARRY inside a shared ~450ms server window. All correct + in-window = a riposte that chunks the boss; a mistimed or blue-attack parry costs a life. Three attacks, three lives, one boss. Survive to win.

## Technical approach
Host tab plays the boss animation off a server-owned transport clock so every wind-up start has a canonical `t0`. Authoritative WebSocket server (PartyKit / Durable Object) holds `{attack:{id,type,parryFrame,channels}, lives, taps:[]}` and, at wind-up, sends each connected phone ONLY its assigned channel payload plus the shared clock. Phones render their channel by extrapolating from `t0` + latency offset (calibrated once via a 4-tap sync like a rhythm game). Taps return with client timestamps; the server judges each against `parryFrame ± window` in canonical time. Hard part: sub-second cross-device timing fairness—solved with per-phone latency calibration and server-side judgment in clock-space, never wall-clock.

## v1 scope
- 3 players, 3 fixed channels (color / ring / rhythm), one boss, 3 attacks
- One parry window per attack, shared 450ms
- One-time latency calibration on join
- Lives + win/lose on the TV

## Out of scope
- More than 3 channels or dynamic channel assignment
- Dodge/roll as a distinct input beyond 'don't parry'
- Multiple bosses, combos, difficulty scaling

## Risks & unknowns
- Is 450ms achievable/fair across phones on home wifi?
- Can players verbally fuse three channels fast enough to be fun, not flaily?
- Channel legibility (rhythm especially) on a phone glanced at mid-panic

## Done means
Three phones calibrate, each shows exactly one tell channel during a live wind-up, and a playtest room can land at least one synchronized 3-phone riposte—demonstrably impossible with a single phone that can only show one channel at a time.

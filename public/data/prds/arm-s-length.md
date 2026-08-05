## Overview

A 90-second, stand-up party game for 4–6 players in one room. Every phone holds a private rule about physical proximity — *be the nearest phone to Jo*, *don't be anyone's nearest*, *be farther from Sam than Kim is from Sam*. Phones measure who is near whom with inaudible speaker chirps. At the whistle, every satisfied rule scores its owner. You may say anything, including lies.

## Problem

"Room as board" usually means a screen pretending to be a room. Here the board is where your body actually is, and the only way to score is to move real people — by persuasion, by lying, by physically taking someone's wrist and walking them across the carpet. There's no existing party game where the win condition is a seating chart nobody agreed to.

## How it works

1. Each phone privately shows **one rule**, drawn from three templates, naming real players by name.
2. Rules conflict. Not every set is satisfiable; typically 3 of 5 can hold at once. This is not communicated.
3. The floor is open — talk, argue, bluff. "I need to be by the window, trust me" is a legal and usually false sentence.
4. Every 700 ms the room runs a **ranging frame**: each phone gets a 120 ms slot to play an 18.5–20 kHz chirp while every other phone measures energy in that band. Amplitude ranking, not metres — the rules only care about *order*.
5. At 0:00 a 3-second **freeze** begins. Move during the freeze and your own ranges go stale, and a stale phone's rule auto-fails. The last-second scramble is expensive on purpose.

**Phone (private):** your rule, and a live green/red satisfied indicator so you know when to stop pushing. **Host TV (shared):** an unlabelled adjacency graph — the *shape* of the room's clustering, live, with no names and no rules — plus the clock. Everyone can see a tight cluster forming; nobody can see whose cluster it is.

## Technical approach

Host tab + phone PWAs + PartyKit DO. The server assigns chirp slots and publishes a shared epoch; phones estimate their clock offset from WebSocket round-trips (±30 ms is ample inside a 120 ms slot). Playback via WebAudio oscillator; detection via a Goertzel filter on the analyser node, so no FFT and no ML.

Each phone reports a vector of per-peer band energies at ~1.4 Hz. The DO converts each vector to a **rank order** and evaluates rules only against ranks. Absolute distance is never computed, never displayed, and never needed — which is what makes this shippable.

**The hard part is honest ambiguity.** Reverb makes two similar distances indistinguishable. If the top-two amplitudes are within a 20% margin, the ranking is marked *ambiguous*, the rule fails, and the TV shows an ambiguous badge rather than silently guessing. Second hard part: half-duplex scheduling — a phone must not evaluate its own chirp, and a pocketed or face-down phone is heavily attenuated, so the client warns "nobody can hear you" when its chirp registers on zero peers.

`Room { code, phase, epoch, slots[], players: { id, name, rule{type,args}, satisfied, energies{peerId:float}, lastFrame } }`

## v1 scope

- One 90-second round. Exactly 4 players. Phones held screen-up in hand.
- Three rule templates only: nearest-to-X, not-nearest-to-anyone, farther-from-X-than-Y-is.
- One point per satisfied rule at freeze. No rounds, no totals.
- TV shows adjacency graph + clock. Nothing else.

## Out of scope

Metres, floor plans, team modes, more than 6 players, phones in pockets, any rule referencing a *place* rather than a person.

## Risks & unknowns

Cheap phone speakers roll off hard above 18 kHz; some units may be unusable and need a fallback tone at 17 kHz that a few players will hear and hate. iOS requires a gesture to start audio and will duck other output. Aggressive input AGC distorts amplitude — request `echoCancellation:false, autoGainControl:false, noiseSuppression:false` and verify per-device. Biggest design risk: if rules are too easy the room solves it in 20 seconds and the freeze never bites.

## Done means

In a 4×5 m room with 4 phones, the server's nearest-neighbour ranking matches tape-measured ground truth in ≥85% of 40 sampled frames; and at least one playtest ends with a player having physically walked another player across the room to satisfy a rule they never said out loud.

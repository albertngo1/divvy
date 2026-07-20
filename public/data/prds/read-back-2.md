## Overview
A frantic 3-4 player cooperative voice game in the Spaceteam lineage, dressed as air-traffic control. Every player is a pilot sharing one crowded radio frequency; the host TV is the tower/scope. The room wins by clearing a short queue of clearances with zero breaches before the timer — but only if the right pilot answers, reads back verbatim, and refuses the clearances their private aircraft physically can't accept.

## Problem
Most voice party games let anyone shout anything. The itch here is *disciplined* radio comms: a single channel where talking over each other destroys the message, where you must recognize your own callsign among near-identical decoys, and where only you know your plane is too heavy to climb. Listening carefully and staying silent is as important as speaking.

## How it works
Each phone privately holds an **aircraft card**: a callsign ("Speedbird 12"), current altitude, and ONE secret constraint ("HEAVY — cannot climb", "LOW FUEL — cannot accept holding", "STUDENT — cannot land 27R"). Nobody else sees your constraint.

The host TV (automated Tower) issues clearances one at a time as text + synthesized voice: *"Speedbird 12, descend flight level 180."* Crucially it also issues decoys to sound-alike callsigns ("Speedbird 20") that belong to nobody. A congestion meter and the live queue sit on screen.

On your phone: a **hold-to-talk** key. When a clearance is yours you key the mic and must (a) read it back verbatim aloud, then tap CONFIRM; or (b) if it violates your private constraint, transmit "UNABLE" + reason and tap REFUSE, which asks Tower to reissue an alternative. The single frequency means only ONE phone may transmit at a time — two keys inside the RTT-normalized window = STEPPED ON, both transmissions void, meter spikes. Responding to a decoy or to someone else's callsign is a breach. Clear the queue before the frequency saturates.

Privately per phone: your card, your key state, your "is this mine?" judgment. Shared on TV: the frequency, the queue, breaches, congestion. A single passed-around phone collapses the game — the fun is many bodies straining to not step on each other while each guards secret constraints.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{queue[], channelHolder, congestion}`, `Player{callsign, altitude, constraint, keyState}`. Single-channel arbitration is the hard part: on key-down the phone sends a timestamp; server normalizes against per-client measured RTT and grants the channel to the earliest, voiding overlaps inside ~250ms. Readback verbatim can be tap-confirm + spoken-aloud (social enforcement) in v1, with optional on-device Web Speech API matching as a stretch. Clearance text generation must guarantee sound-alike callsign decoys and constraint-violating clearances that are actually solvable.

## v1 scope
- 3 players, one round, 4 clearances in the queue.
- Hard-coded set of 6 aircraft cards and 8 clearances.
- Hold-to-talk + tap-confirm readback; spoken aloud but not ASR-verified.
- Server single-channel collision arbitration with RTT normalization.
- Win/lose screen: breaches vs clearances cleared.

## Out of scope
ASR verbatim scoring, multiple rounds, difficulty scaling, more than 4 pilots, voice synthesis polish, reconnection.

## Risks & unknowns
Collision fairness under jittery phone latency is the classic risk. Decoy callsigns must be hearable-but-distinguishable — too subtle is unfair, too obvious is boring. Tap-confirm may under-enforce actual verbatim reading; social pressure may suffice for v1.

## Done means
3 phones join, each gets a distinct card, 4 clearances issue in sequence, the correct pilot can read back or refuse, simultaneous keys reliably register STEPPED ON, and the room reaches a win screen when all 4 are cleared with breaches counted correctly.

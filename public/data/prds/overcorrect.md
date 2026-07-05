## Overview
Overcorrect is a 3-player co-op game built entirely out of control loops closed by voice. Everyone owns a gauge they cannot touch and holds the controls to someone else's gauge they cannot see — the only way to keep your own needle in the green is to shout instructions to the person who can actually move it.

## Problem
Devils & the Details tasks are mostly independent little chores. The richest coordination is a feedback loop: I can see the problem but can't fix it; you can fix it but can't see it. That mutual blindness forces continuous, sloppy, funny voice traffic — and no party game has been built purely out of that loop.

## How it works
A ring of 3. Each phone privately shows TWO things: (1) YOUR GAUGE — a needle drifting toward red that you must keep centered, but with NO controls of your own; (2) NEIGHBOR CONTROLS — two cryptically labeled buttons ("VALVE K7 +", "BLEED") that move your clockwise neighbor's gauge, whose position you cannot see.
Host screen (shared): the three gauges as tiny silhouettes with only a room-wide STABILITY bar (how many are in the green right now) and the timer — enough to feel the tension, not enough to play off of.
So: your needle sags → you shout "MORE K7, more— too much, back off!" at whoever holds your controls; meanwhile your neighbor is yelling at you about the buttons you hold. Three overlapping voice loops run at once. Overcorrection — they give too much — overshoots the needle into the opposite red, hence the name. Gauges drift continuously on a server tick, so silence equals failure; you must keep talking.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit/DO or Socket.IO over Tailscale Serve). Data model: `Room {code, deadline, gauges: {playerId: {value, drift}}, controlMap: playerId→controlsGaugeOf}`. Server ticks ~10Hz: `value += drift ± buttonImpulses`, clamps, computes in-green count. Each phone subscribes to exactly two streams: its own gauge value (full detail) and button-press ACKs for the gauge it controls — but NOT that gauge's value, which is the whole point. Sync: server authoritative on all values; a button press is an impulse event and the owner sees the result on their private gauge. Hard part: tuning drift rate vs. button impulse vs. tick latency so the loop is controllable-but-frantic — too twitchy and voice can't keep up, too sluggish and it's dull — plus making "you can't see the gauge you control" airtight so voice stays mandatory.

## v1 scope
- 1 round, 90s, exactly 3 players in a fixed ring
- One gauge each, 2 control buttons each, continuous drift
- Host: 3 silhouettes + stability bar + timer
- Win = keep all 3 in green for a cumulative target time; lose = any gauge pinned red too long

## Out of scope
- 4+ players / configurable ring, multiple gauges per player
- Mic/voice recognition (voice is real-room, not verified)
- Difficulty curves, scoring, reconnects

## Risks & unknowns
- Could dissolve into indecipherable yelling — labels must be few and distinct.
- Drift/impulse/latency tuning is make-or-break; prototype the feel first.
- 3-way simultaneous talk may be too much — validate the loop with a 2-player mutual pair before scaling to the ring.

## Done means
Three phones join, each sees its own drifting gauge and its neighbor's two controls (never the gauge it controls), pressing a button visibly moves the owner's needle within a tick, and a round ends win/lose based on time-in-green shown on the host screen.

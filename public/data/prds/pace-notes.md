## Overview
A two-phone rally-racing party game that steals the driver/co-driver relationship at the heart of the genre. One player white-knuckles the wheel with almost no forward visibility; their partner is the only one who can see what's coming and has to call it out loud, in rhythm, before it arrives. It's for 2 players per car (host can run a couple of cars back-to-back for a bigger room).

## Problem
Racing is the most obvious Jackbox genre and the most boring version of it — everybody tilts, TV shows the leaderboard. The actual soul of rally is a trust exercise between two people with radically different information. That asymmetry only exists if two separate phones hold two separate views.

## How it works
Host TV (public): a chase-cam of the car on the stage, a running clock, and big obvious CRASH / OFF-TRACK flashes. That's it — no corner previews.

Driver phone (private): a tilt-steering wheel plus throttle/brake buttons. The screen shows only a tight, headlight-cone view of the road ~1 second ahead — enough to react, never enough to plan. They literally cannot see the next corner.

Co-driver phone (private): the scrolling roadbook — "left 4… tightens… 100… right 6, don't cut… crest" — locked to the car's real position, advancing as the car moves. No steering control whatsoever. Their entire job is to read the notes aloud early enough for the driver to act.

Both screens are live and simultaneous; neither works without the other. A phone passed around the room is useless because both roles must be held at once, in real time, by different hands and different eyes.

## Technical approach
Host browser tab + two phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `car {pos, heading, speed}`, `track = [segments]`, `notes = [{atDistance, text}]`. Driver phone streams steering/throttle at ~20Hz; server runs the authoritative physics tick and broadcasts `car` state to host and co-driver so the roadbook scroll stays pinned to true position. Driver runs light client-side prediction on its own headlight view to hide latency. Genuinely hard part: keeping the co-driver's note position and the TV chase-cam locked to the same authoritative car position under jitter — if notes drift even 0.5s the whole trust loop collapses. Fixed-timestep sim + server-stamped positions + interpolation.

## v1 scope
- One 45-second stage, five corners, gravel physics.
- Exactly 2 players: one driver, one co-driver.
- Win = finish under a target time; +3s penalty per off-track.
- Roadbook is a hand-authored fixed sequence.

## Out of scope
- Multiple cars racing head-to-head.
- Damage model, weather, night stages.
- Note customization or difficulty tiers.

## Risks & unknowns
- Tilt steering feel over the network — may need generous assist.
- Whether players naturally fall into the call-and-react rhythm without a tutorial.
- Motion sickness from the tight headlight view.

## Done means
Two people on two phones complete the stage where the driver demonstrably could not have finished without the co-driver's spoken calls, and a silent co-driver reliably ends in a crash.

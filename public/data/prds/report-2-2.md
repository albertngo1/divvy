## Overview
Report is a cooperative spatial-acoustics party game for 4 players in one room. Three phones become a distributed microphone array; the fourth player, the Caller, is handed a secret spot on a map and must physically walk to the matching place in the real room and clap once. The array localizes the clap by sound-arrival timing, and the host TV drops a dot where the room 'heard' it. The delight is watching an invisible sound event resolve into a coordinate on the shared board.

## Problem
Phone party games ignore that four phones scattered in a room are a genuine spatial sensor. Sound reaches each mic at slightly different times, and that difference *is* a position. Nobody plays with the room's acoustics as the board.

## How it works
Three players place their phones anywhere in the room (shelf, couch arm, table) — these are the array nodes. Calibration: the TV shows a top-down room rectangle; each array player drags their phone's icon onto the map where they placed it (rough is fine). The Caller's phone PRIVATELY shows the same room map with one highlighted target cell — nobody else sees it. The Caller walks to where they think that cell is in real space and taps 'READY,' then claps once, hard. Every array phone timestamps the clap onset locally; the server solves the time-difference-of-arrival multilateration and the SHARED TV animates a dot landing at the computed position. Score = closeness of the localized dot to the Caller's secret cell. The array phones see only a 'listening…' pulse and their own signal meter — never the target, never the answer until reveal. Rotate the Caller for more rounds.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `room{ nodes:[{id,x,y,clockOffset}], caller:{id,targetCell}, round }`. Each phone runs an AudioWorklet computing short-window RMS; an onset is the first sample index crossing an adaptive energy threshold, giving sub-buffer (~sample-accurate) timing. The genuinely hard part is cross-phone clock sync: phones share no clock, so each does NTP-style offset estimation (repeated WS ping/pong, keep min-RTT sample) to map local onset time → common server time. Server collects three onset timestamps, computes TDOA pairs, and solves 2D position by least-squares multilateration against the calibrated node coordinates. Speed of sound (~343 m/s) over a 3 m room = ~9 ms spreads = ~400 samples at 44.1 kHz — comfortably resolvable if clock offset error stays under a couple ms.

## v1 scope
- 4 players: 3 fixed array phones + 1 Caller
- One clap, one round, no rotation
- Manual map calibration by dragging icons
- 4×4 target grid; score = grid distance

## Out of scope
- Auto-locating array phones acoustically
- Reverb/echo rejection, multi-clap disambiguation
- Competitive scoring, more than 4 players

## Risks & unknowns
- Clock sync accuracy under browser jitter is the whole ballgame
- Hard reflections in small rooms may bias localization
- iOS mic permission + AudioWorklet timing consistency

## Done means
With 3 phones on a 3 m table edge and a Caller clapping at a known cell, the TV dot lands within one grid cell of the true clap position on 3 of 5 attempts.

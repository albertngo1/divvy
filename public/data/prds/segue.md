## Overview
Segue is a 3–4 player cooperative voice game for a room with a shared TV and personal phones. The group is a live radio crew that must fill a fixed block of airtime with *continuous* speech — exactly one voice at all times. Dead air loses. Two voices at once loses. The catch: the running order lives nowhere but in the players' phones and ears.

## Problem
Most voice party games are turn-based or shouting-free-for-alls. There's no game about the specific, delightful terror of *broadcast continuity* — the way real DJs and talk-radio hosts hand off mid-breath so the signal never drops. Spaceteam nails panic; nothing nails the smooth-relay-under-pressure feeling.

## How it works
Host screen (shared): one big ON AIR meter, a 90-second airtime bar draining, a DEAD AIR flash when the room goes silent >0.6s, a CROSSTALK flash when two mics are hot at once, and a live count of clean handoffs completed. No scripts, no order, no ownership shown.

Each phone (PRIVATE): (1) a talking-point card — a topic you must ad-lib about while you hold the air ("the weather on Mars," "why cats hate Tuesdays"); (2) your HANDOFF WORD — a specific word you must work into your patter to pass the mic; (3) your CUE WORD — when you hear *this* word spoken, it's your turn to start talking. The handoff graph is a chain: your handoff word is exactly one other player's cue word. No phone shows who's next; you discover the chain by listening.

Mic level is read continuously (Web Audio RMS). The server tracks who is "hot." Round wins when the airtime bar empties with N clean handoffs and no fatal dead-air/crosstalk streak.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{airtimeMs, deadAirMs, crosstalkMs, handoffCount}`, `Player{topic, handoffWord, cueWord, micHot:bool, lastOnsetTs}`. Phones sample mic RMS at ~20Hz, send a debounced `hot/quiet` transition with a client timestamp; server normalizes against per-client RTT (rolling ping) to build a single timeline of who's speaking. Silence = zero hot players; overlap = ≥2 hot for >250ms (RTT-adjusted). The genuinely hard part is fair hot/quiet arbitration under jittery mobile mics and latency — needs hysteresis (separate on/off thresholds), a room-noise calibration step, and RTT-normalized overlap windows so a lagged phone isn't blamed for crosstalk it didn't cause. Handoff detection is manual: the receiving phone taps "I'M ON" when it hears its cue, so we don't need speech-to-text in v1.

## v1 scope
- 3 players, one 90-second round, a single fixed handoff chain.
- Mic-level detection only (no transcription); handoffs confirmed by tap.
- Host shows meter, airtime bar, dead-air/crosstalk flashes, handoff count.
- One canned deck of topics + handoff/cue words.

## Out of scope
- Speech-to-text auto-detecting spoken cue words.
- Branching chains, sabotage roles, scoring leaderboards, multiple rounds.
- Audio recording/playback of the "show."

## Risks & unknowns
- Mic thresholding across cheap phones may misfire — calibration is essential.
- Rooms with ambient noise/music could read as permanent crosstalk.
- Players may just tap through without really talking; mic gate must gate handoffs.

## Done means
Three phones in one room complete a 90s round: the airtime bar drains, the server logs ≥2 clean handoffs, a deliberate double-talk triggers CROSSTALK, and a deliberate pause triggers DEAD AIR — all within ~300ms of the real event.

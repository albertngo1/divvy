## Overview
Filibuster is a 3-4 player cooperative voice game for one shared host screen (TV/laptop) plus a phone per player. The premise: a reactor stays online only while the room maintains an unbroken, single-speaker stream of chatter. Go silent and it stalls; two of you talk at once and it overloads. You must keep the floor covered for 60 seconds, passing it hand to hand.

## Problem
Almost every voice party game punishes overlap with short, discrete bursts — buzz in, shout a word, stop. None capture the specific improv terror of *never being allowed to stop talking* while also never stepping on anyone. Filibuster makes continuous coverage the whole game, and layers private constraints so every hand-off is a gamble.

## How it works
The **host screen** shows one big AIRTIME meter. It drains toward RED when the room is fully SILENT and spikes toward RED when two or more people speak at once. Green for 60s = win.

Each **phone shows privately**: (1) your TOPIC constraint — you may *only* talk about, say, breakfast, or you may only ask questions; (2) a STAMINA bar that drains while you hold the floor — hit zero and you overheat unless you pass; (3) a PASS button, armed only when your own mic detects *you* are the active speaker. To pass you say "take it, Dana" and tap PASS — Dana's phone buzzes and arms her mic. Because nobody sees anyone else's topic, receiving the floor drops you cold onto your own secret constraint. That's the comedy: you inherit a live mic with a rule only you know.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Each phone runs on-device voice-activity detection (WebAudio RMS over a calibrated noise floor, with hangover smoothing) and reports a `speaking:bool` + its current RMS at ~10Hz. Data model: `room{airtime, floorHolderId, deck}`, `player{topic, stamina, speaking, rms}`. Server ticks at 100ms, counts concurrent speakers, and moves the meter.

The genuinely hard part is speaker attribution: every phone hears the *whole room*, so raw VAD says everyone is speaking always. Solution: relative loudness — the phone whose RMS is both highest and above its own calibrated floor is "the speaker"; a second phone within a margin band counts as overlap. A 3-second calibration captures each phone's baseline at start.

## v1 scope
- 3 players, one 60-second round
- Topics drawn from a fixed deck of 6
- Fail on first sustained gap (>2s silent) OR sustained overlap (>0.8s)
- Pass = spoken name + tap; buzzes the named phone
- Pass/fail only, no scoring

## Out of scope
- Infiltrator/hidden roles, points, multiple rounds
- Custom topics, difficulty ramps, two simultaneous floors

## Risks & unknowns
- VAD reliability in a genuinely loud room
- Relative-loudness attribution when players sit close together
- Hand-off latency making a clean pass feel laggy

## Done means
Three phones and one host: the team completes or fails a 60s round; the AIRTIME meter visibly reacts to real silence and real overlap within ~300ms; saying a name + tapping PASS arms exactly that phone's mic.

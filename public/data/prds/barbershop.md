## Overview
Barbershop is a cooperative singing game for 3-5 players who probably can't sing. The host TV is a chord that's badly out of tune; each phone is assigned one secret note and becomes a private pitch coach for exactly one human. Players physically scatter to opposite corners of the room so their phones can hear their own singer over everyone else, then hum in unison to resolve the chord.

## Problem
The phone microphone is almost always used as a crude loudness meter. Real pitch detection (fundamental frequency via autocorrelation) is very achievable in-browser and completely underused for play. And group singing games normally need one shared mic that hears mush; giving each singer their own listening device — and forcing them apart in the room so the mics isolate — turns 'the room' into the instrument.

## How it works
Each phone privately shows: your secret note (e.g. 'hum a C — like this ♪' with a reference tone you can tap to hear), plus a live tuner needle showing whether YOU are sharp, flat, or centered — visible only to you. Nobody else knows your note; you can't just mirror a neighbor's screen.

The shared host screen shows the target chord as a stack of bars, one per player, each filling as that player holds their pitch in-band. It also plays the evolving chord aloud (host owns all audio to avoid device drift). When ALL players hold their assigned notes within tolerance simultaneously for 3 continuous seconds, the chord resolves — the bars lock gold, the TV swells, confetti.

The load-bearing bit: each phone's mic monitors only its own singer's pitch in real time, all at once. A single passed-around phone cannot listen to three people humming different notes simultaneously — and if players cluster, mic bleed makes every phone read the loudest neighbor, so the game physically pushes them to separate corners of the room. Where you stand is the mechanic.

## Technical approach
Host tab + phone PWAs + authoritative WS server (Socket.IO over Tailscale Serve or PartyKit). Each phone runs `getUserMedia` → AudioWorklet → autocorrelation/YIN pitch estimate at ~30Hz, maps Hz to nearest semitone, and sends only `{inBand: bool, cents: int}` (never raw audio) at ~10Hz. Data model: `players[id] = {targetNote, inBand, holdMs}`; server tracks a room-wide `allInBandSince` timestamp and fires `resolved` when every player has been in-band continuously ≥3s. Sync is easy (booleans, low rate); the genuinely hard part is robust monophonic pitch detection on cheap phone mics with cross-room bleed and no per-device calibration — plus octave errors, which we clamp by accepting any octave of the target note in v1.

## v1 scope
- 3 players, one fixed 3-note chord (root/third/fifth), one round.
- Octave-agnostic matching, ±40 cents tolerance, 3s hold to win.
- Private note + tuner needle per phone; host bars + chord audio + win screen.

## Out of scope
- Scoring, multiple chords, progressions, difficulty tiers.
- Detecting WHO is off (bars already show it), sabotage roles.
- Noise-robust source separation; leaderboard/persistence.

## Risks & unknowns
- Pitch detection reliability across phones and untrained hummers.
- Mic bleed when the room is small; may need a minimum-spread nudge.
- iOS mic permission + AudioWorklet over HTTPS gesture gating.

## Done means
Three phones join one room, each shows a distinct secret note and a live private tuner; when all three humans hold their notes within tolerance for 3 seconds at once, the host chord resolves to a win screen — and clustering the phones together demonstrably breaks detection, proving the per-phone, spread-out architecture is doing the work.

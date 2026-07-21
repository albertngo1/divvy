## Overview
In Tune is a 3–4 player cooperative singing game for a living room. Nobody needs to be a good singer — the comedy is a room of amateurs trying to blend into one in-tune chord in real time. It's Spaceteam for your vocal cords: private assignments plus frantic cross-talk to sort out who sings what.

## Problem
Karaoke is solo and serial — one person performs while everyone waits. Nothing forces a whole room to *listen to each other's voices at the same instant* and physically adjust to blend. Group singing is either passive (everyone knows the song) or chaos. There's no party game where the fun is four humans becoming a chord.

## How it works
Each phone privately shows ONE assigned note, e.g. "Sing **C**" with a tappable reference tone you can hear once through the earpiece. Crucially, one or two phones instead show "**OPEN — take whatever note is missing**." Phones never reveal each other's assignments.

The host TV shows a pitch ladder with three target zones (root / third / fifth of a major triad) plus an unlabeled live dot for each player's *currently detected* pitch. Everyone hums or sings at once. Each phone runs on-device pitch detection on its own player (mic proximity means your phone tracks *you*, not the person across the couch) and streams your fundamental to the server. WIN = all three target zones occupied, every player within ±40 cents of a chord tone, held stable for 2 seconds.

Because OPEN players don't know which zone is empty, and because two people may accidentally double the same note while the fifth sits empty, players MUST call out — "I'm on the low one, someone grab the top!" The private per-phone note is the whole engine; a single phone passed around can't monitor four simultaneous singers.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). On-device pitch detection via YIN/autocorrelation over a Web Audio AnalyserNode at ~30Hz, smoothed. Phones send `{pitchHz, confidence}` at ~15Hz. Server maps each pitch to nearest semitone, evaluates chord completion + a 2s stability window, and broadcasts ladder state to the host. Data model: `players[{id, assignedNote|OPEN, livePitch}]`, `target: {root, third, fifth}`. The genuinely hard part is pitch robustness in a noisy room — crosstalk from other singers bleeding into your mic, vibrato, untrained voices. Mitigations: per-phone noise-floor calibration on join, confidence gating, near-field loudness bias (loudest source = your singer), generous cent tolerance. Latency is a non-issue since it's a sustained-hold check, not a collision race.

## v1 scope
- 3 players, one fixed-key major triad, one 60s round
- Exactly one OPEN assignment
- Reference-tone playback + live ladder
- Win/lose only, no scoring

## Out of scope
- Chord progressions, minor/seventh chords, key selection
- Harmony grading or per-player accuracy scores
- Backing track, leaderboards, 5+ players

## Risks & unknowns
Tone-deaf players may physically fail to hit the note → frustration (mitigate with wide tolerance + reference tone). Mic crosstalk could mis-attribute pitches. Core unknown: is a room of off-key singers landing a chord *delightful* or just annoying?

## Done means
Three phones in one room, each singing its assigned/OPEN note; the host's three dots settle into the triad zones and hold 2s → WIN screen. Reassigning a phone's note visibly changes which pitch that player must chase.

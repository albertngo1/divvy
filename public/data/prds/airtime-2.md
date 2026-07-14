## Overview
Airtime is a 3–5 player concurrent-room party game for a group that likes a tense tragedy-of-the-commons. The shared TV is a live radio soundboard; each phone is a private script and a fuel gauge. Talking is literally metered — the mic charges you for every sound you make — so the fun is rationing who gets to speak and when, with almost no ability to openly plan because planning burns the very resource you're fighting over.

## Problem
Most 'silence' party games treat the mic as a binary bust (you laughed → out). Nobody has made talking a *budget* you spend and can bankrupt for the whole table. Airtime makes speech scarce and shared, so every utterance is a real decision.

## How it works
The team shares one draining pool of 'decibel-seconds' shown on the host TV as a big fuel bar. Each player must, over the round, say their own secret target phrase (e.g. 'the weather over Nantucket') loudly and clearly enough that THEIR OWN phone's speech recognition confirms it — that banks points. But: every second any phone hears voiced sound above threshold drains the shared pool by that loudness. Ambient chatter drains the pool AND raises the noise floor, making recognition fail (wasting the attempt). If the pool hits zero before everyone's phrase is banked, the team loses.

PRIVATE on each phone: your secret phrase (nobody else's), your personal recognition status, and a small 'you're currently the loudest in the room' warning. PUBLIC on the TV: the shared fuel bar, a count of phrases banked (n/5), and an anonymized 'someone is spending' pulse — never who or what phrase. So you can't coordinate turn-taking openly (talking costs pool + masks); you improvise a silent airtime queue with glances and gestures, spending speech only in clean quiet gaps.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room {poolMs, banked[], noiseFloor}`, `player {id, phrase, banked:bool, spentMs}`. Each phone runs WebAudio RMS at ~20Hz and on-device SpeechRecognition; it streams only a debounced (loudness, isVoiced, recognizedMatch) tuple to the server — never raw audio. Server decrements the shared pool from the summed loudness of all reporting phones and broadcasts pool + banked count at 10Hz. Hard part: fair, device-independent loudness so a loud phone-mic doesn't tax its owner unfairly — solve with a 5s per-phone calibration (ambient + a normal-voice sample) mapping each mic to a normalized scale, and hysteresis so one cough isn't ruinous.

## v1 scope
- One round, 3–4 players, fixed 90s worth of pool.
- One secret phrase per player from a small hand-authored list.
- Fuel bar + n/5 banked on TV; phrase + status on phone.
- Per-phone calibration step; RMS + SpeechRecognition only.

## Out of scope
- Multiple rounds, scoring leaderboards, difficulty tiers.
- Sabotage roles, per-player private pools.
- Android/iOS SpeechRecognition parity polish beyond 'good enough'.

## Risks & unknowns
- Cross-device loudness fairness is the crux; bad calibration kills it.
- iOS Safari SpeechRecognition support is spotty — may need a Whisper-tiny fallback.
- Could devolve into total silence with nobody daring to bank; tune pool generosity.

## Done means
4 phones join, calibrate, each has a distinct private phrase; a shared pool visibly drains only when someone is voiced; a clearly-spoken phrase banks for the right player; if all phrases bank before zero the TV shows WIN, else LOSS.

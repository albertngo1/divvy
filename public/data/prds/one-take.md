## Overview
A 4–6 player party game where the deliverable is a 90-second audio recording. The host laptop records the room continuously. Every phone privately holds a small set of **cue windows** — instants where its owner is *required* to put a sound on the tape. Everything else must be silence. At the end the room listens back to the take and votes, sound by sound, on who made it. You score for hitting your cues and for *not being identified*. For friends who like Werewolf but are bored of talking their way through it — here talking is the crime scene.

## Problem
Mic-driven party games treat the microphone as a volume meter: shut up, number goes up. That's a chore, not a game. Nobody has made the microphone into a *record* — a permanent artifact you're judged on afterward. Silence is only interesting when breaking it leaves evidence.

## How it works
1. **Setup (10s).** Host tab shows a join code and a big scrolling timeline. Each phone privately receives 2 cue windows (e.g. `0:14–0:16`, `0:51–0:53`) drawn so that some players' windows *overlap* and some are alone in the dark.
2. **The take (90s).** Host records via `getUserMedia`, drawing a live waveform on the TV. **Phones show only:** a countdown to *your* next cue, a fat MAKE A SOUND button-sized bar that pulses during your window, and your remaining "anonymity" score. **The TV shows:** the waveform, the clock, and nothing about who is cued when. Any sound is printed. Unfired cues cost you.
3. **The catch.** Because the TV publishes the waveform in real time, you can see when *someone else* just made noise — and if your window is open, that is the moment to hide inside theirs. Two sounds within 400ms merge into one blob at playback, and a blob nobody can split is un-attributable.
4. **Playback & attribution (60s).** Host replays the take, pausing at each detected onset. Every phone privately taps a name. Scoring: +3 hit your cue, +2 per voter who guessed you wrong, −4 per uncued sound traced to you (cough, laugh, chair scrape — all real, all fair game).

## Technical approach
Host browser tab = recorder + authority over the clock. Phone PWAs join over a Cloudflare Durable Object (one DO per room) via WebSocket. Data model: `Room {code, phase, takeStartedAtServerMs}`, `Player {id, name, cues:[{startMs,endMs,fired}], score}`, `Onset {tMs, mergedIds:[], votes:{voterId→playerId}}`.

Sync strategy: cue windows are absolute offsets from `takeStartedAtServerMs`; each phone runs an NTP-style offset estimate (5 ping/pong round trips, take the median) so its local countdown lands within ~50ms of the host's. Onset detection runs **on the host only** — a spectral-flux detector over the recorded PCM, computed after the take, not live, so no streaming-audio plumbing.

The genuinely hard part: onset detection that is *forgiving enough to be fair*. Too sensitive and the HVAC scores; too dull and a whispered cue vanishes. v1 calibrates a noise floor from 5 seconds of room tone before recording and thresholds at floor + 9dB.

## v1 scope
- One take, 90 seconds, 4 players, fixed cue schedule (hand-authored, guarantees 2 overlaps).
- Host tab does record → detect onsets → replay. No cloud storage; audio never leaves the host.
- Attribution round: tap a name per onset, one pass, no discussion timer.
- Text scoreboard. No animation.

## Out of scope
Multiple takes, sound-type classification, speaker diarization/voice ID, saving or sharing the recording, spectator mode, more than 6 players.

## Risks & unknowns
Onset detection false-positives could make the whole thing feel arbitrary — mitigate by showing the waveform so blame is visibly evidence-based. Phone mics are unused in v1 (host mic only), so a player far from the laptop is quieter; may need a distance handicap. Also: is 90 seconds of enforced silence *fun* or just tense? Suspect tense-then-hilarious, but that's the bet.

## Done means
Four phones join, each gets different cue times, the host records a 90s take, onset detection finds every deliberate cue plus any accidental noise, playback pauses at each onset, all four privately vote, and the final screen shows at least one merged blob that split the room's votes.

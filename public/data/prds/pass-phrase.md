## Overview
Pass Phrase is a 4–5 player cooperative whisper relay for people who love telephone-game corruption but want real stakes. Players sit in a ring; each phone is a private earpiece + recorder for exactly one link of the chain. The mic enforces a whisper — voiced (pitched) speech instantly jams your link — so the whole table works in a tense, breathy hush, passing a phrase around the ring before it rots into nonsense.

## Problem
Telephone is a one-phone-passed-around toy with no enforcement and no tension. Pass Phrase makes it live and simultaneous: everyone whispers at once, each hears only their own predecessor, and the enforced-whisper rule turns the room into a genuine, self-policing quiet.

## How it works
The ring is seeded with a secret phrase given (as text, privately) only to Player 1. The round runs in ~8s ticks. On each tick EVERY player simultaneously: (1) hears, through their own earbuds only, the whisper their left neighbor recorded last tick; (2) whispers what they think they heard into their own phone for the next tick. Because playback is per-phone and private, no one but you hears your predecessor — you truly cannot do this by passing a single phone around, since one shared speaker would leak every link at once.

ENFORCEMENT: each phone analyzes its own recording for voicing (pitch periodicity). If you slip into a normal voice — or talk out loud to coordinate — your clip is flagged 'JAMMED', that link passes silence onward, and the chain degrades faster. PRIVATE on each phone: your incoming whisper (audio), your link number, your jam warnings. PUBLIC on the TV: a ring diagram with per-link 'clean/jammed' lights and a tick countdown — never the phrase itself. After the phrase completes the loop, Player 1 reveals the original and the last player says their final decode aloud; the team scores on word overlap.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `ring [playerIds]`, `tick n`, `clip {fromPlayer, blobRef, voicedRatio}`. Each phone records a 6s Opus clip via MediaRecorder, runs a lightweight autocorrelation voicing check locally (voiced-frame ratio → jam if above threshold), and uploads the clip; the server routes each clip to exactly one recipient (the right neighbor) for the next tick and broadcasts only the clean/jammed lights. Sync strategy: server-clocked ticks with a 1s grace to absorb upload latency. Hard part: reliable whisper-vs-voice detection across cheap mics and loud rooms — mitigate with a per-phone calibration whisper + relative (not absolute) pitch-strength thresholding, plus earbuds strongly recommended to keep playback out of neighbors' mics.

## v1 scope
- One phrase, one lap, 4 players, earbuds assumed.
- 8s ticks, 6s record window, autocorrelation voicing gate.
- Ring lights + countdown on TV; private clip + jam warning on phone.
- Hand-authored seed phrase list; word-overlap score at the end.

## Out of scope
- Multi-lap, competing rings, scoreboards.
- Speech-to-text scoring (final decode is spoken aloud, human-judged).
- Speaker-mode fallback for players without earbuds.

## Risks & unknowns
- Voicing detection false-positives could feel unfair; needs tuning.
- Without earbuds, playback bleeds into neighbors' mics and breaks privacy.
- 6s whisper clips may be too degraded/inaudible; calibrate gain.

## Done means
4 phones form a ring; each hears only its predecessor's whisper privately; a normal-voice utterance flags that link JAMMED on the TV; a seed phrase travels one full lap; the final player's spoken decode is compared to the original and a corruption score is shown.

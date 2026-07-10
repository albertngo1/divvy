## Overview
Falloff is a cooperative, wordless party game for 3–5 people in one room. The host TV plays a steady broadband tone from a single speaker; each player's phone is a private acoustic dosimeter that quietly tells only its owner where in the room to stand. It's for groups who like Jackbox but want to get out of their chairs and use the room itself.

## Problem
Audio party games either become karaoke or a shouting match. The itch here is a *quiet* physics game: sound gets softer as you walk away from a speaker, and every player can privately feel that gradient. Nobody has a game that turns a living room's acoustic falloff into a board you stand on.

## How it works
The host tab plays continuous pink noise from the TV's speaker. Each phone PRIVATELY shows two horizontal bars: a fixed **target** loudness and a live **measured** loudness from its own mic (RMS, smoothed). Players walk toward or away from the speaker until their live bar sits inside their target band, then hold still 3 seconds to "lock." Because every phone's target differs, players naturally settle at different distances — concentric arcs around the TV.

The shared host screen shows ONLY anonymous lock status: e.g. "2 of 4 locked" and a calm/urgent ambience. It never reveals anyone's target or position. The round is won when all players are locked simultaneously. The genuinely fun wrinkle: human bodies absorb and reflect sound, and rooms have standing-wave nulls, so one player moving nudges everyone else's readings — reaching all-locked-at-once forces silent spatial negotiation.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { toneOn, players[] }`, `Player { id, targetDb, currentDb, locked, lockStartTs }`. Phones compute loudness locally via WebAudio `AnalyserNode` (time-domain RMS → dBFS), sending a 5 Hz throttled `currentDb`; server holds authoritative lock state and win detection. The hard part is calibration and sync: phone mics vary wildly and AGC lies, so v1 does a 5-second per-phone auto-calibration (measure ambient floor + tone-at-arm's-length) and works in RELATIVE dB, and the 3-second lock must survive the ~200 ms jitter of all phones reporting near-simultaneously.

## v1 scope
- 3 players, one round, one preset target set (near / mid / far).
- Single fixed pink-noise tone, host-triggered.
- Per-phone calibration wizard, two-bar match UI, 3-second lock.
- Host shows only "N of 3 locked" + win screen.

## Out of scope
- Competitive scoring, multiple rounds, phone-emitted tones (that's a different game).
- Precise SPL calibration, room mapping, non-Chromium mic quirks.

## Risks & unknowns
- Mic AGC may flatten the gradient; mitigation: disable via `echoCancellation:false, autoGainControl:false` where supported, else lean on relative bands.
- Standing-wave nulls could make a target unreachable in a small room — tune target bands wide.
- Ambient noise (talking) pollutes readings; game rewards silence anyway.

## Done means
Three phones on one Wi-Fi, tone playing: each player can walk to a distinct distance, see their live bar enter the target band, hold 3 s, and the host flips to a win screen only when all three are simultaneously locked — with no target ever shown on the shared screen.

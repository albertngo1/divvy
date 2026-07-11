## Overview
Pin Drop is a 3-4 player cooperative silent-heist party game. The shared host screen (TV/laptop) is a vault; every player's phone is a private earpiece feeding them one fragment of the combination. The catch: your phone will only whisper your next fragment while the *entire room* is measurably silent — so talking doesn't just break the mood, it literally jams everyone's clues.

## Problem
Almost every party game rewards the loudest, fastest mouth. Silence is dead time. Pin Drop inverts that: silence is the medium the game is played in, and the mic is the referee that enforces it. The itch is the delicious tension of a room straining to stay quiet while four people privately race a timer.

## How it works
The host TV shows a vault with one progress bar per player and a countdown. Each phone privately holds a secret 3-symbol sequence (drawn from a 4-key pad: ◆ ● ▲ ■). A symbol is delivered as a faint spoken cue through the phone's earpiece speaker — quiet enough that only the owner, holding the phone to their ear, can hear it. Crucially, the phone will only *play* the next symbol after the server confirms the aggregate room noise floor (every phone's live mic RMS) has stayed below a calibrated threshold for 2 continuous seconds. Any vocalization spikes the mics, the whole room's playback freezes, and the current symbol resets. Players tap what they heard on their private pad. Team wins when all phones complete their sequence before the timer.

Private per phone: your unique sequence, your earpiece audio, your pad. Shared on TV: progress bars, the countdown, and a room-wide 'noise floor' meter that flares red the instant anyone talks.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room { noiseFloor, phase, timer }`, `Player { seq[3], progress, micRMS }`. Each phone streams a smoothed WebAudio RMS envelope at ~15Hz; the server fuses them into an authoritative noise floor and only emits `PLAY_SYMBOL` when the fused value holds below threshold. The genuinely hard part: (1) clock/latency alignment so a shout detected across four phones freezes playback near-simultaneously, and (2) gating each phone's own earpiece playback out of its own mic (echo cancellation + duck-during-playback) so clues don't self-jam. A per-room 5-second calibration captures ambient baseline.

## v1 scope
- 3 players, one vault, one round
- 3-symbol sequences from a 4-key pad
- 90-second timer, fixed threshold after calibration
- Host shows progress bars + noise meter

## Out of scope
- More vault types, difficulty tiers, scoring across rounds
- Reconnection, spectators, mobile Safari audio edge-cases beyond one tested device

## Risks & unknowns
- Earpiece playback may be too quiet in a loud room / too loud to stay private
- Mic fusion false-positives from HVAC or laughter
- Echo cancellation quality varies wildly across phones

## Done means
Three phones in one room each complete a 3-symbol sequence they could only hear during enforced quiet, any real vocalization visibly freezes all playback within ~300ms, and the vault opens before the timer at least once in playtest.

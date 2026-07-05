## Overview
Hearsay is a real-time cooperative voice game for 3-5 players in one room — a shared host screen plus a phone each. Everyone is simultaneously a *prompter* (reading a word only they can see) and a *speaker* (whose own phone's mic must hear them say a word they can't see). The room becomes a wall of overlapping shouting and the team races to complete a relay before the timer runs out.

## Problem
Telephone / Chinese-whispers is turn-based and glacial — one whisper at a time while everyone waits. And voice party games almost never use the phone mic as a real verifier. The itch: recreate the delicious chaos of a whole room talking at once, but make it a coordination *puzzle* where the challenge is picking your one prompter's voice out of the din and getting your phone to actually hear you.

## How it works
Players sit in a ring. Seat N's phone privately displays the target word that seat N+1 must speak — so you are your clockwise neighbor's prompter. Your own phone shows only a "listening" indicator and the last thing it thinks it heard — never your own target. So: you read your screen's word aloud → your neighbor hears it and repeats it → their phone's speech-to-text confirms a match → the chain advances one link and everyone is handed a fresh word. Because all players prompt and speak at the same time, the room fills with crosstalk; your mic also catches neighbors, so you must lean in, isolate your prompter, and enunciate.

Private per-phone: each phone shows a *different* secret word and verifies a *different* speaker — passing one phone around is impossible. Shared host screen: a chain of dots filling green as links confirm, a garble meter that spikes when mismatches pile up, and the countdown.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room {seats[], chainIndex, deadline}; Seat {playerId, promptWord, targetWord, lastHeard}. Speech uses the on-device Web Speech API (webkitSpeechRecognition) running on each phone; matches are computed client-side (normalized token + small edit-distance tolerance) and only the boolean "link N confirmed" is sent to the server, which advances the shared chain and broadcasts the next words. Sync strategy: server is source of truth for chainIndex; phones are dumb terminals rendering their assigned word and reporting confirmations. The genuinely hard part: reliable speech recognition in a loud, multi-speaker room — mitigated by short high-frequency target words, per-phone confidence thresholds, and a hold-to-talk gate so a phone only listens when its owner keys up, cutting neighbor bleed.

## v1 scope
- 3 players, one ring, one relay of 5 words, 90-second timer.
- Fixed list of ~40 short common words.
- Hold-to-talk button; on-device Web Speech only.
- Host shows chain dots + timer; win if all 5 links confirm.

## Out of scope
- Scoring, multiple rounds, difficulty tiers.
- Server-side ASR or audio streaming.
- Reconnect handling, spectators, >5 players.

## Risks & unknowns
- Web Speech API is Chrome/Android-strong but iOS Safari weak — may need a tap-to-confirm fallback.
- Recognition accuracy under crosstalk *is* the game; if hold-to-talk doesn't isolate voices, it flops.
- Continuous-recognition latency may feel laggy and kill the pace.

## Done means
Three phones in one room complete a 5-link relay by voice alone, each phone verifying its own speaker via mic, with the host chain filling to green before 90s — and it's genuinely fun on the first loud try.

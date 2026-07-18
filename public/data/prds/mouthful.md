## Overview
Mouthful is a 4-6 player silent-articulation relay. Players are paired sender/receiver; senders must transmit a private phrase using only exaggerated silent mouthing, receivers must lip-read it — and the sender's own phone acoustically enforces that not a whisper escapes. It's charades stripped down to the lips, with the mic as the referee.

## Problem
Mouthing/lip-read party games collapse the moment someone leaks a whisper 'to help' — there's no enforcement, so people cheat toward sound. And with one shared screen you can only run one phrase at a time. Mouthful makes every pair run a DIFFERENT phrase SIMULTANEOUSLY, with private audio masking the receiver and the mic policing the sender, so silence is a hard, per-phone constraint rather than an honor system.

## How it works
Pairs are assigned server-side. Each SENDER's phone PRIVATELY shows a short 3-5 word phrase and a live 'silence meter' — its mic listens (WebAudio RMS + voicing gate) and if any voiced/whispered sound crosses threshold, the meter spikes red and that transmission is VOIDED. Each RECEIVER's phone PRIVATELY plays steady masking pink-noise into earbuds (so they genuinely can't hear the room, only watch lips) and shows a text box to type their guess. Every pair mouths at once, so the room is full of overlapping silent faces — the private per-phone phrase + private earbud masking is what makes simultaneous crosstalk possible. The shared host TV shows only a scoreboard of which pairs have 'connected' (guess matches, fuzzy-normalized) and a red flash when a sender leaks sound. Fastest clean connection wins.

## Technical approach
Host tab + phone PWAs + WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Pair{senderId, receiverId, phrase, guess, voided, connected}. Sender phones run continuous on-device voicing detection (RMS + zero-crossing/pitch gate calibrated to a 3s ambient floor) and stream a boolean 'leaking' flag; receiver phones loop a local pink-noise buffer via WebAudio and submit a normalized guess string (lowercased, punctuation-stripped, Levenshtein ≤2). Server matches, scores, broadcasts scoreboard. Hard part: a voicing gate that catches a real whisper but ignores room ambience and other players' noise bleeding into the sender's mic — mitigated by per-phone calibration and requiring sustained voicing energy, not a single transient.

## v1 scope
- 4 players = 2 pairs, one round, one phrase each.
- Sender mic leak detection with 3s calibration; receiver earbud pink-noise loop.
- Guess box with fuzzy match; host scoreboard of connected/voided.

## Out of scope
- Rotating roles, multi-round, phrase difficulty tiers.
- Camera-based lip verification.
- Reconnect / dropout handling.

## Risks & unknowns
- Whisper detection may false-trigger on ambient noise or under-trigger on very quiet whispers.
- Lip-reading difficulty variance — some phrases near-impossible; needs a curated easy list.
- Receivers may pull an earbud to cheat-listen; masking must be loud enough to matter.

## Done means
Two pairs each get a distinct private phrase, senders mouth while receivers watch under earbud masking; a real whisper from a sender voids that transmission within ~300ms, a correct fuzzy-matched guess marks the pair connected, and the host TV shows connected/voided status and the winning pair.

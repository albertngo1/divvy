## Overview
Cellmate is a cooperative Jackbox-shaped game for 3–6 players (works in pairs). One host screen is the shared cell-block wall; each phone is a private cell. Players transmit words using the classic prisoner tap code — knocks on a table or phone body picked up by the mic — under a strict rule: any spoken word blows the transmission.

## Problem
Every 'don't say a word' game just penalizes talking. None make silence a *communication medium* — a real, learnable channel. The fiction (prisoners forbidden to speak, tapping through a wall) makes reward-silence/punish-talking the literal premise instead of an arbitrary rule.

## How it works
The host screen shows the shared 5×5 Polybius square (A–Z, C/K merged): row-taps then column-taps encode each letter. Everyone can see the grid; it's public.

The SENDER's phone PRIVATELY shows a secret word only they can see, plus a live meter of the taps their own mic has registered so far. They tap it out on the table — the phone's mic detects sharp knock impulses (transient onsets) and forwards `tap` events to the server. The RECEIVER's phone is a PRIVATE decode pad: a grid they fill in letter by letter and submit a guess — they never see the secret word. The host wall shows only anonymized progress: dots for taps received, a bar for letters locked, and a big flashing SIREN if anyone speaks.

The voice cop: every phone independently runs voiced-speech detection on its OWN owner. A single vocalization (a frustrated "no, up!") triggers a violation that penalizes the team and garbles the current letter — forcing genuine silence, gestures, and taps only.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Round {word, senderId, receiverId, taps[], letters[], violations}`, per-phone role state. WebAudio per phone: a fast onset detector (high-passed energy flux with a refractory window) classifies knocks vs. a periodicity/RMS check that classifies voicing. Taps stream as timestamped events; the server groups pauses into row/col digits into letters. Sync is event-based and forgiving. The genuinely hard part is discriminating a knock impulse from a spoken plosive on the same mic — solved by combining spectral flatness (knocks are broadband/short, voice is harmonic/sustained) with a minimum inter-tap gap, plus a per-phone calibration where the sender taps three times before the round.

## v1 scope
- One sender + one receiver (2 active, others watch), one 3-letter word, one round
- Host shows the tap grid + taps-received dots + voice siren
- Sender phone: secret word + tap counter; receiver phone: decode pad + submit
- Own-owner voicing triggers a visible violation

## Out of scope
- Chained relays across >2 players, scoring ladders, multiple words
- Accelerometer taps (mic only for v1), custom cipher grids
- Auto-decoding the receiver's grid (they read the code themselves)

## Risks & unknowns
- Tap detection reliability across table surfaces and phone cases
- Plosive speech ('P','B') false-triggering as taps
- Whether decoding tap code is too slow/frustrating for a party (may need a slower grid or hint)

## Done means
A sender taps a 3-letter word on the table, the receiver's private pad fills in the correct letters from those taps, the host wall reflects progress without ever showing the word, and one spoken word from either player fires the siren and garbles the in-progress letter.

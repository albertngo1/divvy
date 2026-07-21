## Overview
Earshot is a 4-6 player concurrent-room game where the whole table's phones become a collective eavesdropping microphone array. You must silently — near-silently — deliver a private passphrase to one assigned recipient, whispering so quietly that only *their* phone crosses the "heard" line. Everyone else's phone is listening for you to slip.

## Problem
Whisper games run on the honor system or a single shared mic. The theme wants the mic to *enforce* silence. Prior silence games make your own phone police only you. Nobody has made the *other players' phones* the enforcement mechanism — the punishment for talking too loud is that someone across the table overhears you.

## How it works
The host TV shows the roster and a live amplitude gallery — one bar per phone. Each phone PRIVATELY shows: a two-word passphrase ("amber lantern") and one assigned recipient. On "go," you lean toward your recipient and whisper the passphrase as quietly as possible. All phones continuously stream RMS envelopes to the server. During your whisper window the server ranks concurrent phone amplitudes: your recipient's phone, held inches away, should dominate via inverse-square falloff. If ANY non-recipient phone also crosses the heard threshold, you're OVERHEARD — a public red flash on the TV, and that eavesdropper scores an interception. If only the recipient heard you, they privately tap the word they caught from four choices; correct + not-overheard = a delivery point.
Private per phone: your passphrase, your target, your delivered/overheard verdict, and (as a recipient) the guess entry. Shared TV: amplitude gallery, overheard busts, running score.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{players[], round, thresholds, ambientFloor}, Player{id, passphrase, targetId, micGain, rmsFrames}. Phones run a WebAudio AnalyserNode producing ~20Hz RMS frames, each stamped with a server clock offset (NTP-style handshake at join). Server buffers ~2s windows around each whisper, does onset detection, and ranks which phones crossed threshold. The genuinely hard part is source attribution when whispers overlap and gains vary — v1 sidesteps it by staggering the go-signal so only one whisperer is "live" at a time. A 5s calibration round per phone sets gain and ambient floor.

## v1 scope
- 4 players, one round
- Fixed two-word passphrases from a small list
- Staggered turns: one live whisperer at a time (no true simultaneity)
- Recipient guess = tap-from-4, not free text
- Single overheard threshold from a 5s calibration

## Out of scope
- Simultaneous whispering, free-text guesses, directional beamforming, cross-device mic normalization beyond simple gain, more than 6 players.

## Risks & unknowns
- Whether inverse-square separation actually resolves at real table distances (needs a physical test).
- Mic gain variance across phones; AirPods/Bluetooth routing latency.
- Ambient HVAC, laughter, and chairs causing false overheards.

## Done means
With 4 phones and staggered turns, a quiet on-target whisper scores a delivery with zero non-target phones crossing threshold, while a normal-volume whisper reliably trips at least one non-target phone into OVERHEARD on the TV within 500ms.

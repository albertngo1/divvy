## Overview
A 3-player cooperative shouting-and-scurrying game for a living room with a TV and three phones. Messages must be *delivered*, not broadcast: your voice has an address, and the address is a physical phone in someone else's hand.

## Problem
Spaceteam's shouting is undirected — you bellow into the room and hope. Nobody has to aim, and nobody leaves the couch. The itch: make the voice channel have a *destination* enforced by physics, so "who heard that" becomes the whole game.

## How it works
Each phone is a colored MAILBOX. Privately, your phone shows your OUTBOX: two absurd phrases, each stamped with a target color — `To BLUE: "the ferrets are aboard"`. It also shows your INBOX count, but never the content of what's waiting for you. There is no send button that types, taps, or beams.

To deliver, you hold SEND on your own phone and say the phrase aloud. Your own phone (inches from your mouth) does the transcription. Every *other* phone in the room is simultaneously metering loudness, and the server ranks them: the loudest non-speaker phone is where the parcel lands. So you get up, cross the room, put your face near the blue phone — which Blue is currently carrying toward Yellow — and speak.

Shout it from the couch and it misdelivers: the wrong player's phone lights up `MISDELIVERED: "the ferrets are aboard"` and they must now hand-carry it, spending their own time. Two people speaking at the same target within the same window both bounce with a static burst.

The host TV shows only the ledger — delivered / misdelivered / bounced — and the countdown. It never shows message text or who holds what. All content lives on phones.

## Technical approach
PartyKit Durable Object per room. Model: `Room {players[], messages[], deadline}`, `Message {id, text, targetColor, state: pending|inflight|delivered|misdelivered|bounced}`.

Every phone runs `getUserMedia` with `autoGainControl:false, noiseSuppression:false, echoCancellation:false` and streams a 20 Hz RMS envelope (~20 floats/sec — trivial bandwidth). SEND-press triggers Web Speech API on the speaker's device for the text. On release the server takes window `[t0,t1]`, normalizes each phone's RMS by a per-device calibration constant captured at join ("say the ship's name"), and ranks. Delivery requires the winner to beat the runner-up by a fixed margin (~4 dB); otherwise it bounces as ambiguous.

The genuinely hard part is cross-device loudness comparison. Mobile AGC actively fights you and constraint support varies; a phone in a pocket reads 20 dB below one on a table; client clocks drift. Mitigations: relative margins never absolute thresholds, RTT/2 server-stamped alignment with a 300 ms tolerance window, and recalibration between messages.

## v1 scope
- 3 players, 3 fixed colors, one 90-second round
- 6 messages drawn from a hardcoded list of 20 phrases
- Loudness ranking with one fixed margin constant; no per-round retuning
- Misdelivery penalty = a 5-second lockout, nothing fancier
- Host screen = ledger + timer. 4-letter room code. No accounts.

## Out of scope
Scoring, multiple rounds, WebRTC audio transport, iOS ASR fallbacks, spectator view, sound design, player-count flexibility.

## Risks & unknowns
AGC may make ranking mush. A loud room raises the floor for every phone equally — margin logic should survive that, but untested. Exploit: hand your phone to the target and whisper into both; mitigate by requiring the *speaker's* phone to also register above a loudness floor. Physical risk of people sprinting at each other.

## Done means
Three phones and a laptop in one room. A player reads a message off their phone, walks to the named teammate, speaks, and within 500 ms the correct phone shows RECEIVED while the other shows nothing. The same phrase yelled from across the room produces MISDELIVERED or BOUNCED in at least 4 of 5 attempts. One 6-message round runs start to finish.

## Overview
Read Back is a 3–4 player cooperative voice game modeled on aviation clearance readback. One player is TOWER; the others are PILOTS, each responsible for exactly one aircraft. The fun is the discipline of radio comms — reading numbers in phonetic protocol, transcribing them under noise, and confirming with a readback — collapsing into cheerful chaos when everyone talks at once. For friends who liked Spaceteam but want a slower, more verbal, more satisfying loop.

## Problem
Most 'shout commands' party games reward volume and speed. Almost none reward *careful listening* — the pleasure of hearing a garbled '270' and asking 'say again?'. Read Back turns transcription-under-noise into the whole game, and makes each phone a genuinely private cockpit so no one can just peek.

## How it works
The host TV shows a runway/airspace board with one aircraft strip per pilot, each lit red until configured. Every round, Tower's phone PRIVATELY displays a full clearance stack — e.g. 'SKYHAWK: climb five thousand, heading two-seven-zero, squawk four-four-one-two; FALCON: descend three thousand, heading zero-nine-zero, squawk seven-one-zero-zero'. Tower must read these aloud; the game *forces* verbal transfer because pilots' phones show only a blank instrument panel (altitude, heading, squawk dials) with their own callsign at the top.

Each PILOT phone PRIVATELY shows: its callsign, three empty dials, and a 'READ BACK' button. Pilots listen for their callsign, set dials to what they heard, then tap READ BACK to speak their values so Tower can verify. Tower's phone shows a live grid of every pilot's current dial values (read-only — Tower can *see* errors but cannot fix them, only re-transmit). A round ends when all strips are green. Mishearing 'two-seven-zero' as 'two-seventy' sets the wrong heading; overlapping pilots reading back at once garbles the room. Later rounds add amended clearances ('SKYHAWK correction, heading two-eight-zero').

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ clearances[], planes: {callsign, target:{alt,hdg,sqk}, current:{...}, locked} }`. Only Tower receives the `target` values; pilots receive an empty panel bound to their callsign; host receives `current` for all planes. Sync is simple state replication — dial changes are low-frequency taps, not continuous streams, so no tight-latency arbitration is needed (this is a listening game, not a reflex game). The genuinely hard part is *content generation*: clearance stacks must be phonetically confusable-but-solvable (numbers that sound alike, headings near each other) and each pilot's parameters must be extractable from Tower's single spoken pass. No ASR — readback verification is human (Tower eyeballs the grid and re-transmits).

## v1 scope
- 1 Tower + 2 Pilots, one round, two aircraft
- Three dials each: altitude, heading, squawk
- Hand-authored deck of ~10 clearance stacks
- Host board with red/green strips; no scoring beyond time-to-green

## Out of scope
- ASR / automatic readback checking
- Amended clearances, emergencies, weather
- More than one Tower, rotating roles, seasons

## Risks & unknowns
- Is transcription fun or tedious? Needs the phonetic-confusion tuning to land in the sweet spot.
- Tower may feel like a read-aloud narrator; giving Tower the error-grid keeps them engaged.
- Room noise could make it impossible rather than hard — needs a difficulty dial (fewer digits).

## Done means
3 players in a room configure two aircraft to all-green from a single Tower spoken pass within 90s, where at least one dial required a 'say again', and no pilot could complete their panel without hearing Tower speak.

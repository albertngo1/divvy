## Overview
Say Again is a cooperative, voice-frantic party game for 3-4 players in the Spaceteam lineage, built on aviation radio read-back. There is no defuser/manual split — every player is simultaneously a controller issuing clearances to others and a pilot receiving clearances meant for them. The shared host screen is the tower's radar; each phone is a private cockpit + issue-pad.

## Problem
Spaceteam's joy is "this command isn't mine — whose is it?" But once you've played it, the commands feel arbitrary. Real aviation radio already has a gorgeous built-in coordination ritual: address-by-callsign, then verbatim read-back. Nobody has turned that specific loop — listen for YOUR callsign in the chatter, dial it, read it back — into a party game.

## How it works
Host screen (shared): a radar sweep with 3-4 aircraft blips inching toward the edge, a frequency-congestion meter that spikes red when two people talk at once, and a strip count (e.g. "clear 8 clearances in 90s").

Each phone shows PRIVATELY:
- **Your callsign** (e.g. "NOVEMBER SEVEN-TWO") — no one else sees it.
- **Your issue-pad**: 1-2 clearances you must transmit, each stamped with a DIFFERENT player's callsign as the target (e.g. "Delta Four-One, climb and maintain FLIGHT LEVEL TWO-THREE-ZERO"). You don't know whose callsign that is — you just say it loudly.
- **Your cockpit**: heading/altitude/squawk dials you set when a clearance addressed to YOUR callsign is transmitted at you.

Flow: everyone reads their issue-pad aloud at once. Chaos. A pilot who hears their callsign dials the value and reads it back ("November Seven-Two, level two-three-zero"). The instant the dialed value matches the issued value, the server clears that strip — the issuer's item goes green and a fresh clearance appears. Mis-dials do nothing; you keep talking. The host TV's congestion meter punishes overlapping shouts by muddying the round (a mis-hear timer), so players self-organize into read-back cadence.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room{strips[], congestion}`, `Player{callsign, issuePad[], cockpit{heading,alt,squawk}}`. Each clearance = `{targetCallsign, field, value}`. Match logic is trivial server-side (dialed cockpit value == open clearance value for that player's callsign) — no client authority. "Voice" is not transcribed; the mic is used only for the congestion meter via per-phone RMS gating (each phone reports whether its own owner is speaking; server counts concurrent speakers). The genuinely hard part is tuning the congestion penalty so overlap feels bad but not oppressive, normalized across phone mic sensitivities via a 3-second calibration hum at lobby.

## v1 scope
- 3 players, one 75-second round, one shared strip goal (6 clearances).
- Three fields only: heading, altitude, squawk.
- Callsigns from a fixed pool of 8.
- Congestion meter = simple concurrent-speaker count, no penalty tuning beyond a visible "muddy" flash.

## Out of scope
- Speech-to-text / actual read-back verification (dial-match stands in).
- Role rotation, scoring ladder, multiple rounds, spectators.
- Emergencies, weather, holding patterns.

## Risks & unknowns
- Does callsign-listening survive 3 people shouting? May need callsigns on the host screen as a fallback crutch.
- Mic RMS gating across cheap/loud phones is finicky; calibration must be near-zero-friction.
- Read-back may feel optional if dial-match already clears strips — need to make the aloud step the ONLY way a pilot learns the value.

## Done means
3 phones + a laptop: each player sees only their callsign/issue-pad/cockpit; a clearance addressed to a callsign can be cleared only after that owner hears it aloud and dials the value; concurrent talkers spike the host congestion meter; the round ends win/lose on the 6-strip goal within 75s.

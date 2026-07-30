## Overview

**Open Book** is a 4-player simultaneous stealth-reading race for one room. Every phone holds a different private 6-character code that reveals itself only one character at a time, and only while the phone is lying flat and face-up — which is also the only time it emits a near-ultrasonic carrier tone that every other phone is listening for. Acquiring information is physically loud. For groups who liked hide-and-seek but want it to be about *reading*.

## Problem

Party games hand out private info for free — you glance at your phone and nobody can do anything about it. That makes hidden information inert: it's a fact, not a risk. The itch is a game where *looking at your own screen* is the dangerous act, and where the room's geometry decides whether you get away with it.

## How it works

Each phone privately shows: a 6-slot code strip (all blanks at start), a live "page open / page shut" indicator, and a tiny warning bar reading `SOMEONE'S CLOSE`. Nothing else. The host TV shows four public code strips filling in with dots, plus a red **COMPROMISED** badge per player.

To reveal, you lay the phone flat (screen up, within 15° of horizontal) and hold still. Flat = the phone continuously plays its assigned carrier — one of four tones spaced 300 Hz apart between 17.6 and 18.5 kHz. Every ~1.2 s of unbroken flat time reveals your next character, but only if no other phone heard your tone loudly during that window. If someone did, the character is **redacted** on your strip forever and delivered instead to the nearest listener's phone as an unattributed line: `overheard: K in slot 3`. You are never told who took it; they are never told whose it was.

So the loop is: sprint to the far corner, lie the phone on the floor behind the couch, read two characters, notice `SOMEONE'S CLOSE`, snatch it upright (tone stops instantly), relocate. Meanwhile you're also hunting three other readers by walking toward silence you can't hear. Muting your own speaker doesn't help: the server requires each reader's *own* mic to confirm its own carrier, so a silent page never turns.

## Technical approach

Host tab + phone PWAs + one PartyKit Durable Object per room, authoritative on all reveals.

Model: `Room { phase, endsAt, players: { id, color, freqSlot, code[6], revealed[6], redacted[6], stolen[], flatSince, lastHeard{} } }`. Phones stream 10 Hz frames: `{tiltDeg, ownBinDb, otherBinsDb[3]}` from `deviceorientation` plus a 2048-point `AnalyserNode` FFT over `getUserMedia`. The server, not the client, owns the reveal clock — it only advances a character if it has ≥1.2 s of contiguous in-window frames *and* every other player's reported energy in that slot's bin sits below their calibrated near-threshold.

The genuinely hard part is cross-device audio scale: mic AGC, speaker HF rolloff and bin leakage differ per handset, so absolute dB is meaningless. Fix with a 20 s pre-round calibration where each phone chirps alone in sequence while all others record — producing a pairwise gain matrix. "Close" is then defined per-pair as ≥6 dB above that far-field baseline, with a rolling median to fight AGC drift. Secondary hard part: iOS requires a user gesture for both `DeviceOrientationEvent.requestPermission()` and the AudioContext, so both live behind one "I'm in" tap.

## v1 scope

- Exactly 4 players, one 90 s round, 4-letter join code
- One 6-char code per player; reveal, redact, steal, done
- Host TV: four dotted strips + compromised badges + a countdown
- Fixed 4-tone frequency plan, one calibration sweep, no retries
- No scoring screen beyond "who finished, who got robbed"

## Out of scope

- More than 4 players (needs a real frequency/TDMA plan)
- Multiple rounds, persistence, avatars, sound design
- Localizing eavesdroppers on a map (only "nearest" is used)
- Any defense against a player simply memorizing a rival's screen

## Risks & unknowns

Some phones roll off above 18 kHz, collapsing the tone plan — needs a fallback 4–6 kHz faint tick. Carpet and couch cushions muffle both speaker and mic, so "far corner" may be undetectably quiet in the wrong direction. Kids and dogs can hear 18 kHz. Flat-detection may false-negative on a sagging cushion. Small apartments may not have enough separation to ever read safely — tune the near-threshold, not the room.

## Done means

Four phones in one living room. With all players spread out, each reveals all 6 characters inside 60 s and the TV shows four complete codes. When one player walks within ~1 m of a reader, that reader's next character is redacted on their own phone and appears on the eavesdropper's phone within 500 ms with no attribution, and the TV marks the reader COMPROMISED — reproducible 5 times out of 5. A phone with its volume at zero reveals nothing.

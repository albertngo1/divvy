## Overview
Wolf Tone is a concurrent-room party game for 3–5 players where the phones become a distributed speaker array. Each phone emits a continuous tone; each player privately steers their own pitch. The failure mode is collision in pitch space: land too near another player's tone and both produce a "wolf tone" — the audible, teeth-gritting beat of two close frequencies — and both lose the round. You must spread out using only your ears.

## Problem
Harmony games ask everyone to converge. This inverts it: consonance is defeat. The itch is that you can hear *that* someone is near you (the beating) but not *who* or *where* — you can't see anyone's pitch — so you're nudging blind through a crowded spectrum, and the instinct to "settle somewhere nice" is exactly what gets you burned.

## How it works
Each **phone privately** shows a vertical slider and one assigned register band (low / mid / high) drawn as a highlighted zone — only that player sees their target band and their own value. Sliding the phone's oscillator up or down changes the tone that phone plays aloud, continuously, from its own speaker.

The **host TV** shows an anonymized pitch ladder: faint markers for where tones sit (no names, no exact values) and a big room-wide "dissonance" meter plus a live count of active wolf tones. The server continuously checks every pair of pitches; if two fall within a collision threshold (say 12 Hz), both are flagged as a wolf tone, both phones vibrate and dim, and both score zero for as long as they overlap. Your score is the number of seconds your tone stays clean AND inside your assigned band across a single 60-second round. Highest clean-time wins.

Because the only signal about *others* is the actual sound in the room, passing one phone around is meaningless — the game only exists when every phone is sounding at once.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve).

Data model: `room { phase, roundEndsAt, players: { id, band, pitchHz, cleanMs, inWolf } }`. Phones stream throttled `setPitch{hz}` updates (~20/s); the server is the single source of truth. Each server tick it computes all pairwise `|Δhz|`, marks colliding players `inWolf`, checks band membership, accrues `cleanMs` for players who are both in-band and collision-free, and broadcasts the anonymized ladder + wolf count.

Audio is pure feedback: each phone runs a WebAudio oscillator at its own pitch, so the *room* physically produces the beating — no microphone, no pitch detection, no cross-device clock sync needed. The genuinely hard part is tuning the collision threshold and band widths so the room is winnable but crowded, and keeping the emitted tones pleasant-ish (soft gain envelopes) so it's tense rather than painful.

## v1 scope
- 3–5 players, three fixed bands, one 60s round.
- Single oscillator per phone, sine wave, gentle gain.
- Server-side pairwise collision at a fixed Hz threshold.
- Score = clean-and-in-band seconds; highest wins.

## Out of scope
- Microphone input or real singing.
- Multiple rounds, chords, or moving target bands.
- Timbre selection, effects, per-player volume balancing.

## Risks & unknowns
- Small-speaker phones may not beat audibly enough; may need to bias bands closer or boost gain.
- 5 simultaneous tones could sound like chaos rather than legible dissonance — band separation must carry it.
- Players muting their phone silences their only feedback and everyone else's cue; needs an on-screen nudge to keep volume up.

## Done means
Three phones join, each is handed a distinct band and plays an audible tone, sliding two of them within the threshold makes the room audibly beat while both those phones buzz and stop scoring, and after 60 seconds the host shows a clean-time ranking — with no phone ever displaying another player's pitch.

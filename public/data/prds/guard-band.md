## Overview

A 45-second tuning duel for 3–6 people around one TV. Each phone is a live tone generator squatting on a shared frequency band. Prime real estate pays, but any two tones that land within three semitones of each other are jammed dead — both score zero. The only instrument you get is the room's actual acoustic mix.

## Problem

Party games about "read the room" resolve silently on a screen: you submit, you wait, a number appears. Nothing about the room is actually in the loop. Meanwhile the true state of every party — everyone making noise at once, nobody hearing anyone — is exactly the failure mode this theme wants. Make the collision audible and the game plays itself.

## How it works

The TV shows the band as a horizontal strip: unlabeled, textured with drifting noise, a countdown, and a lock counter. It never shows anyone's position — not yours, not theirs.

Each phone privately shows three things: a vertical unlabeled slider driving a WebAudio sine playing continuously out of that phone's own speaker; your **legal sub-range**, a slice of the band that differs per player and partially overlaps others; and your **payout gradient**, rendered as a color ramp — some players are paid more toward the top of the band, some toward the bottom. Nobody knows which way anyone else is paid, so "the good spot" isn't a shared idea and can't be assumed.

Because your own phone is loudest to you and everyone else's is faint, you are physically the worst-placed person in the room to hear whether you are crowding someone. Players may talk, but there are no numbers on screen to say — you can only hum, gesture, or lie.

At lock, the server computes pairwise distance in cents. Under 300 cents: both tones are muted on the replay and both score 0. Survivors score their private payout curve at their landing frequency. The TV then plays the broadcast — survivors sound, jammed pairs are replaced with a buzz, and the strip finally reveals who sat on whom.

## Technical approach

PartyKit Durable Object per room. State: `{players: {id, freqCents, locked, rangeLo, rangeHi, payoutCurve}}`. Phones push throttled frequency updates at 10 Hz; audio is synthesized locally on each phone, so the wire carries one integer, never samples. Settlement is a pure server function over the final snapshot — authoritative, no acoustic detection anywhere.

The genuinely hard part is not sync, it's the mix. Phone speakers vary enormously in output; a 300-cent gap must be audible across a room. Mitigations: a 3-second per-device calibration tone at join to normalize loudness, sine plus slight vibrato so beating is perceptible, phones face-up on a table, and a quiet TV-side reference render as a fallback.

## v1 scope

- One round, 4 players, 45 seconds, one octave
- Four fixed payout curves (two up-sloping, two down-sloping)
- Collision threshold hardcoded at 3 semitones
- Score card on TV, then the game ends
- No accounts, no persistence, no rematch button

## Out of scope

Multiple rounds, jamming abilities, mic-based collision detection, >6 players, moving payout curves, any scoreboard across sessions.

## Risks & unknowns

iOS blocks audio without a user gesture (tap-to-arm at join) and the hardware silent switch mutes WebAudio entirely — the biggest real risk, handled with a blunt "flip your ringer switch" gate. A loud room may drown the band. Players may all sprint to the extremes and stalemate.

## Done means

Four phones, one room, one 45-second round: at least one collision fires, both tones are correctly muted in the replay, and in debrief a player says they moved because of what they *heard*, not what they saw.

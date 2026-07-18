## Overview
Catch is a 3–4 player cooperative singing game (host TV + phones) built on the musical 'round' (a canon like Row Row Row Your Boat). The joy of a round is that everyone sings the *same* words *offset in time*; the disaster is when two voices collapse onto the same line. Catch weaponizes that: your job is to stay staggered, and coordination — landing on the same lyric as someone else — is the failure.

## Problem
Singing games reward matching (karaoke, unison). Nobody has built the inverse: a game where drifting into agreement is the loss condition. A round is the perfect vehicle, and it only works if no singer can see where the others are.

## How it works
Each phone runs a PRIVATE karaoke teleprompter of the same looping lyric cycle. Critically, each player is seeded to *start on a different line*, and you advance your own position by tapping a BEAT pad to your internal pulse — you control your tempo. Your phone shows ONLY your current line and the next one; you cannot see anyone else's position.

SHARED host TV: a ring of 4 anonymized voice-dots orbiting a lyric-wheel, an offset-health bar, and a growing round-timer. It does NOT label who is where.

Mechanic: the server tracks every player's current line index in the cyclic song. Ideal spacing is even (e.g., a 4-line song, players a quarter-cycle apart). If any two players occupy the SAME line index for more than ~700ms, the host fires a klaxon and drains the offset-health bar; if two players stay collided too long the round busts. So you must feel when you're drifting toward the singer ahead or behind — slow your taps or push forward — using only your ear on the combined singing in the room and the health bar's warning. Win = sustain a fully staggered 4-part round for 30 seconds without a bust.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve or PartyKit) holds state = each client's current line index + last-tap timestamp. Phones emit BEAT taps; server advances that client's index and computes pairwise line-collisions each tick (~10Hz), emitting only a global health value + collision klaxon trigger (never who collided). Host renders anonymized dots from indices. Hard part: v1 uses tap-driven position (no pitch/speech recognition) so 'singing' is honor-system audio in the room while the *game* tracks tapped line position — keeping the tapped position honest-feeling against actual singing is the design risk. Clock offset per client via ping/pong so tap timestamps are comparable.

## v1 scope
- One hard-coded 4-line round, 4 players seeded a quarter-cycle apart.
- Tap-to-advance teleprompter; ear + health-bar as the only feedback.
- One 30-second round, binary win/bust.

## Out of scope
- Real pitch/lyric ASR, song library, variable player counts, scoring, harmony grading.

## Risks & unknowns
- Tapped position may decouple from actual voice, feeling like a rhythm game with singing pasted on.
- 700ms collision tolerance and even-spacing target need playtest tuning; non-singers may disengage.

## Done means
4 phones each teleprompt an offset line; when two players' tapped positions land on the same lyric the host klaxons and the health bar drops; a staggered run reaches 30 seconds and shows WIN.

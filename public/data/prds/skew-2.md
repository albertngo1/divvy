## Overview
Skew is a 3-6 player hidden-role game where the imposter's private view differs not in *content* but in *time*. Everyone watches an identical silent slapstick / Rube-Goldberg clip on their own phone and privately taps at each 'hit' (a collision, drop, or flash). The imposter's feed is nudged ~600ms ahead, so their taps land consistently early — as if they're psychic or guessing. The room deduces who's out of sync.

## Problem
'Different private view' games almost always swap a *word or picture*. A temporal skew is an unexplored lever: the imposter sees the *same true events*, just shifted, so they can't self-diagnose by comparing facts — and they genuinely believe they're timing it perfectly. It turns a reaction game into a deduction game.

## How it works
Host TV: 'Tap every hit. One of you is running fast.' On a synchronized start each phone plays the ~75s clip locally with ~6 discrete hit moments.

PRIVATE (each phone): the video, a big tap zone, a per-tap confirmation buzz. The imposter's video source is time-advanced ~600ms; everything else is identical. No phone is labeled.

SHARED (TV): after the clip, an anonymized scatter plot — one column per hit, a dot per player's tap offset — so the room can SEE that one dot per hit is consistently early, but not WHOSE. Then players verbally defend their own timings ('I nailed hit 4, I swear'), free discussion, and a private phone vote.

REVEAL (TV): the skewed player is named; group wins by majority catch, imposter wins by surviving.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: Room{code, phase, players[], clipId, imposterId, taps{playerId:[offsetMs]}}. The video ships bundled to every client; the server sends a `start_at` future timestamp and, to the imposter only, a `seekOffsetMs: 600` so their `<video>.currentTime` is advanced — nothing in the payload names the role beyond that field. Taps are timestamped client-side against the shared start and sent up; server aligns them to known hit times and builds the anonymized scatter. Hard part: clock sync across phones tight enough that a 600ms skew is legible above natural human reaction variance (~200-300ms jitter) — needs an NTP-style offset handshake and hits spaced far enough apart to disambiguate.

## v1 scope
- 3 players, one round, one hand-picked clip with 6 clear hits
- Server assigns one imposter, applies fixed 600ms advance
- Anonymized scatter + single vote + binary reveal

## Out of scope
- Variable/randomized skew direction and magnitude
- Multiple rounds, scoring, role rotation
- Player-supplied clips, audio

## Risks & unknowns
- Human reaction jitter may drown a 600ms tell → may need larger skew or more hits; core fun is unproven vs. content-swap games.
- Clock sync fragility on flaky phone wifi.
- If the scatter too obviously fingers the outlier, the social layer collapses to graph-reading — anonymization must hold.

## Done means
Three phones play the same clip synchronized, exactly one runs 600ms ahead unlabeled, the room sees an anonymized timing scatter, argues, votes on-phone, and the TV correctly reveals the skewed player — one ~4-minute round, sync error demonstrably under 150ms.

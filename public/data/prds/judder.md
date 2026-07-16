## Overview
Judder is a 3-5 player hidden-role game played through your phone's vibration motor. Everyone feels a private buzzed rhythm; the imposter's rhythm is subtly altered. Because touch is nearly impossible to describe or replay for others, the group must reconstruct and compare a signal they can't share directly. For party groups who've burned out on talky deduction and want something they FEEL.

## Problem
Every hidden-role tell is verbal or visual, so the smoothest liar wins. The itch: put the secret in a channel you can't fake or articulate — haptics. You felt SOMETHING private; convincing others it matched theirs, when you can't play it back for them, is the entire tension. The imposter may not even know their buzz diverged.

## How it works
Round start: host TV says "Grip your phone, stay quiet." Each phone plays a private haptic pattern via the Vibration API — a short rhythm like buzz-buzz-BUZZ-buzz, where durations encode the beat. Real players get pattern A; the imposter gets pattern A with one beat's length flipped (a long where everyone else feels a short). A "Feel again" button re-triggers up to 3 times. Nobody feels anyone else's phone.
Phase 2 (reproduce): each phone shows one big pad; you tap out the rhythm you felt, and the phone records your inter-tap timings — simultaneously and privately.
Phase 3 (compare): the host TV plays each anonymized reproduction back as audible clicks, one at a time, and draws them as rhythm bars. Players argue over which felt different.
Phase 4 (vote): secret vote on the imposter; host reveals both patterns and the result.
Host screen: prompts, anonymized click-playbacks, rhythm bars, tally. Phones (private): the felt vibration, the tap pad, your vote.
The joy: memory and reproduction are noisy, so everyone's playback is a little off. The imposter can hide inside that noise ("I felt the same, I'm just clumsy") — and may genuinely not know theirs diverged.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object per room). Data model: Room{code, phase, players[], patternA:[ms…], imposterPattern:[ms…], imposterId, taps{playerId:[intervals]}, votes{playerId}}. Server assigns patterns and gates phase transitions on all-submitted. Reproductions are just arrays of millisecond intervals — tiny payloads the host renders and plays via WebAudio. The genuinely hard part: the Vibration API is Android-Chrome only — iOS Safari/PWAs don't support it. v1 targets Android; the fallback is a private low-tone WebAudio buzz held to the ear (leaky, noted). Motor strength also varies per device, so patterns must diverge in TIMING (order of long/short), never intensity.

## v1 scope
- 3-5 Android phones, one round, one imposter
- Two hardcoded 5-beat patterns differing by a single flip
- Tap-reproduction + anonymized click playback + one secret vote

## Out of scope
- iOS haptics, multi-round scoring
- Self-designed rhythms, per-device haptic calibration
- Polished audio fallback

## Risks & unknowns
iOS exclusion could sink a mixed-phone party (mitigate: audio fallback, or declare an "Android table"). If the one-beat divergence is too subtle to feel there's no signal; too gross and it's an instant tell — needs playtest tuning. Reproduction noise could drown the signal entirely.

## Done means
On 3+ Android phones joined by room code, each feels a private pattern (one divergent), all tap a reproduction, the host plays anonymized clicks back and runs a secret vote, and the reveal correctly identifies the imposter and shows both patterns.

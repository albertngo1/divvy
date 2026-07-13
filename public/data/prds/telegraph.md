## Overview
Telegraph is a 3–4 player hidden-role deduction game where the shared secret is delivered entirely through the vibration motor. Each player cups their phone in their palm; every phone plays the *same* short haptic pattern (e.g. long–short–long–short). The imposter's phone plays a pattern with one pulse altered (long–short–**short**–short). Then everyone tries to describe, tap out, and agree on "the rhythm" — and the person who felt a different beat gives themselves away.

## Problem
Most "subtly-different private view" deduction leans on text or images — things that can, in principle, be shown to a neighbor. A haptic pattern is the rare private channel that is *physically impossible to share*: you cannot let someone feel your phone's buzz. That makes the asymmetry airtight and the bluffing genuinely hard.

## How it works
1. Host TV shows a lobby and "Hold your phone flat in one palm. Don't look at the screen."
2. On a synchronized countdown, each phone plays a ~5-pulse haptic pattern (via `navigator.vibrate`). Players may replay twice by pressing and holding a big button.
3. One phone privately plays the altered pattern plus a private banner: *"Your rhythm may differ by one beat. You don't know which. Blend in."* Others' phones stay silent about their role.
4. Host opens a 75-second round where players tap the rhythm out loud on the table and describe it ("it was two long then a gap"). The imposter must reconstruct the group's consensus rhythm and cover the beat they didn't feel.
5. Each phone privately votes for the imposter. Host TV reveals the tally, the imposter, and shows *both* patterns as animated timelines side by side.

Per-phone haptics is strictly load-bearing: there is no host-screen version and nothing to pass around — the buzz lives only in each player's hand.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `Round{patternId, basePattern:int[], alteredIndex, imposterId, votes{}}`, where a pattern is an array of on/off millisecond durations passed straight to `navigator.vibrate([...])`. Sync: server broadcasts `PLAY_AT(t)` and clients schedule the vibrate call against a shared clock so buzzes fire together. The genuinely hard part is **haptic fidelity across devices**: iOS Safari does not support `navigator.vibrate` at all, and Android motors vary wildly in ramp-up, so a "short" on one phone can feel like a "long" on another. v1 must either target Android-only or fall back to a private earbud click-track that mimics the pulses. Patterns must be tuned so one changed pulse is *feelable but not obvious*.

## v1 scope
- 3 players, one round, one hard-coded 5-pulse pattern + one single-pulse alteration.
- Android Chrome only (documented requirement).
- One imposter; single private vote; TV shows both timelines on reveal.

## Out of scope
- iOS haptics / cross-platform parity.
- Multiple rounds, scoring, difficulty ramps.
- Audio fallback channel.
- Player-designed patterns.

## Risks & unknowns
- `navigator.vibrate` support and motor consistency is the make-or-break unknown.
- A one-pulse change may be imperceptible on weak motors, or blatantly obvious on strong ones.
- Players peeking at a visualized pattern would break privacy — screen must stay blank during playback.

## Done means
Three Android phones on one Wi-Fi each buzz a pattern on a shared countdown, one buzzes the altered version, a 75s timer runs, all three cast a private vote, and the TV correctly reveals the imposter with both patterns shown as timelines.

## Overview
Crossed Wire is a 3-6 player audio hidden-role game for a room where everyone has earbuds. The whole group listens to the 'same' short spoken clip, then reconstructs it together — but one player (the Crossed Wire) heard a version with a single noun swapped and doesn't know it. Honest players hunt for the person whose story is subtly off; the imposter tries to blend, then salvage the round by pinpointing their own discrepancy.

## Problem
Hidden-role games almost always diverge through *text* the imposter can see is different (a swapped map label, a doctored dossier). Audio is an untapped, delightfully unreliable channel: a mishear feels like a memory, not a document. Crossed Wire makes the divergence something you *heard*, so the imposter genuinely believes their version — the honest confusion is the comedy.

## How it works
The host TV shows only a 'Now playing — put your earbuds in' card and a 3-2-1 countdown. On zero, every phone privately plays a ~12s TTS clip of a mundane anecdote ('...so Priya left the *casserole* in the taxi and had to call the driver'). Honest players get the identical clip; the single imposter's clip swaps one concrete noun ('*casserole*' → '*ferret*'). Clips play once; there is no scrub bar.

The host then runs an open 'retell it together' phase: players talk aloud, rebuilding the story. The imposter, reasoning from their version, states the wrong detail as fact. Then each PHONE privately collects a one-tap vote for who was 'crossed.' Reveal on TV: if the group fingers the imposter, honest team scores. But the imposter wins outright — regardless of the vote — if, in a final private prompt, they correctly name which word they think was swapped (they pick the noun they'd defend hardest).

What's private (phone): your audio clip, your vote, the imposter's guess. What's shared (TV): the 'playing' state, the discussion timer, the final reveal.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{clipSetId, players[], imposterId, phase}`, `Player{id, role, clipUrl, vote, imposterGuess}`. Clips are pre-generated TTS pairs (base + swapped) stored as static audio; server assigns each player a `clipUrl` at role-assignment. Sync strategy: server broadcasts a `PLAY_AT(serverTs)` tick; each phone schedules `audio.play()` against a one-time clock offset so playback starts within ~150ms across devices. Genuinely hard part: (1) making the swap subtle enough to feel like a mishear but discoverable in retelling — needs playtested word pairs; (2) preventing leakage — clip URLs must be opaque so the imposter can't diff filenames; (3) the mobile autoplay gate — audio only starts after a user tap, so the countdown doubles as the required gesture.

## v1 scope
- 3-5 players, one round, one hand-authored clip pair.
- Earbuds assumed; single play, no replay.
- Open-discussion retell + one private vote + one private imposter guess.
- Plain TV reveal, no scoring history.

## Out of scope
- Multi-round series and scoreboards.
- Procedural clip generation / live TTS.
- Speaker-only (no-earbud) fallback mixing.

## Risks & unknowns
- Earbud dependency limits venues.
- If the swap is too weird ('ferret'), imposter self-detects instantly; too close ('casserole'→'lasagna'), no one notices. Narrow tuning band.
- Cross-device playback drift if clock sync is sloppy.

## Done means
Five phones on one network each play their assigned clip within 150ms of each other; exactly one gets the swapped noun; after discussion the group casts private votes; TV reveals the imposter and whether their private word-guess was correct — end to end, no phone showing another's clip URL or role.

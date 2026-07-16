## Overview
Sing-Along is a 4-6 player real-time hidden-role game built on unison recitation. The shared host screen plays a steady beat and shows a title; every phone scrolls a synced, karaoke-style teleprompter of a short public-domain verse that the whole room chants ALOUD together. Honest phones show the true verse; the imposter's teleprompter has 2-3 words swapped for rhyming/metrical near-misses. The divergence is *heard*, live, in the chorus. For anyone who loves the group energy of karaoke and the paranoia of a party deduction game.

## Problem
Hidden-role audio games that exist lean on timing/rhythm (who's dragging the beat). Nobody exploits *content* divergence surfacing in a live chorus. And unison is a wonderful, underused social mechanic that ONLY works if every mouth is fed a private prompt simultaneously — pass one phone around and the entire game evaporates.

## How it works
Lobby → host counts 3-2-1 → all phones begin scrolling the same 4-line verse in time to a shared beat (the current word bounces/highlights on tempo). The room recites aloud in unison. On line 3, the imposter's phone reads '…the cat sat on the DRUM' while everyone else says '…on the MAT.' Because the swap preserves rhyme and meter, the imposter often commits to the wrong word before noticing — and the room hears one voice veer. After the verse, each phone PRIVATELY votes on who diverged (bonus: name WHICH line). Host reveals.
Private per-phone: your teleprompter text (honest vs. swapped). Shared host screen: the beat, the title, the vote tally, the reveal.

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Durable Object over Tailscale Serve). The make-or-break hard part is sub-100ms synced scroll across phones — otherwise *timing* drift, not content, becomes the tell and honest players look guilty. Solution: a WebAudio-clock epoch handshake. Host broadcasts `{epoch, bpm}`; each phone measures its clock offset via ping/pong RTT and schedules word-highlight transitions against `performance.now()` aligned to the shared epoch. Scroll position is a pure deterministic function of `(epoch, bpm, wordIndex)`, so the server streams no per-frame data — only the verse array, the swap set, and the epoch. Data model: `Room{verse: word[], swaps: {imposterId:[{i,replacement}]}, epoch, bpm, votes}`. Only the imposter's phone receives the mutated word array.

## v1 scope
- 4 players, one imposter, one round
- One hardcoded public-domain nursery rhyme + one curated 3-word swap set
- Text teleprompter + simple click-track metronome
- Manual reveal, majority vote

## Out of scope
- Licensed songs / real audio backing, mic-based auto-detection of divergence, pitch tracking, multiple rounds or imposters, dynamic swap generation, difficulty scaling.

## Risks & unknowns
Cross-device scroll sync is the whole ballgame — measurable drift breaks it. Shy players who won't recite aloud kill the round. Swaps must preserve meter or the imposter stumbles too early (possibly desirable, needs playtest). Loud/echoey rooms may mask the diverging voice.

## Done means
Four phones scroll one verse in visible sync to a single shared beat, the room recites aloud, the imposter's phone displays a 3-word-swapped verse no other phone can see, everyone votes on their own phone, the host reveals the imposter — and in a live test, observers can actually *hear* the divergence.

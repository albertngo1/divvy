## Overview
Earshot is a 3–5 player hidden-role deduction game for a living room with a TV and everyone's phone. Every player listens *privately* through their own earbud to a short spoken sentence. One player — the imposter — hears a version with exactly one word swapped for a near-homophone ("he sold the *boat*" vs "he sold the *vote*"). Nobody hears anyone else's audio. Then the room talks it out, and the discrepancy quietly outs the odd one.

## Problem
Hidden-role games (Werewolf, Chameleon) hand the imposter a *secret goal*. Earshot instead hands them a secret *perception* — they argue in complete good faith about a sentence that, to them, is obviously correct. The itch is the delicious slow realization that two people are describing the same audio and can't both be right.

## How it works
1. Host TV shows a lobby and a round title ("Sentence 1 of 1"). No text of the sentence ever appears publicly.
2. Each phone privately downloads and plays one ~4-second TTS clip through the earbud, on a synchronized countdown. Players can replay up to twice.
3. One randomly-chosen phone privately gets the swapped clip AND a private banner: *"You may be hearing a different sentence. You don't know which word. Blend in."* Everyone else's phone says nothing (so honest players don't know if they're honest).
4. The host runs a 90-second open discussion: each player must state, out loud, one concrete detail from the sentence. The imposter must reconstruct where they diverge from the group and bluff over it.
5. Every phone privately casts one accusation vote. Host TV reveals the vote tally, the imposter, and — the payoff — plays BOTH sentences aloud over the TV speaker back to back.

Private per-phone audio is the whole point: you physically cannot pass one phone around because each player must hold their own contradictory version simultaneously and in isolation.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO behind Tailscale Serve). Data model: `Room{code, players[], roundState}`, `Round{sentenceId, swapWordIndex, imposterId, clipUrls{playerId→url}, votes{}}`. Clips are pre-generated at authoring time (a curated bank of sentence + homophone-swap pairs rendered to short audio via any TTS), so there is no real-time audio streaming — the server just hands each phone a signed blob URL. Sync strategy: server broadcasts a `PLAY_AT(serverTimestamp+2s)` so clips start together; clients schedule playback via `AudioContext.currentTime`. The genuinely hard part is *authoring*: swaps must be phonetically plausible over an earbud yet semantically divergent enough that discussion exposes them — this is content design, not code, and needs playtesting to tune the homophone bank.

## v1 scope
- 3 players, exactly one round, one hard-coded sentence + one swap.
- One imposter, assigned server-side.
- Earbud/headphone assumed (on-screen instruction to plug in).
- Single accusation vote; reveal plays both clips.

## Out of scope
- Score across multiple rounds; win streaks.
- Player-authored sentences.
- On-device TTS or live audio.
- Handling players with no headphones (speaker leakage breaks privacy).

## Risks & unknowns
- Homophones that are too obvious (instant tell) or too subtle (no one notices) — needs a tuned bank.
- iOS autoplay/audio-unlock: needs a user gesture before the synchronized play.
- Players without earbuds leak audio and reveal the swap.

## Done means
Three phones on one Wi-Fi each play their assigned clip on a shared countdown, one gets the swapped word, a 90s timer runs, all three cast a private vote, and the TV correctly reveals the imposter and plays both sentences.

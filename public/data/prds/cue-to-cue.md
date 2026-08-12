## Overview

A 4-player cooperative voice game where the group performs a chain of spoken words that exists nowhere except split across their phones. Each player privately holds one or two links of a linked list — a cue word and the word they must say when they hear it. The chain is traversed by ear, in real time, out loud, with no visible map.

## Problem

Voice party games use the mic as a *buzzer* (shout first) or a *judge* (say it right). Almost none use the room's own speech as the actual data bus. And distributed-state games (each phone holds a fragment) almost always resolve by typing the fragment into a shared screen. The itch: make the room's air the network, where latency, mishearing, and cross-talk are the failure modes.

## How it works

The server builds a chain of 8 links from a 12-word concrete-noun vocabulary (KETTLE, ANVIL, PIGEON, …) and deals them out — two per phone, in scrambled order.

**Private on each phone:** your links, as cards. "Hear KETTLE → say ANVIL." One card in the deal is ordinal: "the **second** time you hear KETTLE → say PIGEON," and the vocabulary is small enough that cue words genuinely recur. So two players flinch at the same sound and only one is correct — that collision is the game.

**Shared host screen:** the seed word to start, a dead-air meter counting up from the last accepted word, and how many links have fired. It never shows the chain. On failure it replays the chain and reveals exactly which link stalled and who was holding it.

Every phone runs continuous recognition over the 12-word vocabulary and reports what it heard. The server treats the room as a distributed microphone array: a word is *accepted* when two or more phones transcribe it within a 600 ms window. That quorum both fights false positives and means someone mumbling into their own phone doesn't advance the chain — you have to be audible to the room.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object (or Socket.IO over Tailscale Serve).

State: `chain[{index, cue, cueOrdinal, say, holderId, fired}]`, `heard[{playerId, word, clientTs, serverTs, confidence}]`, `cursor`, `lastAcceptTs`.

Phones use the Web Speech API with `grammars`/keyword biasing toward the 12 nouns, and emit `{word, confidence, clientTs}` on every hypothesis. The server clock-skews each client with a ping-based offset, buckets reports into 600 ms windows, and advances the cursor on quorum.

The genuinely hard part is temporal fusion. Phones disagree, transcribe late, and hear each other's *speakers* as well as the humans. Mitigations: normalize timestamps server-side, suppress any report from the phone that just spoke a word within 400 ms of speaking it, and require the accepted word to match either the expected next cue or a known vocabulary word (unexpected words are logged, not accepted). iOS Safari lacks continuous recognition — v1 is Chrome/Android only, with streaming-audio-to-whisper.cpp as the noted fallback path.

## v1 scope

- 4 players, one chain of 8 links, exactly one round
- 12 hardcoded nouns, one ordinal card, seed word shown on host
- 3 s dead-air = run over, then reveal the chain
- Chrome on Android only; a tap-to-fire accessibility fallback per card

## Out of scope

Branching chains, scoring, multiple rounds, iOS, noise cancellation, custom vocabularies, reconnects.

## Risks & unknowns

Recognition in a loud room may be too flaky to feel fair — the quorum rule is the bet, and it may need to drop to one confident phone. Eight links across four players may resolve in 15 seconds, which is too short to be a game; the ordinal-cue collision may be the only thing supplying real difficulty.

## Done means

Four Android phones and a host screen complete one 8-link chain entirely by speech, with zero taps; a deliberately muffed cue produces a dead-air failure; and the host replay correctly names the link and holder where it stalled.

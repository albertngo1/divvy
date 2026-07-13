## Overview
A 3–5 player simultaneous audio party game for one TV and one phone each. Every player must convey a secret word to the room using ANY sound *except* real words — hum it, beatbox it, sing la-la-la, whistle it — while their own phone polices them for accidental speech. The twist: everyone performs at once, and each phone privately tells you which single partner in the din you're supposed to decode. It's charades-with-your-mouth-shut-but-not-really, for people who found Quiplash too quiet.

## Problem
Wordless communication games (Pictionary, charades) go one-at-a-time and die of downtime. And 'no talking' is unenforceable by honor system — someone always mutters the answer. Make the phone the referee and you can let the whole room erupt at once, because each device catches its own owner the instant a real word leaks out.

## How it works
Each phone privately shows: (1) YOUR word to transmit ("volcano"), and (2) the name of ONE other player you must decode ("listen for Dana"). On the host's countdown, ALL players hum/vocalize their word simultaneously for a 25s window — a deliberate cacophony, but you only have to lock onto your one assigned partner across the table. Your phone runs live speech-to-text the whole time: if it transcribes any dictionary word (especially your target), you're **busted** — the word flashes on the TV, you lose the point and are outed. After the window, each phone privately shows a text box: type your guess for your assigned partner's word. Host TV reveals the chain of who-decoded-whom and who got caught speaking. Score = correct decode + survived-without-a-word.

## Technical approach
Host tab + phone PWAs + WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `player {word, targetId, guess, busted}`, `room {phase, roundTimer}`. Each phone runs the Web Speech API on-device; only a `busted:{word}` event is sent upward — audio never leaves the phone. The hard part isn't sync (the shared clock just gates the 25s window); it's *false positives*: SpeechRecognition may hallucinate words from humming, or miss a clearly-spoken one. v1 tunes a confidence threshold and only flags high-confidence full-word transcripts. Assigning a directed decode-graph (each player targets exactly one other, ideally a cycle) keeps the task focused despite the noise.

## v1 scope
- 3 players in a directed cycle (A→B→C→A), ONE round.
- 20 hand-picked hummable nouns.
- 25s simultaneous window + private guess entry + reveal.

## Out of scope
- Scoring across rounds, matchmaking, categories.
- Decoding more than one partner.
- Audio recording/playback of the cacophony.

## Risks & unknowns
- Can you actually pick one hummed word out of 3 simultaneous ones? May need players spaced around the room. Core fun is unproven — playtest early.
- SpeechRecognition reliability on humming (false busts) could feel unfair.
- iOS Safari mic/speech permissions friction.

## Done means
Three phones lobby in, each gets a private word + private target. All hum at once for 25s; deliberately speaking your word flashes it on the TV within ~2s and marks you busted; staying wordless lets you submit a private guess, and the reveal screen correctly shows the decode-cycle results and who got caught.

## Overview

A three-minute commons tragedy played with your mouth. A public forest of 60 common words stands on the host screen. Each phone privately holds a small hand of target words worth points — but the *only* way to bank one is to say it out loud, and everything your phone transcribes, target or filler, is struck from the forest permanently for everyone. Meanwhile the room's total score is multiplied by the fraction of the round nobody spoke. For groups who enjoy watching each other be strategically, visibly stingy.

## Problem

Word games reward fluency; the loudest, quickest talker wins and quiet players get bulldozed. The itch is a word game where verbosity is *self-harming* — where saying a sentence when a single word would do is the identifiable, punished mistake, and where the shared resource being burned is language itself.

## How it works

Four players, one 3-minute round. The TV shows the 60-word forest, each word with a point value. Every phone privately shows: a hand of three target words (each word is secretly in **two** players' hands, so it's a race), and one private **snare word** — if anyone else says your snare, you take points off them.

Say a target word and your phone's on-device recognizer banks it for you. But every content word in that utterance gets struck through on the TV, dead for the rest of the round — including the other holder's copy of your target, and including any snare it happens to trip. A rambling sentence can incinerate four people's hands at once.

Running under all of it: a silence bar. Final score = your banked points × (silent buckets ÷ total buckets), room-wide. So the optimal play is a single bare word and then nothing, and the losing play is negotiating a truce out loud. Players spend most of the round staring at each other, deciding whether the word they're both obviously holding is worth breaking first.

The host screen shows only the shrinking forest, strikeouts appearing live, and the silence bar. Hands and snares are never displayed until the reveal.

## Technical approach

Host tab + phone PWAs + Socket.IO over Tailscale Serve (or a PartyKit room). Each phone runs `webkitSpeechRecognition` continuously, streaming interim and final tokens, alongside a WebAudio RMS meter at 20 Hz.

Data model: `Room{forest[{word, value, felledBy}], silentBuckets, elapsed}`, `Player{id, hand[3], snare, banked[], calib}`. Server-authoritative felling, first-onset-wins.

Two genuinely hard parts. First, **every phone hears everyone**, so the same utterance arrives four times — dedup by loudest-device attribution over the surrounding 500 ms of RMS. Second, ASR finals lag 0.5–2 s and lag *differently* per device, so resolving a contested word by arrival time is unfair; the server must align the returned text back to the RMS voicing **onset** timestamp on the attributed device and adjudicate races on that. Normalization is deliberately dumb: lowercase, strip trailing s/es, ignore a 40-item stopword list.

## v1 scope

- 4 players, one 3-minute round, 60-word hardcoded forest
- Hands of 3, each word in exactly 2 hands; one snare each
- TV: forest with live strikeouts, silence bar, final scoreboard with reveal
- Chrome/Android phones only; a "mic died" banner is the entire error handling

## Out of scope

Multi-round play, lemmatizers or phrase detection, iOS Safari recognition, custom word lists, any audio persistence, accessibility text-input fallback.

## Risks & unknowns

Web Speech quality varies by accent and could make the game structurally unfair — the biggest open question, and a real one. Recognition on Chrome routes audio to Google's servers; that must be stated on the join screen, not buried. Homophones cause disputed fellings. Whispering may bank a word without registering as noise, which is either an exploit or the best emergent strategy in the game.

## Done means

Four phones, one live round, at least 30 words felled by the buzzer; in 10 staged head-to-head races on the same word, the earlier speaker wins at least 9; the silence multiplier tracks a stopwatch within 10%; and at least one playtest ends with players refusing to speak for 20 straight seconds over a single contested word.

## Overview

Slip of the Tongue is a 90-second co-op job for 3 players driving a single robot arm on the TV entirely by voice. Everyone can read the job. The problem is that certain words come out wrong from certain mouths — and only that mouth knows which ones.

## Problem

Voice party games mostly use the microphone as a stopwatch: who shouted first, who shouted loudest, who shouted over whom. But the genuinely interesting fact about a room full of people is that they are *not interchangeable*. We want a game where the question is never "what do we say" but "whose mouth do we say it with" — asked and answered aloud, under a clock, four times in ninety seconds.

## How it works

**Host screen (TV):** a workbench — six labeled parts (RED GEAR, BLUE GEAR, LONG BOLT…), three bins, a robot arm, a JOB LIST of four plain commands ("PUT THE RED GEAR IN BIN THREE"), a clock. Everyone reads the same job; there is nothing hidden about the goal.

**The mic is exclusive.** Tap-and-hold MIC on your phone; the server grants it to the first claimant and the TV shows the holder's name. That phone runs its own on-device recognition against a 14-word vocabulary.

**Each phone, privately:** your *Accent* — two substitutions you know (`RED → BLUE`, `BIN TWO → BIN THREE`) and one blank slot, `??? → ???`. Your raw recognition is echoed back to you instantly and privately, so you always know what you actually said. The TV shows the transcript **as heard by the robot** — post-substitution — and then whatever the arm does about it.

So the loop is: read the command, work out who's clean for it, say so fast ("not me, I kill RED"), hand off the mic, watch the arm. When the arm does something deranged and nobody had claimed that word, the room has just discovered somebody's hidden third corruption — and now everyone knows something that one player didn't. A wrong action costs 8 seconds of arm re-fetch, roughly a tenth of the budget.

Per-phone is load-bearing three times over: the maps are private, the mic is a contested exclusive lock, and the split between your private echo (the truth) and the public transcript (the lie) is the entire information structure. One phone passed around collapses it instantly.

## Technical approach

Host tab, phone PWAs, one authoritative Durable Object per room (PartyKit; Socket.IO over Tailscale Serve is a drop-in).

Model: `room {jobIdx, clockMs, arm:{state, holding}, bench}`, `players[{id, known:[{from,to},{from,to}], hidden:{from,to}}]`, `mic:{holderId|null, grantedAt}`, `utterances[{playerId, rawTokens, mappedTokens, ts}]`.

Phone client uses `SpeechRecognition` with `interimResults=true`, matched against a 14-token grammar by lowercased edit distance ≤1 so "bin tree" still lands. Interim tokens render locally only. On MIC release the phone sends the final token list.

The mic is a lock in the DO: `claim` succeeds only if `holderId === null`; 4s max hold, 500ms cooldown, auto-release on socket drop. Losing claimants get a short buzz, which is itself a useful coordination signal. The server applies the speaker's substitution map, parses `VERB PART PREP BIN`, mutates the arm, pushes the *mapped* transcript to the host and the *raw* transcript back to the speaker alone.

The hard part is not sync — traffic is a few tokens per second — it's making recognition trustworthy enough that a corrupted word reads as the game's joke rather than the software failing. Mitigations: closed vocabulary, instant private echo of the raw recognition, and release-to-cancel (nothing commits until you let go).

## v1 scope

- 3 players, one job, four commands, 90 seconds
- 14-token vocabulary; 6 parts, 3 bins; all hand-authored
- 2 known + 1 hidden substitution per player, authored so every command has at least one clean speaker
- Robot arm is a 2D sprite with three animations: fetch, place, dump
- No score beyond finished/failed and time remaining

## Out of scope

Open dictation, any language or vocabulary beyond the fixed 14 tokens, more than one job, difficulty scaling, TTS, per-word confidence UI, an end-of-game reveal of everyone's Accent (good idea, v2), reconnect.

## Risks & unknowns

- Phone ASR is the whole game. iOS Safari has no Web Speech API; the fallback is streaming PCM to a server-side whisper.cpp on the host machine, adding 300–600ms that may kill the feel. v1 may have to be Chrome/Android-only, plus a degraded "type it" mode used purely to test the social layer.
- Ambient party noise with two people talking while a third holds the mic — closed vocabulary and push-to-talk should carry it, but this is unverified.
- Substitution may read as "the game is broken" instead of "my mouth is cursed." Needs loud, deliberate presentation: the word visibly swapping on the TV, the arm shrugging.
- Four commands may not be enough surface to expose a hidden substitution; three hidden slots across three players may need a nudge mechanic.

## Done means

Three phones and a TV: a job runs end to end; within it the room completes at least one command by publicly failing and then re-casting it to a clean speaker; at least one hidden substitution is discovered live and named aloud by the room; and the logs show every phone's private echo matched what its owner actually said, with no phone ever having received another player's map.

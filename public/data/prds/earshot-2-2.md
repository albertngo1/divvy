## Overview
Earshot is a 3-4 player cooperative round for a shared host screen (TV) plus one phone per player. The room must reconstruct a single garbled radio dispatch. It's for people who like Spaceteam's shouting but want the private information to live in your EARS, not just on your screen.

## Problem
Almost every voice-coordination party game hides *visual* state per phone. Ears are the untapped channel: humans are terrible at agreeing on what they half-heard, and that disagreement is comedy gold. Earshot makes 'wait, I heard EVACUATE, you heard EIGHT LATE?' the whole game.

## How it works
The **host screen** shows a numbered dispatch template with 8 slots, a few pre-filled: `Unit [1], respond to a [2] at [3] and [4]; suspect [5], repeat [5]; approach from [6].` It also shows a big shared **REPLAY** counter (starts at 5) and a 90-second timer.

Each **phone privately** holds its own audio clip: the complete dispatch read by TTS, but with a *different subset* of slot-words masked by radio static. Player A hears slots 1/3/5 clean and 2/4/6 as noise; B is the near-inverse; overlaps are deliberate so two people sometimes both hear a slot — one clearly, one as garbled bait. Players hold the phone to an ear (or use earbuds) and tap PLAY. Every PLAY, by anyone, decrements the *shared* room-wide replay budget — so players must negotiate aloud who spends a play and on which slot ('don't replay, I've got 3 and 5 solid, I need someone on 6').

Players shout the words they're confident of; one designated typist fills the template on their phone (mirrored live to the host). When every slot is filled the room taps LOCK; the host reveals which slots were correct. Win = fully correct dispatch before the timer or budget runs out.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{ template, slots[], replayBudget, timerEnds, typistId }`, `Player{ id, clipUrl, audibleSlots[] }`. Clips are pre-generated per-round: one TTS render of the full line, then N masked variants where chosen slot spans are ducked under a static bed (word-timestamp alignment from the TTS engine, or forced-alignment on a fixed script). The genuinely hard part is **audio design + shared-budget sync**: guaranteeing every slot is clean on at least one phone, that bait overlaps are solvable not impossible, and that concurrent PLAY taps decrement the budget atomically (server-serialized) with no double-spend under variable RTT.

## v1 scope
- One hand-authored dispatch, 8 slots, fixed masking layout for exactly 3 players.
- Pre-rendered static-masked MP3s (no live TTS).
- Shared replay budget = 5; single 90s timer; one typist.
- Binary win/lose reveal, no scoring.

## Out of scope
- Multiple rounds, difficulty ramp, live TTS generation.
- Per-slot confidence UI, automatic speech recognition.
- 5+ players, dynamic mask balancing.

## Risks & unknowns
- Phone speaker quality varies wildly; may mandate earbuds.
- Static masking that's fair on studio headphones may be unfair on a tinny phone.
- Room may just pass phones around instead of narrating — need budget pressure tuned so sharing-by-voice beats sharing-by-hand.

## Done means
Three phones each loop a distinct masked clip, PLAY taps decrement one shared server-side counter with no race, and a room that correctly narrates and types all 8 slots within budget sees a WIN screen; a wrong LOCK or exhausted budget shows LOSE.

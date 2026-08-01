## Overview
Crossfade is a same-room cooperative voice game for 3–4 players with a host screen and phone controllers. The room is a radio station with one open mic. The goal is a single unbroken chain of speech: no silence, no pileup. The hard part is that a clean handoff requires you to *start speaking while the previous person is still talking* — a small, deliberate overlap — and nobody knows the running order.

## Problem
Spaceteam-lineage games make you shout instructions; almost none make the *timing of human speech itself* the mechanism. Meanwhile every group has an instinct trained by video calls: wait for silence, then talk. Crossfade inverts that instinct and makes the awkward transgression of interrupting into the win condition. It needs no dexterity, no trivia, and no reading speed — just ears.

## How it works
Each phone privately holds three things: a SCRIPT FRAGMENT (two lines of goofy station copy, ending in a highlighted OUTRO WORD), a CUE WORD in a big box at the top, and a live ON AIR glow driven by that phone's own mic. Fragments are secretly chained — your cue word is the outro word of exactly one other player's fragment. The room never sees the chain.

When you hear your cue word, you start reading your fragment — *over* the person still finishing theirs. The server scores each handoff from the two speakers' speech boundaries:
- silence ≥150ms → DEAD AIR, meter drops
- overlap >600ms → PILEUP, meter drops
- overlap 200–600ms → CLEAN, meter climbs, the host ribbon shows a satisfying colour blend

Cue words are seeded as decoys inside other fragments, so two people will occasionally launch at once. Recovery must be verbal and improvised, because stopping to sort it out is itself dead air — people ad-lib to keep the meter alive.

Host screen: one horizontal air ribbon in player colours, a CLEAN HANDOFFS counter (target 6), DEAD AIR / PILEUP flashes, and the timer. It never shows fragments or cue words.

## Technical approach
Host browser tab + phone PWAs + a PartyKit Durable Object per room (single-threaded = a free mutex on the air timeline). No audio ever leaves the phone: each client runs a WebAudio AnalyserNode, computes RMS at 10Hz, applies an adaptive noise floor plus hangover, and emits SPEECH_START / SPEECH_END with client timestamps. A ping/pong every 2s gives a rolling median clock offset so client stamps land in server time within ~30ms.

Room state: `{phase, timer, speakers: [{playerId, start, end}], cleanCount, chain}`. A handoff is scored when the *previous* speaker's SPEECH_END arrives and is compared against the new speaker's already-logged START.

The genuinely hard part is cross-talk: all four phones hear all four people. VAD alone marks everyone as speaking. Every phone streams its 10Hz RMS envelope; the server attributes speech to a phone only when its level exceeds the concurrent max of all other phones by ≥6dB (near-field advantage). Getting that dominance test stable in a loud living room is the whole engineering risk.

## v1 scope
- 3 players, one 90-second round, 6 handoffs
- Exactly one hand-authored chain (3 fragments × 2 laps)
- 4-letter room code, no accounts, no reconnect
- One 3-second "everybody shut up" noise-floor sample at start
- Fixed thresholds, win/lose only

## Out of scope
- Any speech recognition — energy only, no ASR
- More than 4 players, multiple script packs, difficulty curve
- Remote play (the game is explicitly same-room), music beds, score history

## Risks & unknowns
- Dominance test may collapse if two phones sit close together
- 200–600ms may be too tight to aim for; may need widening to 300–900ms
- Players could game it by tapping or blowing on the phone
- Deliberate overlap may feel socially unbearable rather than funny
- Accessibility: unplayable for deaf/HoH players

## Done means
Three phones and a laptop in one room. A single 90-second round yields ≥5 of 6 CLEAN handoffs with the host ribbon visibly blending colours; a scripted 20-utterance test attributes speech to the correct player ≥90% of the time; and a player who deliberately pauses triggers a DEAD AIR flash within 300ms.

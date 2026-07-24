## Overview

Stall is a 4-player room game for a TV plus phones. A train crawls along a 12-station line on the shared screen. It advances one station for every four seconds of *unbroken room silence*. Each player secretly needs the train to be at a different station when the round ends. Noise is the only brake — and using it is expensive, public, and self-incriminating.

## Problem

Most silence games make silence unanimously good: everyone shuts up, everyone benefits. That's a group hug, not a game. Stall gives silence a *loser*. If your station is 3 and someone else's is 10, the quiet room is quietly robbing you, and the only counterplay is to make a sound that the room will immediately read as "ah — she's an early stop." The itch: wanting to speak, knowing speech is a confession.

## How it works

1. **Deal.** Each phone privately shows one station number, 2-11, all distinct: "YOUR STOP: 4." Plus two BRAKE tokens and one PULL CORD button.
2. **The run.** Host TV shows the line, the train, a 4-second silence accumulator filling, and each player's remaining brake tokens. No target numbers are ever public.
3. **Silence advances.** Four seconds of quiet from every phone = train moves one station, accumulator resets.
4. **Noise brakes.** Any voiced sound attributed to a phone freezes the train, resets the accumulator, and spends one of that player's brake tokens. The TV names the culprit: "BRAKE — Dev." Out of tokens, and further noise costs you 2 scoring points instead. Silence is free; noise is rationed and attributed.
5. **The cord.** Any player may hit PULL CORD at any moment. The round ends instantly. Everyone scores `10 − |train position − your station|`. Pulling early serves low numbers and burns high ones, so the cord is its own bluffing layer: pull too soon and the high-number players torch you, wait too long and someone else pulls first.
6. **Reveal.** TV flips all four secret stations and shows the scores.

## Technical approach

Host browser tab + phone PWAs against an authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Phones run WebAudio locally: 50ms RMS frames over a calibrated per-device baseline plus an autocorrelation voicing test, emitting `{playerId, dbOverBaseline, voiced, tMs}` at 20Hz. Server state: `{trainPos, silenceMs, tokens[], secrets[], phase}`, ticked at 100ms; the accumulator only integrates when every connected phone reports unvoiced.

**The hard part is attribution.** Every mic in the room hears every voice, so a single spoken word arrives as four simultaneous voiced flags. The server needs loudest-mic-wins within a ~150ms window, requiring a margin (~4 dB over the runner-up, after per-device baseline normalization) before it charges anyone a token; ambiguous events freeze the train but cost nobody. Getting that margin wrong either lets a whisperer brake for free or bills an innocent bystander for the culprit's shout.

## v1 scope

- One round, 4 players, 12 stations, 2 brake tokens each.
- Fixed 4-second advance interval, no difficulty options.
- Deal, run, brake attribution, pull cord, reveal, score.
- One room code, no lobby, no persistence.

## Out of scope

Multiple rounds, team play, station tiles with special powers, any transcription of what was said, spectator view, more than 4 players.

## Risks & unknowns

Attribution margins may be unresolvable when two people talk at once — v1 punts by freezing without charging, which players might exploit by deliberately braking in pairs. A too-quiet group makes the round a 48-second march with no drama; a too-rowdy group never leaves station 2. Whether the information leak from braking is actually *readable* to players in one round is the open design question.

## Done means

Four phones join, each showing a distinct hidden station. The train advances only during silence, visibly stalling when someone speaks, with the correct name on the TV at least 8 of 10 deliberate test utterances. A pull cord ends the round instantly, all four secret stations flip face-up, and the scores match `10 − |pos − station|` by hand-check.

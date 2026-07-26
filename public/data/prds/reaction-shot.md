## Overview
A 4-6 player room game for people who already watch scary/cringe/chaotic clips together. The host tab plays a 60-second clip. Nobody bets on the clip. Everyone bets on the *audience*: which of your friends will react hardest, and when. Each phone is simultaneously a trading terminal (a private portfolio of shares in other players) and a sensor (its own mic, measuring its owner's reaction). You are an asset and a trader at the same time, and nobody knows who owns them.

## Problem
Watching something together is already social, but the social part is inert — you react, someone says "oh my god," it evaporates. Meanwhile every existing "bet on the show" game is really a trivia quiz about a video. The itch: make the *room's* reactions the tradable event, so watching becomes performance under suspicion.

## How it works
1. **Calibrate (10s).** Each phone records ambient room noise and the player saying one sentence, establishing a personal loudness baseline. Phones show only their own meter.
2. **Position (30s).** Each phone privately gets 20 chips and buys shares in *other* players across two contracts: BIG (that player's peak reaction is the loudest in the room) and EARLY (that player is the first to break their baseline by 2σ). You cannot buy yourself. The host TV shows only total volume traded — never who bought whom.
3. **Directive (private, one card).** Each phone also gets a secret self-instruction with its own payout: *"+15 if you make no sound for the first 30 seconds,"* *"+12 if you are the loudest at least once,"* *"+10 if you are never the loudest."* So half the room is faking and half is suppressing, and shares you hold in them are worth whatever their hidden card makes them do.
4. **Watch (60s).** Clip plays on the TV. Phones go dark except a pulsing dot of your own level — resisting the urge to look at your phone is part of it. Server ingests 10Hz loudness envelopes from every phone.
5. **Settle.** TV replays the clip's waveform with each player's reaction trace overlaid, timestamped, then reveals directives and portfolios. Payouts land, and the room instantly re-litigates every gasp.

## Technical approach
PartyKit Durable Object per room; host tab and phone PWAs over WebSocket. Data model: `Room {phase, clipId, t0}`, `Player {id, baselineRms, sigma, chips, directive, positions[]}`, `Sample {playerId, tServer, z}`. Phones compute RMS on-device via Web Audio `AnalyserNode` (no audio ever leaves the phone — say so on the join screen), send z-scores at 10Hz. Clock alignment via a three-sample NTP-style offset handshake at join; samples are stamped in server time so "first to break 2σ" is adjudicated on one timeline. Positions are written to the DO and never broadcast until settlement — the host tab literally never receives them.

The genuinely hard part is **cross-talk**: one loud player lights up all four mics. Mitigation is differential — a player counts as "loudest" only if their z exceeds the room's median z by a margin, and EARLY requires being first by >200ms. Tuning that margin against real laughter is the whole risk.

## v1 scope
- 3 players, one hardcoded 60s clip, one round.
- Two contract types (BIG, EARLY), 20 chips, integer bets only.
- Three directive cards, dealt randomly.
- Host screen: clip, then waveform + traces + payout table.

## Out of scope
Multiple rounds, clip library, video upload, odds/pricing, sitting out, spectators, cross-device mic gain equalization beyond baseline z-scoring.

## Risks & unknowns
Mic cross-talk may make traces indistinguishable in a small room. Phones face-down or in pockets change gain mid-round. Directives could flatten into "everyone screams." Payout math may feel arbitrary if traces aren't visibly legible on the replay.

## Done means
Three phones and a laptop in one room: after a 60s clip, the TV shows three distinguishable reaction traces, correctly names who was loudest and who broke first, pays out portfolios and directives, and at least one player is accused of faking within ten seconds of reveal.

## Overview

The group cooperatively taps a rhythm together — say, four beats per bar, for 16 bars. Nobody can see or hear anyone else's taps individually. Each phone plays only its own tap sound. The game's score is how tight the group's aggregate timing is: standard deviation of tap intervals across all players, at each beat position. You coordinate by feel — your finger, the ambient sound of others tapping their own phones in the same room, the group's shared sense of pulse. Per-phone matters because each player's tap is a private signal that only aggregates on the server — a shared screen means one person's tap, not group convergence.

## Problem

Rhythm games are solo (Guitar Hero) or explicitly synchronized to a click track (drum circle). There's no game about *finding a pulse together without a leader*. Requires each player to have their own tap surface with private feedback, and a server that aggregates timing — pure per-phone. It's a group flow-state exercise disguised as a party game.

## How it works

Room code join, 3-8 players. Server picks a tempo (e.g. 90 BPM) and beat count (e.g. 64 beats = 16 bars of 4/4). Countdown: 4 audible clicks over the group's phones (all synchronized via server timestamps), then GO. No more clicks. Each phone shows a big tap pad. Everyone taps what they think is the pulse. Each phone plays its own tap sound (short percussive blip) so the tapper gets feedback but no one else hears it through the phone. In a co-located room, players hear ambient finger-taps and rely on that + feel. After 64 beats, server computes cluster tightness per beat and displays a score.

## Technical approach

PartyKit or Socket.IO. Server broadcasts a synchronized start-time (accounting for RTT ping estimate). Client uses `Web Audio API` for low-latency tap sound (`AudioContext.currentTime` for accurate scheduling; pre-decoded buffer for the click). Client timestamps each tap via `performance.now()` and sends to server. Room state = `{tempo, beat_count, start_ts, taps: [{player_id, beat_target, actual_ts}], score}`. Score = average of per-beat std dev of tap timing across players; lower = better; converted to a 0-100 group score.

## v1 scope

1 game = 1 attempt, 3-6 players, tempo 90 BPM, 32 beats (8 bars 4/4), 4-click count-in. Web Audio tap sound (single blip preloaded). Score revealed at end with breakdown per bar. No leaderboard, no target rhythms beyond 4/4, no visual click, no metronome guide beyond the count-in.

## Out of scope

Visual metronome during play (defeats the point), leaderboards across sessions, custom tempos in v1, non-4/4 time signatures, teams, individual per-player tightness scores (cooperative only), audio DSP beyond a single tap sound.

## Risks & unknowns

Web Audio latency is variable across devices — could throw off tightness scoring. May need to measure client-side latency in lobby (round-trip synth test) and correct. Second risk: without a click track, groups may drift massively — need to pick tempo and duration that's tight enough to be scorable but loose enough to feel like discovery. Third: this only works co-located (need ambient sound of others tapping); remote play doesn't have the feedback channel — should be lobby-gated to "same room" mode only.

## Done means

4 friends in the same room play one round. Score is meaningfully non-random (not the "everyone tap alone" baseline). Group replays immediately to try to beat their score. At least one player says "I could FEEL you speeding up".

## Overview
A 90-second cooperative panic game for exactly four people in one room, one host screen, four phones. The machine you are operating does not care what anybody says. It records only **who** held the floor, and in what order. Twelve slots, one tape, one shot.

## Problem
Every Spaceteam-lineage game treats talking as the free tool you use to solve the puzzle. Talk is never scarce, never costly, never part of the state. That makes the panic loud but shallow — coordination is just faster shouting. The itch: a game where the act of coordinating *is* the move you're coordinating about, so "wait, let me think out loud" is itself a commitment you cannot take back.

## How it works
The host screen shows a twelve-slot tape filling left to right. Each filled slot is stamped with the color of whoever spoke. That's all the TV shows: colors, blanks, and a clock.

An utterance claims a slot when your phone hears **1.2 continuous seconds** of your voice. Content is irrelevant — hum it, count, or actually say something useful. While you hold the floor, everyone else's voice is ignored; the floor is exclusive and goes to the first onset. Three seconds of room-wide dead air burns a slot as a blank defect.

Each phone privately holds **two of the six rules** constraining the finished tape, and never sees the other four. Rules are relational, not named: *"slots 5 and 6 must be different people"*; *"you appear exactly three times"*; *"the last slot is whoever spoke first"*; *"after slot 7, nobody twice in a row."* Nobody can see the whole constraint set, so you must describe your rules aloud — which costs a slot, said in your own color, at a position you may not want. The escape valve is frantic pointing and mouthed words, because gesture is free and voice is not. A violated rule turns that slot red immediately, without naming which rule broke.

Win: twelve slots, at most one red.

## Technical approach
Host browser tab + phone PWAs + one authoritative PartyKit Durable Object per room. Phones use `getUserMedia` into an AudioWorklet computing short-window RMS and zero-crossing rate; **raw audio never leaves the phone** — only `voice_start` / `voice_end` events with local high-resolution timestamps, plus a coarse RMS level.

Data model: `Room {code, players[], tape: Slot[], rules: Rule[], floor}`; `Slot {index, playerId|null, defect}`; `Rule {ownerId, kind, params}`. The server runs a floor state machine: IDLE → HELD(player, t0) → COMMITTED at 1.2s → COOLDOWN 300ms. Clock skew is normalized with periodic RTT pings (Cristian's algorithm) so onsets are comparable.

The genuinely hard part is attribution, not sync. Four phones in one small room all hear all four people. Onset detection needs a per-phone adaptive noise floor plus a **250ms onset race**: when two phones claim the floor near-simultaneously, the louder one wins, because the nearest mic is loudest. Get this wrong and the tape lies, which kills trust in the whole game.

Rule generation must also verify satisfiability — DFS with pruning over assignments of four players to twelve slots, rejecting any rule set with no solution.

## v1 scope
- Exactly 4 players, one 90-second round, 12 slots
- 6 rules drawn from 4 rule kinds, 2 dealt privately per phone
- Host tape + clock; no scoreboard, no rounds, no rematch button
- 4-letter room code, no accounts, no persistence
- Ends in WIN or FAIL text on the TV

## Out of scope
Multiple rounds or scoring, 5+ players, speech recognition of any kind, custom rules, spectators, remote play, a mute button.

## Risks & unknowns
Mic bleed may misattribute onsets in a tight room; whisper-gaming the VAD; the "talking costs you" loop could read as punishing rather than funny; unsatisfiable or trivially-satisfiable rule draws; hoarse players after three rounds.

## Done means
Four phones on a table, unbriefed players: attribution matches a human observer's log on ≥90% of utterances across three rounds, and at least one group fills all 12 slots with zero red *after* having failed at least once.

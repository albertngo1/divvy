## Overview
Closing Bell is a 3–5 player game for a room that's already slouched in front of a TV. The host screen plays a short, uncertain clip — a trick shot, a soufflé, a penalty kick — while every phone holds a private betting window on one binary question. The window does not close on a timer. It closes on the first human noise in the room. Whoever is still undecided when the bell rings gets nothing.

## Problem
Watching-together is the most passive thing a group does, and every existing "bet on the clip" game bolts a countdown clock onto it. A countdown is a machine deadline: nobody feels it as a decision by another person. The itch is a market whose closing time is set adversarially by the people in the room with you — where waiting for more information is only free while everyone else is also still waiting.

## How it works
1. Host screen: the question ("Does he land it?"), a lock lamp per player (locked / open, never which side), and a running "MARKET OPEN" bar.
2. Each phone privately shows: 10 chips, a stake slider, YES / NO, and a LOCK button. Nobody sees anyone's side or stake.
3. Playback starts. The bell is disabled for the first 10 seconds so there's a real market.
4. Every phone runs voice detection on its own mic — your phone is your microphone, sitting next to you. Any voiced sound over the adaptive floor rings the bell.
5. On the bell: all unlocked players are SHUT OUT and forfeit nothing but win nothing. The TV names the ringer, who pays a 2-chip fee — so ringing is a weapon, not a reflex.
6. Clip finishes. Locked stakes settle pari-mutuel: the losing side's pot splits across the winning side proportional to stake.

The whole game lives in the gap between "I know enough" and "I've locked." Once you're locked, silence is your enemy and a cough is worth two chips.

## Technical approach
Host browser tab + phone PWAs + one PartyKit Durable Object per room. State: `Room {clipId, phase, tStart, bell:{ringerId, tBell}}`, `Player {id, chips, position:{side, stake, tLock}}`. Phones join by room code; no accounts.

Each phone does local VAD in WebAudio — 20 ms RMS frames, adaptive noise floor, 120 ms hold — and emits `BELL_CANDIDATE` stamped with its own monotonic clock. Clocks are reconciled with a repeated ping/pong offset handshake (keep the min-RTT sample). The server coalesces candidates in a 250 ms window and picks the loudest as ringer.

The genuinely hard part is the LOCK-versus-BELL race: a lock sent from across the room at nearly the same instant as a gasp. Ordering by arrival time is unfair and feels rigged, so order by client stamp plus measured offset, and publish a 150 ms grace band so a rejected lock reads as "close call" rather than "broken." Second hard part: the clip's own audio trips every VAD. v1 runs the clip near-muted with subtitles and calibrates the floor during a 3-second pre-roll.

## v1 scope
- 3 players, one 45-second clip, one binary market, one bell.
- 10 chips, single stake, pari-mutuel settle.
- Host shows lock lamps and the ringer's name.
- Room code join, no accounts, no persistence.

## Out of scope
Multiple sequential markets, cash-out, clip upload or library, spectators, running scores across rounds, speaker diarization, anything on the TV's own audio.

## Risks & unknowns
iOS requires a user gesture and HTTPS for mic access — one tap at join. Room noise from outside (a dog, a fridge) rings a false bell; the fee makes false rings hurt, which may feel unjust. Degenerate strategy: lock instantly, ring immediately — countered by the 10-second bell lockout plus pari-mutuel odds punishing the uninformed obvious side.

## Done means
Three phones and a laptop in one living room: the clip plays, a player deliberately coughs at 22 seconds, the host rings within 300 ms, every unlocked phone flips to SHUT OUT, the ringer's chips drop by 2, and the settle screen pays the winning side correctly. Repeat twice, including one genuine gasp, with no disputed lock.

## Overview
Billable is a 4-player, one-round concurrent-room game for a shared host screen plus four phone controllers. It has no questions, no prompts, and no content to author: the entire game is an economy made of speech. Talking is the only fuel the room has, and it is individually expensive and collectively necessary.

## Problem
Silence games usually make silence a pure good — shut up longest, win. That collapses into a staring contest. The itch here is a genuine public-goods dilemma: the room *needs* noise, but nobody wants to be the one paying for it, and the accounting is private enough that free-riding is invisible until the reveal.

## How it works
The host TV shows one thing: **the Meter**, a bar from 0 to 100. The Meter advances only while the room is producing voiced sound; rate is a capped function of total room energy. In silence it freezes — it never falls back.

Each phone privately holds a **Job Card**: a hidden Meter target (e.g. 41, 58, 62, 89) and a payout. Nobody sees anyone else's target. Each phone also shows the player's private **Bill**: the running integral of *their own* voiced energy, charged superlinearly, so sustained holding-forth costs far more than a clipped word. Final score = payout (if the Meter passed your target before time) − your Bill.

The turn comes from a **Dividend**: once your job pops, you stop earning from the Meter and instead earn from every second the Meter is *frozen* for the rest of the round. So a player with target 41 finishes early and immediately wants dead silence — while the player sitting on 89 needs the room roaring. Neither can say so without paying for the sentence. The result is a room of people shushing, gesturing, and baiting each other into speech, learning who has already cashed out only from behaviour.

The host screen shows the Meter and a round clock. It never shows targets, Bills, or who is talking. Everything diagnostic is private, per-phone, and simultaneous.

## Technical approach
Phone PWA opens `getUserMedia`, runs an AudioWorklet computing A-weighted RMS in 100 ms frames plus a cheap voicing flag (autocorrelation peak). Each phone streams `{frame_id, dbfs, voiced}` at 10 Hz over WebSocket to a PartyKit Durable Object holding authoritative state: `{meter, players: {id, target, payout, bill, finished_at}}`.

The hard part is **billing attribution**. Cross-talk means every phone hears every mouth. The server aligns frames into 200 ms buckets by server receive time, takes the argmax device, and bills the owner only when that device is ≥6 dB above the runner-up, with hysteresis (a speaker keeps the token for 400 ms). Meter advance uses the *max* device energy, not the sum, so shouting into your own phone can't inflate the shared fuel. A 10 s calibration (each player says their name in turn) fixes per-device gain offsets. Server broadcasts Meter at 10 Hz; Bills go only to their owner.

## v1 scope
- Exactly 4 players, one 4-minute round.
- Fixed targets 41/58/62/89, fixed payouts, one Dividend rate.
- Calibration step, Meter, private Bill, private target, final scoreboard.

## Out of scope
- Speech-to-text of any kind, multiple rounds, lobbies, more than 4 phones, trading or bribing mechanics.

## Risks & unknowns
- Attribution failure with two people talking at once → wrong Bill, feels unfair. Mitigate with the 6 dB gate (ambiguous buckets bill nobody).
- Nobody talks at all and the Meter never moves — needs the Dividend rate tuned low enough that the first job is reachable.
- Phone mic AGC distorting the dB scale; disable via `autoGainControl: false`.

## Done means
Four phones calibrate, the Meter moves only when someone speaks, each player's Bill rises only on their own voice in a two-speaker test, at least one player finishes early and visibly starts shushing the room, and the final scoreboard reconciles payout − Bill for all four.

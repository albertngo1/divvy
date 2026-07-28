## Overview

A 4-player reading race for a living room, where the room's noise is the developer fluid. Each phone privately holds a different passage of text that reveals itself one character at a time — but only while nobody is making a sound. Talking doesn't just cost points; it visibly unwrites the page in front of you. For groups who like a game with one cruel rule and no instructions.

## Problem

"No talking" rules in party games are unenforceable and dull, because breaking them produces nothing you can see. Silence is treated as absence — a gap between the fun parts. This makes silence the medium the game is printed on, and makes the punishment for noise immediate, physical, and shared.

## How it works

**Phone (private):** a passage of text, revealed left-to-right at ~14 characters/second while the room is quiet. When the room goes loud, revealing stops *and the tail burns back* at 25 chars/sec — you watch your own progress eaten. Passages are dealt secretly at different lengths (48 / 96 / 140 / 210 characters); each ends in a 4-digit code. Type your code to bank.

**Host TV (shared):** one ambient level bar, four anonymous progress pips, a 4-minute clock. No names, no attribution during play.

Only the first two players to bank score. The instant you bank, your phone reads: **YOU'RE OUT — noise costs you nothing now.** The short-passage player finishes first and becomes a weapon: every word they say is free to them and lethal to the two people still reading. The room's only defence is glares.

At the end, the TV names **The Talker** — the single largest contributor to burned characters. If The Talker banked in the top two, they forfeit their score. So griefing pays, but not infinitely.

## Technical approach

Host browser tab + phone PWAs + PartyKit Durable Object as authority. Each phone streams 20 Hz RMS frames (AudioWorklet, dBFS, light A-weighting) — never audio. On join, a 3-second quiet calibration fixes each device's noise floor `floor_i`.

Room gate = `max_i(rms_i − floor_i) > 9 dB` — **max, not mean**, so one talker can't be averaged away by three quiet phones. `reveal_index` per player is computed server-side and broadcast at 20 Hz, so no client clock drift and no cheating by tab-throttling.

The genuinely hard part is twofold. (1) **Perceived latency:** burn-back must feel instantaneous, so each client predicts the gate locally from its own mic and reconciles against the server's authoritative index. (2) **Attribution without self-shielding:** blame for a noise frame uses `argmax` over *other* devices only. Your own mic never accuses you — otherwise muffling your phone under a cushion would make you invisible.

## v1 scope

- Exactly 4 players, one 4-minute round
- Four hard-coded passages of the four fixed lengths, dealt at random
- Reveal / burn-back / bank-code loop
- TV: ambient bar, 4 anonymous pips, clock, end-of-round Talker reveal + forfeit

## Out of scope

Multiple rounds, custom passage packs, spectator mode, more than 4 players, any speech recognition, saved profiles, mobile-Safari background audio recovery.

## Risks & unknowns

Ambient HVAC or a laughing neighbour may pin the gate open — needs a floor-drift re-calibration every 30s during quiet stretches. Laughter is uncontrollable and may feel unfair (that may be the fun). Passage-length asymmetry may be too brutal; the 210-char player may never bank. iOS mic permission mid-game kills a client.

## Done means

Four phones join, calibrate, and receive different-length passages. One person says a sentence and text visibly burns backwards on all four phones within 200 ms. Two players bank codes; the TV correctly names the loudest single contributor to burned characters and applies the forfeit when that player banked in the top two.

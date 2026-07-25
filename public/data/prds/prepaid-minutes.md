## Overview
Prepaid Minutes is a 3-player co-op where speech is a metered, depletable resource. Each phone holds a private balance of talk-seconds; its own microphone burns that balance down while its owner speaks. The balances are deliberately mismatched against information: the one player who can *see* the fault is issued 10 seconds, while the two players holding the repair controls are issued 45 seconds each and can see nothing. When your balance hits zero your panel locks — talking literally spends your ability to act.

## Problem
Every voice party game rewards the loudest, fastest talker. The genre's failure mode is one dominant player narrating while everyone else operates as their hands. Metering speech inverts that: the person who knows the most is forced to compress to near-telegraphy, and the loud players discover that their real job is asking closed questions and shutting up.

## How it works
**Private on each phone:** your own balance ticking down to a tenth of a second; either your INTEL panel (a live fault readout: three symptoms with values) or your TOOL panel (four labeled controls — a rotary, two toggles, a keypad). Nobody has both.

**Shared on the TV:** a coarse 5-bar battery icon per player (deliberately imprecise — you can't audit anyone exactly), the fault's severity meter climbing, and a 90-second clock.

The fault requires three ordered corrections. The intel player can read the fault but touch nothing. The tool players can act but see only unlabeled consequences. So intel must compress — "rotary two, seven, red" — while tool players interrogate in yes/no and act.

**TRANSFER:** hold a teammate's name for 1s to send them 5 seconds at a cost of 8 of yours. Lossy on purpose — donating airtime to a stalling talker is a genuine gamble.

**Dead air:** at zero, the phone shows DISCONNECTED, controls grey out, and the TV kills your battery icon. You can still physically speak — but you are now useless, so nobody wants your opinion.

**Win:** all three corrections applied before the severity meter tops out.

## Technical approach
Socket.IO over Tailscale Serve (host laptop already runs it), host browser tab as display, phone PWAs as clients, server authoritative for balances and fault state. Model: `Room {clockMs, fault:{steps[], cursor}, players: playerId → {role, balanceMs, panel, calibration:{noiseFloor, gain}}}`.

Phones do WebAudio RMS in an AudioWorklet, emitting a normalized level at 20Hz. The server — not the phone — decides who is billed.

**Hard part: attribution under cross-talk.** Every mic hears every voice, so naive per-phone VAD bills all three whenever anyone speaks. Approach: a 20-second calibration (room tone, then each player says a sentence solo) yields a per-phone noise floor and gain; then per 100ms frame the server bills only the phone whose normalized level is the argmax *and* exceeds its floor by a margin, with 300ms hysteresis so a sentence isn't split mid-word between two phones. Ties bill nobody — cheap, and it fails in the players' favor.

## v1 scope
- 3 players, one fault, three hardcoded correction steps
- One intel role, two tool roles, fixed 10/45/45 second budgets
- Calibration step, TRANSFER button, hard panel lock at zero
- One 90-second round, win/lose card

## Out of scope
- Scoring, multiple rounds, role rotation, procedural faults, reconnect, 4+ players
- Any speech recognition — levels only, never words

## Risks & unknowns
- Whispering may dodge billing entirely; if it does, either it also fails to communicate (fine) or it breaks the game (bad)
- Argmax attribution across mismatched phone mics may misbill under laughter or a loud TV
- 10 seconds may be so brutal the intel player just gives up — the budget needs playtest tuning, not theory

## Done means
Three phones calibrate, a round runs, and the server's billing log matches a human observer's account of who spoke for at least 80% of the round; at least one playtest ends with a player deliberately staying silent while holding the answer, and someone at the table laughs about it.

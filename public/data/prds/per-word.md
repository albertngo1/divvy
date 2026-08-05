## Overview
Per Word is a 3–4 player concurrent-room game for a TV/laptop host screen plus one phone per player. The room has five minutes to reach a real, unanimous group decision ("pick the one movie we all watch tonight" from six titles on the TV). Reaching agreement requires talking. Talking is metered and taxed — and the tax rates were set, secretly, by the other people in the room.

## Problem
Silence games usually price speech with a single global rate: talk, lose points. That's a thermostat, not a game. The itch here is that the *price* should be a social object — something other people chose about you, that you can feel but never see, and that you can exploit if you guess it right.

## How it works
1. **Tariff setting (60s, silent).** Each phone privately shows the other players' names and 10 tariff chips. You distribute all 10 across them however you like — 10 on one person, or spread. Your tariff on Kim means: every second Kim spends speaking pays *you* that many cents. Nobody ever sees the matrix.
2. **The floor (5 min).** The host TV shows the six movie titles, a countdown, and a single anonymized bar: total cash moved so far. Each phone privately shows only your own live balance ticking, plus a discreet "who's currently hot" indicator that names the person the server currently attributes speech to (so you know when your income is arriving, but not from whose tariff).
3. **The squeeze.** Your speech drains you at the sum of everyone's tariffs on you — an unknown, personal rate. You learn your rate only by talking and watching your balance fall. Someone who quietly notices they're cheap can dominate the conversation; someone expensive must whisper, gesture, or vote with their thumbs. Because the group decision needs consensus, total silence loses everyone the round.
4. **Baiting.** The only way to convert your tariffs into income is to make your target talk — ask them a direct question, misquote their opinion, propose the movie they hate. Every bait costs you speaking seconds at your own unknown rate. Provocation becomes an investment decision.
5. **Settle.** Unanimous pick by the buzzer = every player doubles their balance. No agreement = everyone halves. The TV then reveals the full tariff matrix at once — who priced whom, and who spent the round unknowingly funding their bully.

## Technical approach
Host tab + phone PWAs + one authoritative Durable Object (PartyKit) per room. Data model: `Room {phase, deadline, movies[], votes: Map<pid,movieId>}`, `Player {pid, balanceCents, tariffsOut: Map<pid,int>, speakingMs}`, `SpeechFrame {pid, tMs, dbfs, voiced}`.

Each phone runs an AudioWorklet computing 20ms A-weighted RMS plus a zero-crossing/autocorrelation voicing gate, and streams only `{dbfs, voiced}` — never audio — at 50Hz over WebSocket. The server does attribution, not the phones: in each 200ms window it takes the argmax device and requires a ≥6dB gap over the runner-up plus 3-frame hysteresis before flipping the "hot" speaker; ambiguous windows are dropped and charged to nobody. That's the genuinely hard part — cross-talk, phones face-down on a table, and one person sitting next to the TV speaker all break naive loudest-wins. Calibration: 8s of room tone at join to set each device's noise floor.

Billing is server-side and monotonic: charged speech-ms per player per tick × summed inbound tariffs, applied in one transaction and broadcast as balances only.

## v1 scope
- 3 players, one 5-minute round, six hardcoded movie titles.
- 10 tariff chips, integer only, no self-tariff.
- Host screen: countdown, titles, one aggregate cash bar, final matrix reveal.
- Phone: tariff allocator, own balance, hot-speaker name, vote buttons.
- Consensus check = all three votes equal at buzzer.

## Out of scope
- More than one round; carried balances; tariff re-setting mid-round.
- Transcription, keyword detection, or content-aware scoring.
- Reconnect-safe billing replay; spectators; >4 players.

## Risks & unknowns
- Attribution failure feels like cheating — needs a visible "unattributed" state so players trust the meter.
- Players may discover total silence + thumbs voting beats the game; the halve-on-no-agreement penalty may need tuning.
- Tariff reveal could land as genuinely mean rather than funny with the wrong group.

## Done means
Three phones join, set tariffs, and hold a real argument; the server attributes ≥85% of clearly-single-speaker seconds to the correct phone in a living-room test; each player's balance moves at their true summed inbound rate; the room reaches or misses consensus, balances double or halve, and the TV reveals the matrix — end to end, no reload.

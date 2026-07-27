## Overview
A 4-player living-room game for one host screen and four phones. The TV plays a 90-second whispered broadcast — a ten-item inventory — over a low noise bed. Each phone shows a live caption pane that advances *only while that phone's owner is silent*. Talk, and the pane goes red and stalls; the words that stream past during your sentence are gone forever, for you and only you. Everyone ends the broadcast holding a differently gap-riddled copy of the same list. Then everyone must type all ten items.

## Problem
Silence games usually punish talking with an abstraction: a meter, a points penalty, a buzzer. Nobody feels an abstraction. Here talking costs *information you actually wanted*, in real time, irreversibly, and the loss is private — you watch your own line stall and have no idea how far ahead everyone else's has scrolled. The only way to fill your gaps is to ask someone, which is the exact act that creates new gaps. That trap is the game.

## How it works
**Broadcast phase (90s).** Host TV plays a pre-recorded whisper: one item roughly every 7 seconds. The TV shows a timeline and a waveform — never the text. It also shows four colored transmit bars, lighting up live whenever a player is voiced. So the room publicly knows *who* has been talking (and is therefore poor in items) but never *what* anyone received.

**Privately, each phone shows:** the scrolling caption pane containing only tokens delivered during that phone's silent windows; a full-width red `TRANSMITTING — RECEIVER MUTED` bar while voiced; a personal missed-token counter.

Mid-broadcast trading is legal and priced: whisper an item to a neighbor and you forfeit whatever streamed during the whisper, and your bar lights up on the TV for all to see.

**Filing phase (45s, enforced silence).** Every phone types its ten items. Normalized exact match = 1 point per item; a room bonus if all four submit 10/10 — so hoarding wins the round but loses the bonus.

## Technical approach
Host browser tab + phone PWAs + an authoritative PartyKit Durable Object over WebSocket.

Data model: `Room{code, phase, t0}`, `Script[{idx, text, startMs, endMs}]`, `Player{id, vadIntervals[], revealed:Set<idx>, submission[]}`.

Phones run WebAudio `AnalyserNode` RMS with 3-frame hysteresis VAD and stream `{t, voiced}` deltas at 20Hz. The server — not the phone — decides reveals: token *k* is pushed to player *p* only if *p* reported silent for ≥80% of `[startMs, endMs]` corrected by that phone's clock offset.

The genuinely hard part is twofold. **Clock sync:** an NTP-style ping/pong offset per phone, re-estimated every 5s, because 200ms of skew silently steals or gifts tokens and the game feels broken rather than harsh. **Rejecting the TV's own audio:** every phone hears the broadcast, so naive VAD trips constantly. A 5-second everyone-shut-up pre-roll calibrates each phone's bed floor; voiced requires +9dB over the rolling bed median. Anti-cheat: if the measured bed drops below the calibrated floor (mic covered, phone muted), the phone reports `OBSTRUCTED` and receives nothing.

## v1 scope
- Exactly 4 players, one 90s broadcast, one hardcoded whispered WAV script of 10 items
- Server-gated token reveal + per-phone caption pane
- Public transmit bars on the TV
- Typed submission, one scoreboard

## Out of scope
Multiple rounds, ASR (the script is ground truth, nothing is transcribed), reconnect handling, lobby art, spectators, script authoring tools.

## Risks & unknowns
VAD false positives from laughter or a passing truck are the entire fairness surface. The loop may be too punishing to be funny — mitigate by making ~40% of tokens redundant restatements. TV volume must be set once, correctly, or calibration is garbage. Bluetooth-speaker latency on the host shifts the script timeline; measure it once at setup.

## Done means
Four phones and one laptop in a real room: a broadcast completes where one player's caption pane visibly stalls mid-item while another's keeps scrolling, the two panes provably differ, and the final scoreboard shows different miss counts traceable to measured speech rather than to bugs.

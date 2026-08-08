## Overview
A 4-minute cooperative timing game for exactly 3 players in one room. The host screen is a black count-off display; each phone is a private, silent metronome. Nobody may speak. The room wins by tapping together — while each phone is quietly lying to its owner about what "together" feels like.

## Problem
Every sync party game gives the room one shared beat, so "stay in time" is a motor-skill test. The actual social itch is different and untapped: everyone believes they have good time, and nobody knows they are the one dragging. There is no consumer game where your private sense of tempo is the thing being falsified.

## How it works
The host TV shows a black screen with a single breathing dot and the words BEAT 8. TOGETHER. NO TALKING.

Each phone privately runs its own click track — a haptic pulse plus a soft tick from that phone's speaker — at a tempo secretly drawn from {92, 100, 108} BPM. Assignment is random and never revealed. Every phone shows the same instruction and the same UI: a large tap pad and a counter reading 1…8. Obeying your own click puts the three taps up to 1.3 s apart. The room must land all three taps inside a 120 ms window.

After each attempt the TV shows a timeline strip with three unlabeled tick marks and the spread in milliseconds. Simultaneously each phone shows the *same* strip with only that player's own mark highlighted — the private half of the feedback. That pairing is the whole game: the TV tells you the room's shape, your phone tells you where you sat in it, and you must silently decide to abandon your own grid (tap on your beat 7.5, start late, ignore the click entirely). Five attempts, then reveal: the TV plays all three tempos aloud at once so the room finally hears what it was fighting.

## Technical approach
Host browser tab + phone PWAs + a PartyKit Durable Object as the authoritative room. Data model: `Room{code, phase, attempt, players[{id, tempoBpm, clockOffsetMs, tapAtServerMs}]}`.

Sync strategy: taps are timestamped locally with `performance.now()` and mapped into server time via a 20-sample ping-pong offset estimate (Cristian's algorithm, median-filtered) taken in the lobby. Network latency therefore never touches scoring — only the clock estimate does. Clicks are scheduled on-device with a Web Audio lookahead scheduler (25 ms tick, 100 ms horizon), never `setInterval`.

The genuinely hard part is not the network. It is output latency and human tap bias: Bluetooth headphones add 150–300 ms (detect and refuse via `AudioContext.outputLatency`), iOS Safari has no `navigator.vibrate` (fall back to a visual flash plus speaker tick), and players tap 40–90 ms after the beat they intend. A mandatory 8-beat calibration round measures each player's mean tap bias and subtracts it before scoring.

## v1 scope
- Exactly 3 players, one 5-attempt round, one 4-bar phrase
- Three hardcoded tempos; no difficulty settings
- Speaker tick + visual flash only; haptics best-effort
- Anonymous 3-tick timeline + own-mark highlight; no names, no scores
- Success = spread under 120 ms once

## Out of scope
- More than 3 players, multiple rounds, tempo drift mid-attempt
- Mic-based talk detection (honor system + SHHH banner in v1)
- Any leaderboard, account, or persistence

## Risks & unknowns
- iOS audio unlock and background-tab throttling can kill the click; PWA must stay foregrounded
- 120 ms may be too tight or too loose — needs live tuning with real rooms
- Players may just watch each other's arms; camera-shy seating or a "phones under the table" rule may be required

## Done means
Three phones and a laptop, three people who have never played, no talking. Calibration completes on all three devices, and in at least 3 of 5 test rooms the spread drops monotonically across attempts and one attempt lands under 120 ms. Post-game, at least one player says unprompted that they realized they were the fast one.

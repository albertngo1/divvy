## Overview
Gag Order is a Jackbox-shaped endurance game for 3–5 people in one room. Everyone takes a vow of silence; your phone banks points for every second you stay quiet — and simultaneously conspires against you, privately serving dares and provocations engineered to make YOU specifically laugh, gasp, or blurt. Your own mic is the referee that catches the slip. The last one still silent, or the biggest silence bank, wins.

## Problem
'Don't laugh' games are ancient, but they're usually refereed by a human staring at everyone, and the temptations are public. The fresh angle: make the temptation *private and personalized* — your phone knows an embarrassing prompt only you can see — and make the *mic*, not a person, the impartial judge running independently on every device at once.

## How it works
The host screen shows a shared escalating pressure track (a slow drum, a silence leaderboard of who's still in, an ambient timer) and, optionally, one silly clip everyone watches together. It shows who's alive and each player's growing silence bank — never the private dares.

Each phone PRIVATELY does two jobs. First, it runs a temptation queue: pop-ups tailored to poke you — 'Everyone else was told you snore. Don't react.' / 'Read this fact out loud for +200… if you dare.' / 'React to what your neighbor just did.' You read them silently; they exist to break you. Second, it listens: WebAudio measures your mic envelope, and any vocalization above your calibrated noise floor — a laugh, a word, a snort — logs a STRIKE, zeroes your current streak, and after one strike (v1) eliminates you. The host chimes and the leaderboard updates.

The fun is the asymmetry: nobody else knows what your phone just dared you to endure, so a random person cracking looks inexplicable and hilarious.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{players[], phase, startTs}`; `Player{id, silenceMs, alive, strikes, tauntQueue[]}`. Mic stays ON-DEVICE: AnalyserNode RMS→dB ~20×/sec; the phone emits only 'vocalization detected' events + accumulated silence time, never audio. Server owns elimination order and the leaderboard; taunts are pre-authored and shuffled server-side per player.

The genuinely hard part is discriminating YOUR voice from room noise and from other players' outbursts. When one person cracks, the whole room laughs and every mic hears it — naive detection eliminates everyone at once. v1 mitigations: per-phone calibration of noise floor, a self-onset heuristic (your own laugh peaks loudest/earliest on your own mic), and a short server-side dead-window after any elimination so the triggering laugh doesn't cascade.

## v1 scope
- 3 players, one round, ~90 seconds or until one remains.
- Per-phone mic calibration step.
- ~6 pre-written personalized taunts per player, shuffled.
- One strike = out; host shows leaderboard + elimination chime.

## Out of scope
AI-generated taunts, accelerometer 'flinch' detection, multi-round tournaments, team play, replay/highlights, robust cascade-proof audio ML.

## Risks & unknowns
Contagious-laughter false eliminations; mic sensitivity variance; whether pre-written taunts stay funny; iOS Safari mic-permission and background-tab throttling.

## Done means
Three phones calibrate, three people sit silent while each phone privately serves its own taunts, and when one player audibly laughs their phone (and only theirs) logs the strike and eliminates them within ~300ms without taking the others out.

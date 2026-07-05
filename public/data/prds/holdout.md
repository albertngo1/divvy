## Overview
Holdout is a live standoff for 3–6 players in a room together. Everyone tries to stay silent longer than everyone else; the mic on each phone is the enforcer that catches the first person to make a sound. It's for groups who like the sweaty tension of chicken — sitting perfectly still while someone across the table makes a face designed to break you.

## Problem
'Try not to laugh' games are fun but the judging is social and disputed ('you totally laughed!'). Nobody wants to be the arbiter. Holdout hands the ref job to the phones and adds hidden stakes so the correct move isn't always to hold as long as possible — sometimes folding early is smart, and only you know.

## How it works
The host TV shows a growing jackpot number and a row of player avatars, each lit while still 'in.' It does NOT show anyone's mic level.

Each PHONE privately shows three things: (1) a live meter of ITS OWN mic level with a red 'noise floor' line, (2) a secret PAYOFF card for this round — a multiplier (0.5×–3×) drawn per player, so the pot is worth wildly different amounts to each person, and (3) one single-use 'Snipe' — a secret word only you can see. When any phone's mic crosses the noise floor (you talk, laugh, cough, gasp), that phone reports OUT and its avatar dims; the jackpot at that instant is banked against your payoff only if you were last standing. Snipe: whisper your secret word and your phone's on-device speech recognizer knocks out whoever's currently the longest holder — but whispering IS sound, so the same act folds you immediately. It's a kamikaze that only makes sense if your payoff is low and you'd rather deny the leader.

The fun: reading body language while the mic reads you, and bluffing a big-stakes face when your card is actually a 0.5×.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Each phone runs mic analysis LOCALLY via Web Audio API `AnalyserNode` (RMS over a short window) — raw audio never leaves the device (privacy + bandwidth). Phones emit only tiny events: `{playerId, event:'out'|'snipe', t}`. Data model: `Round { jackpot, floorCalibration, players: {id, payoff, alive, outAt} }`. Server is the clock — it timestamps events, resolves Snipe-vs-natural-out races by server-arrival order, and broadcasts a single authoritative jackpot tick (~10Hz). Hard part: per-device noise-floor calibration (a loud room vs a quiet one) and preventing one loud table-thump from tripping everyone — solved with a 300ms calibration sample at round start and per-phone adaptive baselines.

## v1 scope
- 1 round, 60s cap, 3–4 players
- Per-phone RMS mic detection + calibration
- Hidden payoff multiplier per player
- Jackpot grows with elapsed silence; last-alive banks it
- Win screen showing everyone's secret payoff reveal

## Out of scope
- Snipe word (add in v2 if base loop is fun)
- Multi-round scoring / tournament
- Spectator mode, sound effects, cosmetics

## Risks & unknowns
- RMS may false-trigger on ambient noise — needs playtest tuning
- Attrition can drag with few players; the 60s cap and payoffs must create urgency
- Payoff bluffing may be too subtle to matter at v1 scale

## Done means
Four phones in one room; each calibrates, the jackpot climbs, every real sound dims exactly the phone that made it within ~200ms, and the last-silent player's screen reveals the banked pot × their hidden payoff.

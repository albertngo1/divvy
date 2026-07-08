## Overview
Douse is a 3–5 player cooperative panic game. The shared TV shows a top-down map of *your real room* — couch, kitchen, doorway, window — divided into a handful of named zones. Flames ignite in those zones and spread. Each player's phone is a private fire extinguisher: run to the burning zone and physically blow across the mic to put it out. It's for a group standing in a living room who want a sweaty 90-second co-op burst.

## Problem
Mic games almost always mean pitch or volume. Nobody uses the one thing every kid already knows a phone can sense: breath. Blowing out a candle is instantly legible, physical, and a little ridiculous — and it forces you to actually go somewhere, because you can only blow at one place at a time.

## How it works
The host screen (shared) shows the room map with flame icons per zone, a spreading meter, and a team timer. It never shows who is where. Each phone (private) shows only ONE thing: a big compass-free arrow + zone name pointing you to *your* currently-assigned fire ("→ KITCHEN"), and a breath meter. When you reach the zone and blow steadily for ~1.5s, that phone reports a douse; the flame shrinks. Fires ignite in different zones simultaneously and each phone is routed to a *different* nearest fire, so the team must fan out physically. If two players pile onto one zone, the server sees redundant douses and the other fires spread — punishing clustering. Zone membership is self-declared: your phone shows the zone list and you tap which zone you're standing in (honesty enforced by the arrow + social pressure), then blow.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { zones[], fires: {zoneId, intensity}[], timer }`, `Player { id, currentZone, assignedFireId, breathLevel }`. Breath detection runs *on-device*: WebAudio `AnalyserNode`, detect the broadband low-frequency energy signature of blowing (sustained RMS spike with strong <500Hz content, distinct from speech) and emit a boolean `blowing` at ~10Hz. Phone sends `{zone, blowing}`; server integrates douse credit only when `player.currentZone === fire.zone`. Server ticks fire spread at 5Hz and broadcasts aggregate state to the host; phones only get their private assignment. Hard part: reliable, false-positive-resistant blow detection across cheap phone mics and a noisy shouting room — needs a 2s per-phone calibration (ambient sample + one practice blow) and hysteresis so laughter/talking doesn't count.

## v1 scope
- 3 players, ONE round, 60 seconds.
- 4 hard-coded zones, max 3 simultaneous fires.
- Blow = boolean after calibration; 1.5s sustained = douse.
- Win = all fires out before timer; lose = any zone fully engulfed.

## Out of scope
- Auto room-mapping, custom zone names, drafts/wind, competitive mode, score history, more than one round.

## Risks & unknowns
- Blow detection vs. a loud room is the whole game; if calibration fails it's unplayable.
- iOS gates mic behind a user gesture over HTTPS — must prompt on join.
- Self-declared zones could be gamed; fine for a co-op party v1.

## Done means
Three phones join, calibrate, and in one 60s round two players standing in different corners each blow out their own assigned flame while a third is redirected to a new fire — and the host screen shows all fires extinguished, with a single passed-around phone provably unable to cover two simultaneous zones.

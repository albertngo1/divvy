## Overview
Richter is a cooperative sensor game for 3 seismograph players plus one Tapper (and a host screen). It shrinks the usual "room as board" down to a single shared TABLE, and turns the surface itself into the medium: knocks travel through the wood and every phone feels them differently. It's for groups who love Spaceteam-style "only I can read my own instrument" coordination.

## Problem
Sensor party games lean almost entirely on compass and mic. The accelerometer's ability to feel a physical impulse conducted through a shared surface is basically untapped. And most room-as-board games use the whole floor; Richter proves the fun at table scale, where the board is a diagram everyone can see but the readings are stubbornly private.

## How it works
Three phones are placed flat, each at a labeled edge/corner of a table. The host TV shows a 3×3 grid overlaid on a top-down table diagram with the three phone positions marked. A fourth player, the Tapper, is privately shown ONE target cell on their own phone, then knocks the table once at that spot.

Each corner phone's accelerometer captures the impulse. PRIVATELY, each seismograph phone shows only its own little rolling trace plus a numeric "felt strength" bar for the last knock — nothing about the other two. The three players cannot show each other their screens; they must call out strengths verbally, argue about where it landed, and drop ONE shared marker on the TV grid. Reveal: the Tapper's true cell. Score = grid distance (bullseye / adjacent / miss).

Private vs shared: phone = own trace + own strength; TV = table map, phone positions, the placed guess, and after reveal the truth plus a heatmap of the strength trio.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket (PartyKit / Durable Object over Tailscale Serve). DeviceMotion `accelerationIncludingGravity` sampled ~60Hz; detect an impulse by high-passing then peak-picking |jerk| above threshold; report `{peakMag, tPeak}`. Server groups reports arriving within a ~120ms window into one knock event, normalizes each phone via a startup calibration tap (each phone taps itself once to set gain), then multilaterates: three known positions + relative amplitudes (amplitude falls off with distance) → maximum-likelihood cell shown as a hint heatmap, not the answer.

Data model: `Room{ phones:[{id,pos,gain}], grid, tapper, round:{event, guessCell, targetCell} }`. Sync: phones stream peaks, server dedupes into events and broadcasts the strength trio; the guess is a shared cursor.

Genuinely hard part: (1) associating the SAME knock across phones without a shared clock — use amplitude coincidence + a loose time window, never absolute timestamps; (2) calibrating amplitude across wildly different phone/table couplings; (3) rejecting spurious taps and phone-lift jolts.

## v1 scope
- 3 array phones + 1 Tapper
- One table, one 3×3 grid
- ONE knock, ONE group guess, a distance readout
- Calibration = each phone taps itself once

## Out of scope
- Finer grids, Morse/multi-knock messages
- Competitive scoring, rounds loop, leaderboards
- Phones held in hand (must lie flat), >4 players
- True absolute-clock TDOA

## Risks & unknowns
Coupling varies enormously by surface (glass vs wood vs tablecloth); soft tables may swallow the impulse. iOS needs a user gesture + permission for DeviceMotion. Bumps create false peaks. Mitigate with per-phone calibration and a forgiving grid.

## Done means
With 3 phones on a wooden table, a knock at a known cell is localized by the group to the correct or an adjacent cell in ≥70% of 10 test knocks, using only each player's private strength readout.

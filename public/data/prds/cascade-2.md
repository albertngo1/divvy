## Overview
A 3-5 player rhythmic relay where a clap physically travels around the room along a hidden route. Each phone is a private link in a chain that no single player can see whole. The host TV is the crowd meter and referee; the room's acoustics are the wire. For groups who liked percussive coordination bits (Clave, Baton) but want the *routing* to be secret.

## Problem
Mic-level party games use loudness as a distance proxy or a volume gate — but almost none use a **clap onset as a signal to route between specific people**. And a clap relay only works if each player knows just their own successor: if one phone showed the whole order, you'd pass it around and the tension evaporates. The privacy is the game.

## How it works
The host builds a random Hamiltonian loop through the players. Each phone privately shows ONE thing: 'clap when you hear #2' (i.e., it's told the position it follows) — never the full order, never who #2 is by name, so you must watch faces and listen. The host TV starts the wave by lighting 'GO' for the hidden #1. That player claps; every phone's mic runs onset detection, but each phone only *reacts* when it detects a clap AND it's that phone's turn in the server's clock. When your predecessor's clap is registered, your phone buzzes 'NOW'; you must clap within a 700ms window. Miss the window, clap early, or clap out of turn and the host meter shows a red break.
PRIVATELY: your predecessor cue + your buzz/now prompt + your own accuracy. HOST: an anonymized ring of dots lighting in sequence as the wave travels, plus the current chain length. Win = the wave completes the full loop back to #1 unbroken.

## Technical approach
Host tab + phone PWAs + authoritative WS server over Tailscale Serve. Sensor: WebAudio `AnalyserNode` RMS + a simple onset detector (rising-edge above adaptive noise floor with refractory lockout). Data model: `order[]` (server-only), `turnPointer`, per-phone `predecessorPos`. Sync: server owns the turn clock; a phone reports 'onset at t' with a local timestamp, server accepts it only if `turnPointer` points at that phone within the window, then advances and unlocks the next phone. The genuinely hard part is **every phone hears every clap** — the server must use turn-gating (only the on-deck phone's onset counts) plus a short global refractory period so one clap can't cascade-trigger the whole chain at once; clock skew between phones is absorbed by the ±350ms window and NTP-style offset calibration at join.

## v1 scope
- 3 players, one loop, one round.
- Onset = single hard clap; fixed 700ms window; no difficulty tuning.
- Host shows 3 dots + a 'chain broke' / 'loop closed!' banner.

## Out of scope
- Distinguishing WHOSE clap by loudness/localization, tempo ramping, multiple laps, scoring streaks.
- More than 5 players, ambient-music robustness.

## Risks & unknowns
- False onsets from laughter/talking; needs a firm threshold and the turn-gate to stay sane.
- Is a 700ms window forgiving enough for phone clock skew? May need widening after a playtest.
- Fun may hinge on players actually not knowing the order — reveal-resistance untested.

## Done means
Three phones in one room complete an unbroken 3-clap loop back to the starter, with the server correctly rejecting every out-of-turn clap, at least 3 times out of 5 attempts.

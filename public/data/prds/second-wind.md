## Overview
A breath-powered cooperative sailing game for 3–4 players. The host TV shows a single top-down boat threading a winding channel; each phone IS one of the boat's sails. You power the boat by literally blowing into your phone. The catch that makes it a Divvy game: your *breath* is fuel, but your *voice* is sabotage—the mic distinguishes the two.

## Problem
Party games are shouty, and 'blow into the mic' toys are single-player novelties. The itch: a genuinely quiet, tense room where people are physically exhaling at their phones and coordinating a shared craft using only their eyes, because the one thing that would help—yelling 'ease off, we're turning!'—is the exact thing that destroys their sail.

## How it works
The host shows the boat, a channel with one turn, a finish harbor, and a shared 'noise floor' alert light. Each phone privately shows: its own sail's position (port / starboard / fore), a live breath meter, and a SECRET gust schedule—only your phone knows the window when your sail catches the next gust (blow inside it = 2× thrust; blow outside = drag/flutter). Boat velocity is the vector sum of all active sails, so turning requires some players to ease off while others power—and nobody can announce their gust timing.

Blowing (unvoiced, broadband) fills your sail. Any voiced sound—talking, laughing, counting off a rhythm—is detected via pitch periodicity and triggers 'LUFF! sail torn,' disabling your sail for 4 seconds. Coordination happens purely through watching the boat drift and reading faces. Win: reach the harbor in time without running aground.

Private (phone): your sail role, your breath RMS, your secret gust windows. Shared (TV): boat, course, collective wake, and a room-wide alert whenever anyone voices.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ boat:{x,y,heading,vel}, sails:{id, side, thrust, torn, gustSchedule[]} }`. Each phone runs WebAudio: RMS for loudness plus a voicing detector (autocorrelation pitch + zero-crossing rate + spectral flatness—breath is spectrally flat / high ZCR, voice is periodic / low ZCR). Phone emits `{breath:0–1, voiced:bool}` at ~15 Hz; server integrates physics at a 30 Hz fixed tick and broadcasts boat state. Server owns gust schedules (phones just render countdowns) so timing is authoritative. The genuinely hard part: separating breath from voice on cheap mics while 4 people blow at once (cross-talk)—handled with near-field thresholds, per-phone classification only, and hysteresis to stop flicker.

## v1 scope
- 3 players, one boat, one channel with a single turn and one gust event
- Blow-to-thrust + voice-tears-sail
- Win / aground outcome only

## Out of scope
- Multiple race legs, upwind tacking, richer wind physics
- Leaderboards, spectator mode, calibration wizard

## Risks & unknowns
Breath/voice classifier false positives; blowing at phones is tiring and a little gross; ambient blow cross-talk; browser auto-gain-control muddies RMS (disable via getUserMedia constraints; add a one-breath calibration).

## Done means
Three phones connect, blowing visibly moves the shared boat on the TV, a spoken word tears the speaker's sail within 500 ms, and a team steers through one turn into the harbor using only breath and glances in a single live playtest.

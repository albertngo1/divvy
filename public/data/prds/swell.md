## Overview
Swell is a 3–4 player cooperative voice game where the group's job is to trace a single shared loudness curve out loud — humming, shouting, "aaah"-ing — while secretly each carrying only part of it. For friends who've done every word game and want their actual voices, not their vocabulary, to be the controller.

## Problem
Every voice party game is about WORDS — say the phrase, guess the word, shout the command. Nobody plays with the sound itself. Swell's itch is the dynamics: a room trying to crescendo and hush on cue with no conductor, blindly handing off who's-loud-now by ear, and the specific comedy of everyone going quiet at the exact wrong moment.

## How it works
- **Host screen (shared):** a target envelope scrolls right-to-left past a "now" line; underneath, the live combined-loudness trace the room is actually producing, and a running match score. Everyone watches the same curve.
- **Each phone (private):** your ASSIGNMENT — which segments of the curve are YOURS to drive. "You lead the opening swell, then rest through the middle, then join the final peak." Segments partition the curve so no single person covers it; the biggest peaks are assigned to two players who must both come in.
- **Each phone's own mic (private):** measures only that player's loudness and scores you against your own segments — loud when you lead, quiet when you rest. Because assignments are private and overlap at peaks, you can't just watch the curve; you have to LISTEN and negotiate handoffs ("you've got this one, I'm out") in the gaps.

## Technical approach
Host tab + phone PWAs + WebSocket server. Each phone runs Web Audio `getByteFrequencyData`/RMS, computes a ~20Hz loudness envelope, and streams it up; the server sums envelopes into the combined trace and scores each phone against its private segment map. Sync tolerance is loose (~200ms) because envelopes are smooth, not transient. The genuinely hard part is mic isolation and calibration: phones and rooms vary wildly, and every mic hears the whole loud room, not just its owner. Mitigate with a per-phone noise-floor calibration at round start, score on relative delta above that floor rather than absolute dB, and gate on the player's own speech band.

## v1 scope
- 3 players, one 20-second curve, 3–4 segments (one shared peak), a single round.
- Start-of-round calibration; live combined trace; per-phone private segment scoring; end score.

## Out of scope
- Pitch/harmony matching, any words or lyrics, multi-round matches, leaderboards, more than 4 players.

## Risks & unknowns
- Mic bleed is the core risk — can a phone credit its owner and not the neighbor shouting beside them? If not, the private scoring is fake and the game dies.
- Room/phone calibration variance; whether scoring feels fair or arbitrary.
- Whether a room will actually vocalize uninhibited (social friction).

## Done means
3 phones calibrate their noise floor; the host renders a scrolling target curve; each phone scores its own loudness against its private segments in real time; the summed live trace draws under the target; and an end screen shows how closely the room traced the curve.

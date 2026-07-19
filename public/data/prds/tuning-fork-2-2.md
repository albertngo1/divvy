## Overview
Tuning Fork is a 3–4 player cooperative audio game for phones + a shared TV. The group has to sing/hum a single sustained chord in tune — but no phone shows the chord. Each phone only knows its own job, so the players must listen to each other and tune by ear in real time.

## Problem
The itch: barbershop / a-cappella 'lock the chord' magic, minus the years of practice. Every karaoke-ish game rewards volume or copying a melody; almost none reward *listening to the person next to you and adjusting.* A single passed-around phone can't do this — each singer needs their own private target and their own private meter, live, simultaneously.

## How it works
At round start the server picks a chord (e.g. C major) and assigns roles:
- **The Fork (PRIVATE):** one phone shows 'You are the ROOT — hum and hold this pitch' with a reference tone it can play once. This player anchors everyone.
- **Everyone else (PRIVATE):** each phone shows only an interval instruction relative to the root — 'a FIFTH above the root', 'a THIRD above' — never the absolute note. It shows a private tuning needle: flat ◀ | ▶ sharp, fed by that phone's OWN mic.
- **Host screen (SHARED):** a live stacked bar of the chord forming — one lane per player, each lane green when that player is in tune — plus a big 'LOCK' meter that fills only while ALL lanes are simultaneously green.

So the Fork drones the root aloud; each other player must find their interval *by ear* against what they hear in the room, hum it, and watch their private needle center. The catch: as one person drifts, others chase them, so the room audibly beats and wobbles until everyone locks together for ~2 seconds. Win = LOCK meter fills before the timer.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Pitch detection runs ON EACH PHONE via Web Audio (autocorrelation / YIN over the mic stream), so raw audio never leaves the device — each client computes its own fundamental frequency, compares to `root * intervalRatio`, and sends up only `{cents_off, inTune}` at ~10Hz. Data model: `Room{ rootHz, roles{phone:intervalRatio}, lanes{phone:{cents,green}}, lockProgress }`. Server ANDs the green flags and advances lockProgress. Genuinely hard part: on-device pitch tracking that's fast AND robust to room bleed — each phone will hear everyone, so it must lock to the loudest/nearest voice, needing gating (only score above an amplitude threshold) and smoothing to avoid needle jitter; mic calibration per phone is the real risk.

## v1 scope
- 3 players, ONE fixed chord (root + third + fifth), one round.
- Fork gets a reference tone; others get interval text + needle.
- Hum-only (sustained), ~2s simultaneous lock to win, 60s timer.

## Out of scope
- 4+ players / richer chords, chord progressions, key changes.
- Scoring beyond win/lose, difficulty levels, note-name display.
- Server-side audio; all pitch detection stays on-device.

## Risks & unknowns
- Non-singers may find intervals genuinely hard — may need a 'match the octave' easy mode.
- Room bleed could make a phone credit the wrong voice; gating unproven.
- Phone mic latency/pitch-tracker accuracy varies wildly across devices.

## Done means
Three phones join, the Fork hears its reference and drones, the other two see only interval text with a live private needle from their own mic, the host shows three lanes turning green independently, and a real trio holds a locked in-tune chord long enough to fill the meter in one playtest.

## Overview

**Keep Alive** is a 3–4 player cooperative real-time scheduling game. Each phone is a station that stays online only while its owner is *actively producing voice*; the channel allows exactly one speaker at a time; and the sum of the room's private quotas exceeds 100% of the clock. Somebody has to be allowed to brown out, and the room has to decide who — using the very airtime it's fighting over.

For groups who want Spaceteam's panic without memorizing any panel. The content of what you say is irrelevant. Only *when* and *how long*.

## Problem

Every voice party game so far treats speech as a carrier for content — phrases, commands, codewords. But the funniest constraint in a loud room is purely structural: airtime is a contended resource and nobody can see anyone else's need. Existing games either budget one-shot utterances or punish talking. Nothing models the continuous, drifting, unfair demand of real turn-taking.

## How it works

One round, 120 seconds.

**Private, on your phone:**
- A single vertical **charge meter**. It fills while you are the room's sole detected speaker and drains constantly. Hit zero and your station goes DARK.
- A **drain rate** that you alone can see, and that *drifts* mid-round — you might start needing 20% of the clock and be needing 55% by second 80.
- A live warning band: `12s TO DARK`.

Nothing tells anyone else what you need. To get airtime you have to ask for it — which costs the very airtime you're asking for, and blocks whoever is currently charging.

**Shared, on the TV:** four anonymous bars showing only ALIVE / LOW / DARK, a total-uptime counter, and a big red **JAM** flash whenever two or more people voice at once. It never shows drain rates. The room can see *that* someone is dying, not *how fast*.

Rules: exactly one speaker charges. Two or more overlapping voices = JAM — nobody charges and both parties lose 1.5s of charge. Any station going DARK freezes the team counter until it's revived above 20%. Score = seconds with all stations alive.

Because total demand runs ~115% of a single channel's capacity, a perfect schedule doesn't exist. The room must knowingly starve someone for a stretch, and then get them back — an explicit, spoken triage under a clock.

## Technical approach

Host tab + phone PWAs + PartyKit Durable Object over WebSocket.

On each phone: `getUserMedia` → AudioWorklet computing 20ms-frame RMS plus a crude zero-crossing/voicing gate, with a 3-second lobby noise-floor calibration per device. **Raw audio never leaves the phone** — the client emits only `{pid, t, voiced: bool, level: dB}` at 20Hz.

Server state: `Station { pid, charge, drainRate, drainSchedule, dark }`. Every 50ms tick the DO takes the argmax of currently-voiced clients; if exactly one is above its calibrated gate, it charges; if two or more, JAM.

The genuinely hard part is **mic bleed**: four phones on one coffee table all hear the same loud voice. Mitigations — argmax-wins with a 6dB dominance margin, per-device gain normalization from calibration, and a 250ms hysteresis so a speaker keeps the floor through their own pauses. Getting the JAM detector to fire on real overlap and not on a laugh is the make-or-break tuning problem.

## v1 scope

- 3–4 players, one 120-second round, one difficulty curve.
- Charge meter, private drain rate, drift schedule authored by hand (a JSON array of rate changes).
- TV: four anonymous ALIVE/LOW/DARK bars, JAM flash, uptime counter, final score.
- 3-second calibration screen in the lobby.
- No reconnect, no accounts, no round two.

## Out of scope

Speech recognition (never — content is irrelevant), per-player scoring, difficulty selection, headset support, more than four players.

## Risks & unknowns

- Mic bleed may make argmax attribution unreliable enough to feel unfair. Fallback: require the speaker to also hold a push-to-talk pad, which reduces the purity but makes attribution exact.
- Continuously talking for 120s is genuinely tiring and some players will find it unpleasant rather than funny.
- Players may game it by humming quietly forever; a minimum-level floor plus a monotony penalty may be needed.

## Done means

Four phones calibrate, one round runs, exactly one voice at a time charges its own station and only that station, deliberate overlap reliably triggers JAM on the TV, at least one station goes DARK and is verbally rescued, and the final uptime score is reproducible across two consecutive playtests in the same room.

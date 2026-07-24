## Overview
Float is a 3–4 player cooperative concurrent-room game about the economics of silence. The crew banks loot for every second the room stays quiet, but the vault periodically demands a keycode that only one player's phone privately holds — and that player must break silence to log it while everyone else stays mute. It's a tense, mostly-silent negotiation about *whose* turn it is to speak.

## Problem
Most 'stay quiet' games make silence a flat rule. Float makes silence a *currency you're actively earning*, then repeatedly forces exactly one person to spend it — so the drama is in silently coordinating who breaks. Talking to sort it out costs the very resource you're hoarding.

## How it works
- **Host screen (shared):** A vault with a rising LOOT counter (climbs while the room is silent) and a SILENT-ALARM bar. Every ~15s it flashes a DEMAND: "Keycode required." It never says who holds it.
- **Phone (private):** Your live silence-bank streak, and — critically — a private card that lights up only for the one holder: "IT'S YOU. Whisper: 4-7-2." The holder must whisper the code (on-device ASR confirms) to satisfy the demand. Everyone else sees "NOT YOU — stay silent." If the holder whispers in time: big loot bonus, silence resumes. If nobody speaks before the timer: alarm ticks up. If a NON-holder vocalizes (a wrong guess, a laugh): alarm spikes and their bank resets.

The agony: you can't announce you hold it (that would be the whisper itself), and you can't ask others — so the table gestures "is it you?? go!" in frantic silence. Per-phone is load-bearing: only that one holder is privately told they're up, each phone accrues its own bank, and each mic must attribute sound to its owner. No shared device can privately single out one person.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).
**Data model:** `room{loot, alarm, demand:{holderId, code, deadline}}`, per-player `{bankStreak, lastVoicedTs}`.
**Sync:** Each phone streams a per-frame voiced/loudness reading; server runs the accrual tick, spawns demands, assigns holderId randomly, and validates the whispered code via the holder's on-device ASR result.
**Hard part:** Cross-talk attribution. One loud voice bleeds into every mic, so a naive 'any mic hears voice → bust that owner' punishes innocents. Fix: phones report *relative* loudness; the server credits/blames the loudest mic as the true source within a short window, and only busts non-holders whose own mic clearly leads. Tuning that gate in a live room is the real work.

## v1 scope
- 3 players, one round of ~4 demands, single hardcoded 3-digit code per demand.
- Silence accrual + one alarm bar; loudest-mic attribution with a fixed threshold.
- Host vault screen with loot/alarm and demand flashes.

## Out of scope
- Roles, multi-round campaigns, difficulty ramps.
- Multi-word codes or ASR beyond digit recognition.
- Leaderboards / persistence.

## Risks & unknowns
- Cross-talk mis-attribution busting the wrong player kills trust.
- Analysis paralysis if 'who holds it' is unclear — the private card must be unmistakable.
- ASR digit reliability at whisper volume.

## Done means
Three phones. The room banks loot while silent; each demand privately lights exactly one phone, and only that whisper satisfies it. A wrong speaker spikes the alarm and resets their bank, and testers feel the squeeze of not being able to just *say* whose turn it is.

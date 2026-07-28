## Overview

A 3-player cooperative audio game about live-sound monitor mixes: on a real stage, you can't hear yourself — someone else builds your mix and tells you what you sound like. Here, every player must talk continuously for 90 seconds while hitting a moving loudness target they cannot see. Your phone shows only your *neighbor's* readout. The room becomes three simultaneous streams of mandatory babble, and the coordination has to be smuggled inside that babble.

## Problem

Voice party games almost always serialize speech: one talker, everyone else listening. That's a turn-taking game wearing a microphone. The unexplored space is *genuinely simultaneous* speech — where shutting up to listen is itself a failure state, and humans discover how badly they duplex. Spaceteam gets close, but its speech is optional; here it's the carrier signal.

## How it works

Three players sit in a ring, each holding their phone about 20 cm from their mouth. Everyone must **keep talking** — any words, nonsense counts. A voice-activity gap over 400 ms freezes your contribution.

Each player has a **private target band** for vocal loudness (SOFTER / MID / LOUDER), reissued every 12 seconds. You are never shown your own band or your own meter.

**Phone (private):** a single large gauge for the player on your **left** — their current level as a dot, their target band as a lit zone, and a fat arrow reading UP or DOWN. Your job is to say that out loud to them, continuously, as it changes. Your own mic is meanwhile feeding the gauge on the phone to your *right*.

**Host screen (public):** no per-player numbers. Just a single "mix" bar showing how many players are in-band right now, a fill meter for cumulative all-three-in-band time, and the countdown.

**Win:** accumulate 20 seconds of all-three-in-band inside 90 seconds. The texture is that instructing your neighbor *is* your carrier speech — but you have to do it at the loudness *your* neighbor is demanding of you, which is often the opposite.

## Technical approach

Host tab + phone PWAs + an authoritative room object (PartyKit / Durable Object over Tailscale Serve).

Each phone runs Web Audio `AnalyserNode` locally, computes short-window RMS at ~20 Hz, and sends only a smoothed dBFS scalar plus a VAD boolean upstream. No audio ever leaves the device — cheap on bandwidth and privacy-clean.

Server state: `{players: [{id, dbfs, speaking, targetBand, inBand}], ringOrder, chargeMs, deadline}`. The server owns band assignment, in-band evaluation, and the shared charge accumulator, ticking at 20 Hz and broadcasting a diff. Each phone subscribes to exactly one other player's derived state — the ring mapping is enforced server-side so no client can peek at its own.

The hard part is **calibration and bleed**. Three people talking at once means every mic hears all three. We run a 10-second solo calibration per phone at join ("talk normally") to fix a per-device noise floor and personal reference level, and evaluate everything as delta-from-your-own-baseline rather than absolute dBFS. Proximity (phone near mouth) buys 12–15 dB of own-voice dominance. Bands are deliberately wide (±5 dB) so bleed doesn't decide the round.

## v1 scope

- Exactly 3 players. One 90-second round. Fixed ring order by join order.
- Loudness only — no pitch axis.
- Three bands, reissued every 12 s from a fixed script (not random).
- Phone UI: one gauge, one arrow, one "KEEP TALKING" nag when VAD drops.
- Host UI: mix bar, charge meter, timer, win/lose card.
- 10-second calibration step at join. No lobby, no names, no rounds two and three.

## Out of scope

Pitch/timbre targets, 4+ players, per-device EQ, cross-talk suppression, scoring history, any spectator view, reconnect mid-round.

## Risks & unknowns

Mic bleed could make the ring meaningless — if phone A tracks player B's shouting as well as A's own, the gauges go garbage and the game feels arbitrary. This is the make-or-break test and needs a live 3-person trial before anything else is built. Second risk: mandatory continuous talking may exhaust people in 40 seconds rather than delight them. Third: iOS PWA microphone permission and background audio behavior is historically fragile. Fourth: it may turn out that everyone just goes maximally loud and the game degenerates — hence a SOFTER band that penalizes exactly that.

## Done means

Three people hold all-three-in-band for a continuous 5 seconds at least once, and afterward can each state what their neighbor was yelling at them. If any player successfully hit their target without a teammate telling them anything, the mic isolation is wrong and v1 is not done.

## Overview

A 3–4 player concurrent-room game where the shared screen is a single-slot register. Whatever was said most recently in the room overwrites it. A word only scores if it survives four uninterrupted seconds — so the game is a public silence auction where the prize is privately valued. For groups who like tense, non-verbal standoffs more than shouting matches.

## Problem

Silence games usually treat quiet as a scored resource (a budget, a meter, a fine). That makes silence *arithmetic*. Nobody has to decide, second by second, whether this particular silence is worth it. The itch: make silence a **choice with hidden stakes**, where holding your tongue might be handing a rival a point and you cannot tell.

## How it works

Host screen (public): one line of huge type — the REGISTER — showing the last recognized utterance, plus a 4.0s hold bar draining beside it. Nothing else. No names, no scores mid-round.

Phone (private): your three TARGET WORDS, your BREATH counter (5 utterances for the whole round), and a small pulse that lights *only if the register currently holds one of your words*. That pulse is the whole game: everyone watches the same word, and only its owners know it is live.

Round loop (90 seconds):
1. Any speech above the room's calibrated floor stops the hold bar and rewrites the register with the recognized phrase (last 1–4 words), costing the speaker one Breath.
2. If a word holds a full 4.0s, every player whose list contains it scores 1 — silently. The register clears to EMPTY (EMPTY never scores).
3. The server plants one word on two players' lists and one word on nobody's, so a hold is sometimes charity and sometimes theatre.

The strategy that emerges: get your word up, then survive. You cannot ask for silence — asking overwrites you. Players negotiate with eyebrows, held-up fingers, and the visible Breath tension of running out.

## Technical approach

Host tab runs the Web Speech API for recognition and owns the authoritative clock. Phone PWAs run an AudioWorklet computing 50 Hz A-weighted RMS plus a zero-crossing voicing gate; they stream only `{t, dbfs, voiced}` over WebSocket to a PartyKit room (or Socket.IO behind Tailscale Serve).

Data model: `Room{registerText, registerOwnerIds[], holdStartedAt, phase}`, `Player{id, targets[3], breaths, score}`. Server is authoritative for hold timing; clients render an interpolated bar from `holdStartedAt` and server time offset (measured with a three-sample ping/pong).

Hard part: **attributing the overwrite to a speaker**. Host ASR gives the text; phone envelopes give the owner. The server picks the phone whose voiced RMS exceeds the runner-up by ≥6 dB in the 250 ms window around speech onset, with 400 ms hysteresis to stop laughter and cross-talk from ping-ponging attribution. Ambiguous windows charge no Breath but still clobber the register — clobbering is unconditional, which keeps the punishment honest even when attribution fails.

## v1 scope

- 3 players, one 90-second round, one register.
- 3 target words each, drawn from a 40-word concrete-noun list; one deliberate overlap.
- 5 Breaths each; Breath cost applies only on confident attribution.
- Fixed 4.0s hold, fixed dB floor from a 5-second room calibration.
- Scores revealed once, at the end.

## Out of scope

Multi-round play, custom word packs, whisper detection, mobile ASR, spectator view, any scoreboard visible during the round.

## Risks & unknowns

Web Speech API latency (~300–800 ms) may make the register feel laggy; mitigation is to clear the register instantly on voice onset and fill the text when recognition lands. ASR may mangle target words — v1 accepts fuzzy matching at Levenshtein ≤2. The overlap word might make the game feel arbitrary rather than tense.

## Done means

Three phones join by QR, calibrate, and play 90 seconds; at least one word holds a full 4 seconds and scores exactly the right players; the overlap word scores two people who both stayed quiet without knowing why the other did; and at least one player is visibly out of Breaths and unable to stop a rival's hold.

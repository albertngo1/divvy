## Overview
Earshot is a 3-4 player cooperative voice game where the coordination axis is *volume and proximity*, not timing. It uses a host laptop placed in the CENTER of the table — its microphone is "the bug" — plus a phone per player. You pass secret words to your neighbor by murmuring them close, keeping the bug from hearing.

## Problem
Every voice party game in this lineage punishes overlap by *timing* — collisions, windows, unison. None make loudness itself the play. The untapped itch is physical and cinematic: leaning in to breathe a secret to one person while a device in the middle strains to overhear. Earshot turns whisper-vs-eavesdropper into the whole mechanic.

## How it works
The **host screen** shows a live EAVESDROP meter (the bug's real-time loudness) with an alarm line, plus the round target. Each round the server names a SENDER and an adjacent RECEIVER.

**Phones show privately**: the sender's phone displays a SECRET WORD; the receiver's phone displays four look-alike options (or a text box) and instructs them to hold the phone to their ear. The sender must speak the word so the *receiver's* phone mic — held close — captures it, while keeping the *bug's* meter below the alarm line. So you lean in and murmur. But leaning in also brings you nearer the bug: that's the tension. The receiver taps what they heard. Correct guess with the bug never alarmed = success.

The elegant part: the game never transcribes the whispered audio. The word lives only on the sender's phone; the *only* channel to the receiver is literal air. A correct tap proves the whisper carried — and that it stayed quiet enough.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Phones and the host stream mic RMS *levels* (never raw audio) at ~20Hz. Data model: `room{phase, senderId, receiverId, word, bugRms, bugBaseline}`, `player{role, guess}`. During a live transfer window, if `bugRms - bugBaseline` crosses the alarm delta, the server flags the transfer failed.

The hard part is amplitude calibration: RMS is relative and phone-mic-dependent. A quiet-room baseline is captured before each round; the alarm is a delta over baseline, not an absolute. Geometry matters too — the bug is central, pairs are at the edges — so a firm, close murmur to a neighbor's phone can stay under the central threshold. Per-device gain differences are the biggest unknown.

## v1 scope
- 3 players, a single sender→receiver transfer
- 6-word deck of confusable words
- Bug alarm trips = fail; correct receiver guess with no alarm = win
- One pair at a time, no simultaneity

## Out of scope
- Multiple simultaneous pairs across the table
- Scoring, multi-round matches, a human eavesdropper role

## Risks & unknowns
- Mic amplitude calibration across phone models
- Whether the bug threshold feels fair vs. fiddly
- Room noise floor; mic-permission friction on PWAs

## Done means
Three phones plus a central host bug: the sender whispers a word, the receiver correctly identifies it, and the host EAVESDROP meter reflects real loudness — visibly tripping the alarm when someone speaks above a murmur.

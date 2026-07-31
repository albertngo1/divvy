## Overview

Sore Subject is a 3–5 player conversation game for a TV plus phones. The room has a public agenda to cover in five minutes, so it must talk. Privately, each player has been dealt a Sore Subject and bleeds points, invisibly, whenever the room's live transcript drifts toward it. Speech is metered and hazardous; silence is safe and loses.

## Problem

Most "be quiet" party games make noise itself the failure, which is a one-note joke that ends in a staring contest. Here silence is genuinely tempting *and* genuinely fatal, because the agenda clock punishes the whole room. Every sentence you say is simultaneously progress, a tax bill, and a steering input away from a landmine only you can see.

## How it works

**Host screen (public):** an agenda of 3 topic cards the room must collectively cover, a coverage meter per topic, the clock, one word-count bar per player (volume only, never content), and a full-screen klaxon whenever someone buys a Gag.

**Each phone (private):** your Sore Subject as a single phrase ("money", "childhood", "the ocean"); a live Heat dial, 0–100, for *your* subject only; your point bank draining in real time as a function of heat; a Gag button (costs 15 points, imposes 10 seconds of enforced room silence, triple tax on anyone who speaks); and at the end, one accusation naming another player's subject.

Economy: −1 point per 10 words you personally spoke, continuous bleed scaled by your own heat, +bonus for a correct accusation, −penalty for being correctly named. So you talk to steer the room off your own topic and onto the agenda — but steering too obviously, or panic-buying a Gag while your dial is pinned, is the tell that gets you named.

## Technical approach

The host tab runs continuous Web Speech recognition and streams interim/final segments to a Durable Object. Phones stream RMS envelopes only. The server attributes each transcript segment to the argmax-energy phone across the segment window, with a 300ms slop; anything ambiguous is marked *unattributed* rather than guessed, because a wrong tax is worse than a missed one.

Heat in v1 is lexicon-based: each subject has ~40 stemmed terms; heat is an exponentially-decayed hit rate over a 25-second window. Heat and subject IDs are pushed *only* down the owner's socket and never appear in any broadcast payload — one sloppy fan-out kills the entire game.

Hard parts: overlapping speech wrecks ASR, and browser recognition silently dies about every 60 seconds, so a watchdog must restart and stitch across 1–2s gaps without double-counting words.

## v1 scope

- 3 players, one 5-minute conversation, one agenda of 3 topics
- 4 hand-authored subjects with lexicons
- Heat dial, word tax, one Gag per player, one end-of-game accusation
- English only; host laptop mic for transcript, phone mics for attribution only

## Out of scope

Embedding-based heat, multiple rounds, phone-as-host, non-English, transcript replay, anti-whisper enforcement, more than 5 players.

## Risks & unknowns

Living-room ASR accuracy is the whole foundation and may simply be too poor. Lexicon heat can feel arbitrary and therefore unfair. Misattributed taxes breed table arguments. Players may discover that stalling until the agenda fails is cheap — the room-wide loss has to bite hard enough to prevent it.

## Done means

Three phones, one laptop, five minutes. Attribution matches a human observer on ≥80% of segments in a 3-person test. Saying a subject's term makes exactly one phone's dial spike within 3 seconds while no other phone reacts. A silent room loses the agenda. And in playtest, at least one Gag purchase is correctly read as a tell.

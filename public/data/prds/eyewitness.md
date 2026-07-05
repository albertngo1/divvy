## Overview
A hidden-asymmetry eyewitness game for 4–6 friends around one TV. Each player's phone privately flashes a detailed 'crime scene' illustration for a few seconds; exactly one phone showed a variant with small edits. Then everyone answers recall questions blind, and the room hunts the witness whose memory quietly doesn't match. For groups who like Werewolf/Spyfall but are tired of pure verbal bluffing.

## Problem
Social-deduction games almost always assign roles openly — *you* know you're the wolf, so the game is about hiding a secret you possess. The itch: what if even you don't know you're the unreliable one? Nothing weaponizes genuine memory plus self-doubt. And most Jackbox deduction is bluffing about nothing real; here the evidence is your own honest answers.

## How it works
Lobby, then an 8–10s 'observation' window: each phone shows a richly detailed scene. Crew phones show the canonical scene; one randomly chosen **Odd Witness** phone shows a variant with ~4 small edits (car color, number of bystanders, a sign's text, an object present/absent). No one is told their role. The image vanishes. The host screen shows only a blurred/redacted evidence board. The host asks 3 multiple-choice recall questions ('What color was the getaway car?'); every phone answers **privately and simultaneously**, locked, no peeking. The host screen then reveals the anonymized answer distribution per question ('3 said blue, 1 said red') — never names. After 3 questions, players discuss, then each privately votes on the Odd Witness. Reveal + scoring.

Private per phone: your own scene image, your answer entry. Shared host screen: redacted evidence board, anonymized histograms, discussion timer, vote tally.

## Technical approach
Host browser tab + phone PWA clients + authoritative WS server (PartyKit / Durable Object room, or Socket.IO over Tailscale Serve). Data model: `Room{code, phase, players[], canonicalSceneId, variantSceneId, oddPlayerId, questions[], answers{playerId->{q->choice}}, votes}`. Scenes are pre-authored asset pairs (canonical + variant) with a question bank keyed to the diffs. Sync: server pushes phase transitions and each player's privately-scoped image assignment; answers are collected server-side and only **aggregated histograms** are broadcast — raw per-player answers never leave the server until reveal. That privacy is the genuinely careful part: a leak of who-answered-what kills the deduction. Timers are authoritative on the server; phones render countdowns from server timestamps. Images preload during lobby so the observation window can't stall on a slow phone.

## v1 scope
- 1 hardcoded scene pair (canonical + variant)
- 3 fixed recall questions, 4 players, one Odd Witness
- Single round, anonymized histograms, one vote, win/lose screen

## Out of scope
- Multiple rounds / cross-round scoring
- 'Imposter knows' mode, generated scenes, 6+ players
- 'No odd witness this round' bluffs, colorblind-safe diff sets

## Risks & unknowns
Diffs must be memorable enough to cause divergence yet deniable enough to argue about; genuine crew misremembering is the intended noise but could make it unwinnable. Color-only diffs are unfair to colorblind players. Observation-timing fairness across phones needs tuning.

## Done means
Four phones each load a scene (one variant), answer 3 questions blind, the host shows correct anonymized histograms, the room votes, and the Odd Witness is revealed — validated by at least one playtest where the vote was genuinely uncertain.

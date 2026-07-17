## Overview
A phone-native riff on *Blank Slate*, for 3-6 friends. Everyone privately fills in the same blank; the sweet spot is matching **exactly one** other player — not zero, not the whole room. It's a game of second-guessing how weird or how obvious to be.

## Problem
Most "write a secret word" party games reward either total consensus (*Herd Mentality*) or total uniqueness (*Just One*). Nobody has phone-ified the *Blank Slate* Goldilocks lever — the specific social-calibration thrill of aiming for one and only one kindred mind. And on cardboard it needs a scorekeeper, hidden pads, and honor-system reveals.

## How it works
1. **Prompt.** Host TV shows a card with one blank, e.g. "WET ____" or "____ MACHINE."
2. **Private write (simultaneous).** Each phone shows a text field. You privately type one word to fill the blank. Nobody sees anyone else's field — this is the whole game; a word everyone could see would be trivially matched.
3. **Private call (the twist).** Before locking in, each phone also privately picks, from the player list, *who you think you'll twin with*. Hidden.
4. **Lock & reveal.** When all are in, the host TV animates every answer flying into clusters by exact match.
   - A word held by **exactly two** players → both score 3.
   - A word held by **one** player (lonely) or **three+** (mob) → 0.
   - Correctly predicting your twin → +2 bonus (only pays out if you actually twinned).
5. One round, one prompt, scores tallied on the TV. Done in ninety seconds.

Private per phone: your fill-in word **and** your twin prediction. Public on host: only the post-lock clustered reveal.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve).

**Data model:** `Room { prompt, phase, players: Map<id,{name}> }`; `Submission { playerId, rawWord, normWord, predictId, locked }`. Server holds all submissions; broadcasts only aggregate cluster data at reveal.

**Sync:** trivial fan-in — phones POST word+prediction, server gates on all-locked, computes clusters, emits one reveal payload. No tight real-time loop.

**Genuinely hard part:** *fair adjudication of a match.* "dog"/"dogs"/"Dog" should twin; "canine" should not. v1 normalizes case + trim + trailing-s/es plural stem, and shows the normalized form on reveal so the table can eyeball-appeal. Getting this feeling fair — not too loose, not too strict — is the real design risk, not networking.

## v1 scope
- 3-6 players, one prompt, one round.
- Text-only fill-in; case/whitespace/simple-plural normalization.
- Exact-cluster scoring + twin-prediction bonus.
- Host reveal animation + final score list.

## Out of scope
- Multi-round match sets, running leaderboards.
- Synonym/semantic matching, profanity filter.
- Custom prompt authoring; spectator mode.

## Risks & unknowns
- Normalization fairness (see hard part) — may need a one-tap "count these as same" host override.
- With 3 players the "exactly one" band is easy; tuning may want 4+ as the real floor.
- Prediction bonus could dominate — may need weighting.

## Done means
Five phones join a room, all privately submit a word + a twin guess, lock in, and the host TV correctly clusters answers, awards 3 to every exact-pair, 0 to lonely/mob words, and pays the +2 only to players who correctly named a real twin — with no phone ever able to see another's word before reveal.

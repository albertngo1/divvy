## Overview
A cooperative concurrent-room party game for 3+ players. Each player taps a short rhythm on their phone in response to a shared prompt. The room wins only when everyone, independently and without hearing each other, taps the *same rhythmic pattern*. It's for groups who like the reveal-and-groan of realizing they were all thinking of "shave-and-a-haircut" — or that they very much weren't.

## Problem
Convergence party games mine space (lasso a cluster), color (match a hue), and a single moment in time (snap the beat). But the most primal thing humans synchronize on — a *temporal pattern*, a clap, a chant, a knock — is untapped. Rhythm is a Schelling point with structure. The catch: you can't clap in unison here. You have to guess the whole shape blind, in silence.

## How it works
The host TV shows one evocative prompt card: e.g. "the knock that means *it's me*," "a rhythm for HURRY UP," "how you'd tap to say NO." Each phone shows a big drum pad and a RECORD state. The player taps 3–8 beats at any tempo they like; the phone privately captures the onset timestamps and lets them re-record freely before locking.

No metronome. No playback of anyone else. The host screen shows ONLY a lock counter (2/3) and a generic abstract pulse — never a single actual beat.

On all-lock, the server normalizes each rhythm and compares them. Reveal: the host plays each rhythm back as a light-and-click on one shared timeline, then overlays all three. Win if every rhythm matches within tolerance.

**Private (phone):** the drum pad and *your own* recorded taps. **Shared (host):** lock count + pulse; the real rhythms appear only after everyone locks. Passing one phone around collapses the game — you'd hear the taps and copy them. Simultaneous, silent, private capture is the entire point.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects). Data model: `room {promptId, phase, players:{id, taps:[t0..tn] relative ms, locked}}`. Phones timestamp with `performance.now()` relative to the *first* tap — so cross-device clock offset and absolute tempo are both irrelevant; we normalize per player. That sidesteps the usual hard sync problem.

The genuinely hard part is rhythm similarity that is tempo-invariant but structure-sensitive. Normalize each rhythm by dividing inter-onset intervals by total duration → a ratio vector. Require equal onset count, then score with normalized Euclidean/edit distance over the IOI ratios, with a tolerance tuned so "shave-and-a-haircut" clearly separates from a flat 4-count. Differing onset counts = crisp automatic mismatch (with an optional ±1 aligned-match rule).

## v1 scope
- 3 players, one prompt, one round
- Tap → lock → normalize → reveal → win/lose
- Single hardcoded tolerance
- One deck of ~10 prompts
- Strong haptics on each tap

## Out of scope
- Accent/velocity or dynamics
- Tempo scoring, best-of-N, difficulty tiers
- Spectators, sound-design polish, prompt authoring

## Risks & unknowns
- Onset-count as a hard gate may frustrate (one extra tap = fail); may need ±1 alignment.
- Tolerance too strict feels impossible; too loose feels meaningless.
- Silent tapping might feel dead without excellent haptics.
- "Same rhythm" is subjective — prompts must strongly imply one canonical beat.

## Done means
Three phones on one prompt: when all three tap "shave-and-a-haircut," the room wins and the timeline shows aligned onsets; when one taps a different count or pattern, it loses. No rhythm data appears on the host before all three lock.

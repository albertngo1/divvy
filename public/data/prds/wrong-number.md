## Overview

Wrong Number is a silent 3-player convergence game for a TV plus three phones. The room must all dial the *same* 7-digit number — but no such number is given to anyone. Each player has a private, differently-scrambled keypad, so the only shared reference is where digits appear on the host screen, not where they appear under your thumb.

## Problem

Most "match each other" games collapse into copying screen position: three people all tap the top-left thing and win by accident. The itch is a matching game where positional mimicry is *actively punished*, so players are forced to converge on abstract content — and where the only feedback channel is a deliberately lossy public aggregate.

## How it works

The host TV shows a rotary-era switchboard with 7 empty slots and a strip of ten digit glyphs, each rendered in a distinct hand-drawn style (a scratchy 4, a fat 7). That styling is the shared vocabulary.

Each phone privately shows: a 3x4 keypad whose ten glyph tiles are in a **per-player random permutation**, and the 7 slots being filled. You tap glyphs to fill your slots. Nobody speaks. Nobody sees another phone.

After each of 7 slot-commits, the host reveals — for that slot only — an **anonymous agreement badge**: SOLID (all three matched), CRACKED (two matched), or SPLIT (all different). It never says *which* digit, never says who. On SPLIT or CRACKED the slot stays open and everyone re-picks it; the badge history is the only breadcrumb trail. Because keypads differ, the natural silent heuristic — "the leftmost one" — desynchronizes instantly, and players fall back on shared salience: the weirdest-looking glyph, then the second-weirdest.

Win: all 7 slots go SOLID. The host dials the number aloud with real DTMF tones and the line connects; on failure it plays the disconnected-number triple-tone.

## Technical approach

PartyKit Durable Object per room. Data model: `Room { code, phase, slotIndex, glyphSet[10], seatPerms: {seatId: number[10]}, picks: {seatId: (0..9|null)[7]}, badges: ('solid'|'cracked'|'split'|null)[7] }`. Seat permutations are generated server-side and each seat is sent *only its own* perm — a leaked perm trivially breaks the game, so this is the one true secret.

Sync: phones send `{slot, glyphId}`; server holds picks opaque until all three seats have committed the current slot, then computes the badge and broadcasts *only* the badge plus updated slot state. No pick value ever leaves the server toward another client. Host is a pure subscriber.

Genuinely hard part: the aggregate must be maximally informative about *progress* and near-zero about *content*. CRACKED leaks that a 2-of-3 cluster exists but not which — verify by simulation that a rational player can't deduce the pair's digit from badge history alone across 7 slots.

## v1 scope

- Exactly 3 players, one room, one 7-slot number.
- One hard-coded set of 10 styled glyphs (static SVG).
- Per-seat keypad permutation, unlimited re-picks per slot, no timer.
- Three badge states, one win screen, one DTMF payoff.

## Out of scope

- Scoring, rounds, more than 3 players, reconnect, timers, spectators, any chat or emoji channel, difficulty tuning.

## Risks & unknowns

- Glyph salience may be too uniform (no convergence attractor) or too skewed (trivial). Needs art iteration more than code.
- CRACKED may be demoralizing rather than informative.
- Players may find a legal-but-boring convention ("always the ugliest remaining") that wins in 7 straight solids.

## Done means

Three phones join via room code, each receives a provably different keypad permutation, the room completes a 7-slot number with badges appearing only after all three commit, no pick value is ever present in any client payload other than its own author's, and the win triggers audible DTMF on the host.

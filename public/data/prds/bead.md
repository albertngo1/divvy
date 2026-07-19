## Overview
Bead is a 4-player physical stealth game where every phone is a private compass-driven crosshair. At the start each player is secretly assigned one other player as their *mark*, forming a directed cycle (A→B→C→D→A). You win the round by holding your phone aimed at your mark for a cumulative 8 seconds — while the person hunting *you* tries to do the same, unseen. It's for a living room full of people who like slow, silent, paranoid movement games.

## Problem
Compass party games so far have been about claiming empty sectors or aiming at fixed room features. Nobody has made the *target itself a moving human who is also secretly aiming back at you*. The itch: the delicious paranoia of a secret-assassin geometry problem you solve with your whole body.

## How it works
Calibration: everyone points their phone at the TV and taps to zero their heading (handles per-device compass offset). The host TV shows only a ring of 4 anonymized dots and a central tension meter — never who aims at whom.

Each phone PRIVATELY shows: (1) your mark's name, (2) a single "aim heat" bar that glows hotter as your compass heading points closer to where your mark currently stands (the server knows rough bearings from a one-time positional setup + live heading deltas), (3) a red pulse when *your* hunter's heat crosses lock threshold — your only warning you're being aimed at. It never shows your hunter's identity or your mark's live heat to anyone else.

Because your mark moves and rotates, you must physically pivot and reposition to keep heat high, which changes *your* bearing for whoever hunts you. Everyone drifts around the room in a silent slow dance. First to bank 8 aimed-seconds wins; the shared TV meter climbs as anyone nears a lock, so the room feels the pressure without knowing the source.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: per-player `{heading, roomAngle, markId, hunterId, bankedMs}`. Room bearings bootstrapped in a 15s setup where each player faces each other player once and taps (builds a coarse angular map); thereafter live `deviceorientation` alpha deltas update relative bearings. Server computes each hunter→mark angular error, converts to heat, accrues banked time when error < 12°. The genuinely hard part: relative human bearing from magnetometer alone is noisy and drifts, so we keep it *relative* (heading deltas since the last mutual face-off) and forgive with a wide 12° cone plus a re-calibration tap if a phone flags drift.

## v1 scope
- Exactly 4 players, one directed cycle, one round
- Compass-only (deviceorientation alpha), TV zero + mutual face-off setup
- Single win condition: 8 banked aimed-seconds
- Anonymized 4-dot ring + one tension meter on TV

## Out of scope
- More than 4 players / multiple overlapping cycles
- Tag-outs, eliminations, scoring across rounds
- Absolute indoor positioning

## Risks & unknowns
- Magnetometer drift indoors near metal/electronics; mitigated by relative bearings + re-tap
- Ties when two players lock simultaneously — needs a tiebreak rule
- Small rooms may make everyone's bearings too similar to distinguish

## Done means
Four phones calibrate, each shows a distinct secret mark and a live heat bar, a player physically aiming at their mark for 8 cumulative seconds triggers a win on the TV, and no phone ever reveals another player's hunter or heat.

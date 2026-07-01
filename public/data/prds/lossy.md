## Overview
Lossy is a Wordle-shaped daily audio challenge. Every day, everyone gets the same short music clip presented three ways — A, B, and X — and must decide which of A/B is the transparent (lossless) version and which is the lossy encode X is secretly a copy of. It's a competitive twist on the old hydrogenaudio ABX ritual: a global leaderboard, streaks, and a per-genre "golden ears" rating. For audiophiles, producers, and the merely smug.

## Problem
People argue endlessly about whether they can hear the difference between 128k and lossless, but almost never test themselves rigorously, and never *against each other*. ABX tools exist but are lonely lab instruments. Lossy makes the test a shared daily event with bragging rights.

## How it works
Each day a server picks one clip and one codec/bitrate treatment (FFmpeg 9.1's new AAC encoder at 96/128/192k, or Opus, or MP3). You blind-listen, toggle A/B/X freely, and lock a guess. You get a result plus how you stacked against the global distribution ("only 34% cleared 128k AAC today"). Correct answers raise an Elo-style rating that's tracked per bitrate tier, so the game learns your actual threshold. A streak counter and a shareable spoiler-free result grid (🟩⬛) drive virality.

## Technical approach
SvelteKit + Web Audio API for gapless, sample-accurate A/B/X switching (preload all three into AudioBuffers, swap source nodes on a shared transport clock so switching is instant and phase-aligned). Clips are pre-encoded server-side with FFmpeg into a manifest; **critically, files are served with opaque hashed names and randomized A/B assignment per user** so you can't cheat by inspecting bitrate or filesize — decode server-side to equal-length PCM, then re-encode both candidates to the same lossless container so byte size leaks nothing. Backend is a tiny Postgres + a cron that publishes the day's puzzle; ratings use a Glicko-2 per tier. Licensing is the real constraint: v1 uses Creative Commons / public-domain audio (Free Music Archive, ccMixter). The hard part is making switching truly click-free and untraceable.

## v1 scope
- One daily clip, AAC-only, single 128k tier
- Web Audio ABX widget with instant switching
- Global % correct + personal streak (localStorage, no accounts)
- Shareable emoji result

## Out of scope
- Accounts, per-genre Elo, multiple codecs, mobile app, user-uploaded clips

## Risks & unknowns
Music licensing; browser audio-stack quirks causing audible switch artifacts that leak the answer; whether 128k AAC is even distinguishable to most (may need to push to 96k for a real test).

## Done means
Two people load the same day, hear identical gapless A/B/X, submit guesses, and see a correct/incorrect result plus the running global percentage — with no client-side signal that reveals which file is lossy.

## Overview
Golden Ears is a daily audio challenge that turns endless "can you even hear the difference" forum wars into a scored, competitive game. Each day everyone gets the same blind ABX test — is clip B the lossless original or the compressed one? — and the site ranks players by how reliably they can actually tell. For audiophiles, producers, and skeptics who want receipts instead of vibes.

## Problem
Audio-quality debates (bitrate, codec, cables) are famously untethered from evidence because almost nobody runs a proper blind test — and even when they do, results stay private and unranked. There's endless passive consumption of "golden ear" claims and zero accountability. Golden Ears makes the claim falsifiable and turns it into a leaderboard.

## How it works
Daily puzzle: a 10-second music excerpt presented as A (reference), and you must decide whether X matches A or the hidden compressed twin (classic ABX). You do several trials; your score is statistical confidence you beat chance, not a single guess. Difficulty scales across the week (320k → 192k → 128k → lossy codecs like the new FFmpeg AAC encoder vs. Opus). Global + genre leaderboards; a personal profile shows the exact bitrate threshold where you stop beating coin-flips.

## Technical approach
Static-ish web app; audio via Web Audio API for gapless, level-matched playback (critical — loudness differences leak the answer, so all clips are ReplayGain-normalized). Encodes generated offline with ffmpeg into the target codecs/bitrates; clips are chunked and served so the browser can't trivially inspect file size to cheat. Scoring: binomial test over each player's trials to compute p-value against chance; the "threshold" is the lowest bitrate at which they stay significant. Backend is a thin API (SQLite/Postgres) storing daily results and leaderboards. Hard part is airtight anti-cheat: preventing waveform/size inspection, spectral analysis, and browser-tool sniffing that would let someone see the answer instead of hearing it.

## v1 scope
- One daily ABX puzzle, MP3 320k vs lossless
- Level-matched, gapless Web Audio playback
- Multi-trial binomial scoring with p-value
- Global daily leaderboard
- Personal "your threshold" stat

## Out of scope
- Custom user-uploaded clips
- Codec zoo (Opus/AAC variants) beyond one pair
- Accounts/social; use a daily anonymous streak token
- Native app

## Risks & unknowns
- Anti-cheat vs. spectral/size inspection is genuinely hard in a browser
- Music licensing for the clips (need CC/royalty-free or original tracks)
- Whether the difference is *ever* audible on typical laptop speakers, deflating the hook
- Level-matching bugs would leak answers and destroy credibility

## Done means
A player completes a daily multi-trial ABX, the site computes a correct binomial p-value, ranks them on the global board, and a scripted "cheater" that inspects file sizes or waveforms cannot recover the answer from anything the client exposes.

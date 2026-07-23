## Overview
Cylinder is a 3-5 player collaborative music-box builder for game nights and creative wind-downs. Nobody wins on points; the group leaves with a physical-feeling keepsake — a punch-card strip and a short looping tune they made together, blind.

## Problem
Rhythm party games grade your timing and hand you a scoreboard. You almost never *make a small artifact you keep*. And the delight of blind collaborative music — hearing separate lines you couldn't hear each other write suddenly lock into a melody — is completely untapped on phones.

## How it works
The host TV shows an empty 16-step music-box strip with 8 pitch rows tuned to a single pentatonic scale (so any combination stays consonant). The server privately assigns each phone ONE horizontal lane (one pitch, its own color). On your phone you see only YOUR lane: 16 tappable cells and a mute 'preview just my notes' button. You cannot see or hear anyone else's lane. A ~60s timer runs; the TV shows only 'X/Y lanes locked in,' never the punches.

When all lanes lock, the host 'cranks' the strip left-to-right, playing every lane together for the first time — the reveal. Then everyone downloads the same keepsake: the punch-card rendered as a printable PNG (real 30-note DIY music-box strips could be punched from it) plus a WAV loop.

Private vs shared: phone = your single lane + solo preview; TV = anonymized lock progress during build, full strip only at the crank.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `room { strip: bitmap[16 steps × N lanes], players: {id, lane, locked}, tempo }`. Phones send toggle events; the server owns the bitmap and — crucially — does NOT broadcast other players' bits during build, preserving the surprise. On all-locked it broadcasts the full bitmap. The host uses a WebAudio lookahead scheduler (not per-note timers) to play quantized pentatonic samples at tempo with a crank animation. Hard parts: (1) tight cross-note timing on the host — solved by WebAudio scheduling; (2) making blind lanes still sound musical — solved by constraining to one pentatonic scale + quantized 16 steps so clashes are impossible; (3) iOS audio unlock — the crank is a host user gesture. Keepsake export: canvas → PNG for the strip, OfflineAudioContext → WAV for the loop.

## v1 scope
- 3 players, one 16-step strip, fixed pentatonic, one tempo
- Private per-lane editor + solo preview
- Host crank/reveal playback
- PNG punch-card + WAV loop download

## Out of scope
- Multiple bars / song structure, instrument choice
- Any guessing or scoring phase
- Real physical strip vendor templates
- Polished on-phone full-mix preview

## Risks & unknowns
- Blind lanes could feel rhythmically muddy even if consonant (mitigate with sparse-cell caps).
- Is reveal-delight enough without competition? Relies entirely on the 'oh, that's what we made' moment.
- iOS/Android audio latency variance on the host device.

## Done means
Three phones each punch a private lane; the host cranks and plays the combined melody once; every player downloads the identical PNG punch-card and audio loop.

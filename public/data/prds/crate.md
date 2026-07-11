## Overview
Crate turns your personal music library into a roguelike deckbuilding DJ set. Each run, you draft tracks pulled straight from your files, then play them one at a time; the crowd is your HP and harmonic/tempo mixing rules decide whether energy climbs or bleeds out. For music hoarders and bedroom DJs.

## Problem
Everyone has a huge, dead music library they never explore past the same 40 songs. Meanwhile deckbuilders are addictive precisely because deck synergy matters. Crate makes the synergy *your actual metadata*—so playing well means rediscovering forgotten tracks that mix well together.

## How it works
At run start you're dealt a random hand of tracks from your library (cards show cover art, BPM, musical key, energy). You play a set of ~15 songs. Adjacent transitions are scored by real DJ rules: compatible keys on the **Camelot wheel** (same number, ±1, or relative major/minor) give a combo bonus; a jarring key clash or a >8% tempo jump deals 'dancefloor damage.' Crowd energy is HP; run ends if it hits zero. Between songs you draft one of three new cards (roguelike map of 'venues' escalating in difficulty—a wedding tolerates anything, a warehouse demands relentless energy). Relics = DJ tricks ('key lock: ignore one clash,' 'wheel up: +2 BPM tolerance'). Daily seed shares the same starting crate for leaderboard bragging.

## Technical approach
Desktop app (Tauri or Electron). Point it at a music folder; extract metadata with **taglib** (the trending `taglib/taglib` repo) for tags, plus `aubio`/`essentia` or `keyfinder` to compute BPM and musical key for files that lack them, cached to a local SQLite so analysis runs once. Camelot compatibility is a small lookup table over the 24 keys; energy is derived from loudness (ReplayGain/EBU R128) + BPM. Game state and card logic are plain TypeScript; rendering in HTML canvas or Pixi. Audio preview (optional) plays a 10s snippet on hover. The genuinely hard part is robust key/BPM detection across messy real-world files and making the scoring *feel* like good mixing rather than a spreadsheet.

## v1 scope
- Scan a folder, extract/compute BPM+key+loudness via taglib+aubio, cache to SQLite
- One run: draft hand, play 15 tracks, Camelot+tempo scoring, crowd-energy HP
- 3 venue types + 3 relics
- Daily seeded crate + score share

## Out of scope
- Actual audio mixing/crossfade playback
- Streaming services (Spotify/Apple) libraries
- Multiplayer DJ battles

## Risks & unknowns
- Key/BPM detection accuracy varies wildly; may need manual override
- Tiny libraries make thin decks—require a minimum track count
- 'Fun' balance of the harmonic scoring is unproven; needs playtesting

## Done means
I point Crate at my music folder, it analyzes and caches every track's key/BPM, and I can complete a run where playing two Camelot-compatible songs back-to-back visibly boosts crowd energy and a key clash visibly drains it.

## Overview

Fingerprint of a #1 renders every Billboard Hot 100 chart-topper as a single compact glyph — a small generative mark whose shape encodes the song's key, tempo, dynamic range, brightness (spectral centroid), and valence. Arranged in decade grids and sortable, the wall of glyphs reveals macro-trends at a glance: the slow compression of dynamic range (the "loudness war"), the drift of tempo and brightness across eras. Each glyph is a portrait of one hit; the grid is a portrait of pop music itself.

## How it works

For each #1 song, extract audio features, then map features to visual channels of a deterministic glyph (e.g. angle = key, ring count = tempo bin, spoke length = dynamic range, hue = brightness, saturation/tint = valence). Lay glyphs out in a grid grouped by decade or year. Controls sort by any feature so the eye can trace, say, dynamic range collapsing decade over decade. Hover a glyph for the song title/artist and the raw feature values; click to play a preview if available.

## Technical approach — specific & technical

Stack: static site, Vite + TypeScript, Canvas/SVG for deterministic glyph rendering, D3 for layout and sort transitions.

Data sources by name:
- **Billboard Hot 100** #1 history — scrape the weekly #1 list (title + artist + date reached #1) from Wikipedia's "List of Billboard Hot 100 number ones" pages or a maintained Hot 100 CSV.
- **MusicBrainz** — resolve each (title, artist) to an MBID and recording metadata; use for canonical identity and dedup.
- **Essentia** (the maintained standalone library behind the now-dead AcousticBrainz) — run **Essentia's** feature extractors (`essentia.standard`: `KeyExtractor`, `RhythmExtractor2013` for BPM, loudness/dynamic-complexity, `SpectralCentroidTime` for brightness, and the MusicExtractor high-level models for valence/danceability) on 30-second audio previews.
- Audio previews: fetch legal 30s clips (e.g. iTunes Search API preview URLs, or Deezer preview URLs) keyed by the MusicBrainz identity. AcousticBrainz is shut down (2022), so features must be extracted fresh via Essentia — that's the whole point of self-hosting it.

Pipeline (offline, Python): Hot 100 CSV → MusicBrainz match → fetch preview mp3 → run Essentia MusicExtractor → normalize each feature to [0,1] → store. Glyph is a pure function of the normalized feature vector.

Data model: `songs[{mbid, title, artist, year, key, bpm, dynamic_range, brightness, valence, preview_url}]`. Glyph rendering: `f(feature_vector) → SVG path`, deterministic so it re-renders identically.

Key algorithm: Essentia feature extraction from 30s previews + a hand-tuned feature→glyph encoding that stays legible at small size (the hard part is designing a glyph where five channels remain individually readable in a dense grid — likely 3 strong channels + 2 subtle).

## v1 scope (humiliatingly small)

- One #1 per year (year-end #1), ~65 songs total.
- Essentia features from 30s previews for that subset.
- One glyph design, grid grouped by decade, sort by one feature (dynamic range).
- Precomputed JSON; hover for metadata.

## Out of scope (for now)

- All ~1000+ #1s ever; every weekly chart position.
- Audio playback in v1 (glyph + metadata only).
- Spotify Audio Features API (deprecated for new apps) — use Essentia instead.

## Risks & unknowns

Prior-art verdict: **Exists**. Billboard×audio-feature analyses are saturated and song glyph-fingerprints have already shipped. Kill-or-re-angle applies. Fresh angle to justify building anyway: (1) self-hosted **Essentia** extraction rather than dead AcousticBrainz / deprecated Spotify features — the pipeline itself is now the differentiator since the usual data source vanished; (2) lead hard on the *dynamic-range-collapse* thesis as the single sortable story, not a generic feature dashboard. Risks: preview-clip coverage and matching accuracy across 65 years; older songs may lack clean 30s previews. If the glyph reads as decoration rather than data, the piece fails — validate legibility with 10 glyphs before scaling. Given the Exists verdict, treat this as lowest-priority of the batch.

## Done means

A decade grid of ~65 deterministic glyphs renders in-browser, sortable by dynamic range, each hoverable for song metadata and raw Essentia features, with the dynamic-range-collapse trend legible when sorted — all features extracted via self-hosted Essentia and precomputed.

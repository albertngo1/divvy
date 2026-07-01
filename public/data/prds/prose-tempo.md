## Overview

Prose tempo, read aloud renders every English novel as a 30-second audio waveform — the book read by a text-to-speech voice at a constant words-per-minute, then squeezed to a fixed duration. Displayed as a small-multiples wall from ~1700 to ~2020, the waveforms let you *watch* prose rhythm change: dense Victorian paragraphs read as a solid unbroken block; sparse modern dialogue reads as staccato, clipped, full of white space. Hover any tile and it plays. The rhythm of literary history becomes something you can see and hear at once.

## Problem

The finding — that sentence length and paragraph density collapsed over three centuries — is published and known. What doesn't exist is the *artifact*: an audio-waveform small-multiples wall where the shape of the sound is the shape of the prose, scannable across 300 years, playable on hover. That's the shareable object lit-Bluesky reposts.

## How it works

Each novel → its opening N words → a synthesized reading at fixed WPM → a waveform image. Because WPM is constant, waveform *length* encodes word count and the pattern of peaks/gaps encodes sentence and clause rhythm (pauses at periods, commas). Normalize every clip to 30 seconds so tiles are comparable. Lay tiles out on a grid sorted by publication year. Hover plays the audio; click opens the book's opening lines beside its waveform.

## Technical approach — specific & technical

Stack: static site, Vite + TypeScript, Canvas/WebGL for the waveform grid, browser Web Audio API for playback.

Data sources by name:
- **Project Gutenberg** — ~18.7k English fiction titles. Pull plain-text via the `gutenberg` bulk mirror or the **Gutendex** JSON API (`gutendex.com/books`) for metadata (title, author, birth/death years as a publication-era proxy). Use the **Standardized Project Gutenberg Corpus (SPGC)** for cleaned, deduplicated text if raw headers are painful.
- **browser SpeechSynthesis API** (Web Speech) to render TTS offline in a headless-Chrome/Playwright pass, capturing audio via a MediaRecorder tap; OR **piper** (local neural TTS) as a more consistent, license-clean alternative for batch synthesis.

Pipeline (offline, Python + Node): strip Gutenberg boilerplate → take first ~600 words → synthesize at fixed rate → resample/time-stretch to exactly 30s → compute an amplitude envelope (RMS over sliding window) → store the envelope as a compact float array (not the audio; audio synthesized on demand or stored as small opus clips).

Data model: `books[{id, title, author, year, envelope:[float], audio_url}]`. The grid renders envelopes as mini-waveforms; audio streams on hover.

Key algorithm: constant-WPM synthesis + fixed-duration normalization is what makes tiles comparable — the *only* variable left is rhythm. The hard part is batch TTS at scale (18.7k clips) with consistent prosody and pause behavior; mitigate by rendering envelopes for all books but only synthesizing full audio lazily for hovered tiles.

## v1 scope (humiliatingly small)

- ~200 hand-picked canonical novels spanning 1700–2020.
- Precomputed amplitude envelopes for all 200; audio for a curated subset.
- Year-sorted grid, hover-to-play, click for opening lines.
- One TTS voice, one fixed WPM.

## Out of scope (for now)

- Full 18.7k corpus, multiple voices, per-author facets.
- Any sentiment/word-frequency analysis (deliberately not that).
- Non-English corpora.

## Risks & unknowns

Prior-art verdict: **Partial**. The prose-rhythm finding is published; the TTS-waveform small-multiples wall is unbuilt. Fresh angle = making rhythm *audible and visible simultaneously* as a scannable grid. Unbuilt part: the artifact. Risks: TTS prosody may not honor punctuation pauses the way needed to make rhythm legible — validate early with 10 books; if flat, insert explicit SSML/pause tokens at sentence boundaries. Waveform-of-opening-600-words may not represent a whole book — acceptable for v1, label it.

## Done means

A grid of ~200 waveform tiles sorted 1700→2020 renders in-browser; hovering a tile plays a 30-second reading; the visual trend from dense blocks to sparse staccato is legible without explanation.

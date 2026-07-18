## Overview
Brick Wall is a desktop/CLI tool that verifies whether an audio file is *genuinely* lossless or a lossy source dressed up as FLAC/ALAC. It's for the niche that trades, buys, or archives high-res music — r/lossless denizens, DJs buying tracks off gray-market stores, Bandcamp/Discogs resellers, and personal-archive hoarders — who currently rely on eyeballing spectrograms in Spek and arguing in forums.

## Problem
Tools like SpotiFLAC promise 'true FLAC from Tidal/Qobuz,' and stores swear their downloads are lossless — but transcodes (MP3→FLAC, AAC→FLAC) are rampant. A FLAC container guarantees nothing about the *content's* history. Spotting a fake requires reading a spectrogram and knowing what a 16 kHz shelf means. That expertise is scarce; the verification is cheap to automate.

## How it works
Drop a file (or a folder) in. Brick Wall renders a spectrogram and runs detectors: (1) a hard high-frequency shelf/'brick wall' — energy that flatlines to noise floor above ~16/19/20 kHz, the tell of 128/256/320k MP3; (2) missing ultrasonic content vs. declared sample rate (a '24/96' file with nothing above 22 kHz is upsampled); (3) MP3-characteristic joint-stereo and short-block scalefactor artifacts. It outputs a verdict — LOSSLESS / TRANSCODE / UPSAMPLED / INCONCLUSIVE — with a confidence score, the estimated original bitrate, and the annotated spectrogram as evidence.

## Technical approach
Python + numpy/scipy (STFT) + soundfile/ffmpeg for decode; Pillow for spectrogram PNGs. Per-file: decode to mono+stereo PCM, compute log-magnitude STFT, then measure the frequency at which median energy drops below a rolloff threshold and stays there (the cutoff). Cross-reference cutoff→bitrate lookup table. Stereo detector: measure correlation of high-band L/R for joint-stereo collapse. Ship a small labeled corpus (self-encoded MP3/AAC/Opus at known bitrates + true losslessers) to calibrate thresholds. The genuinely hard part: false positives on legitimately band-limited masters — analog tape, some classical/ambient, deliberately dull mixes read as 'transcode.' Mitigate with a confidence band and a 'why' panel showing the evidence rather than a bare verdict.

## v1 scope
- CLI: `brickwall track.flac` → verdict + confidence + saved spectrogram PNG
- Cutoff-frequency + declared-sample-rate detectors only
- Bitrate estimate from a hardcoded cutoff table
- Batch mode over a folder with a CSV report

## Out of scope
- GUI / drag-drop app (v2)
- Opus/AAC fine-grained encoder fingerprinting
- Auto-fixing or re-tagging files
- Library-wide dashboards

## Risks & unknowns
- False positives on genuinely dull masters — the core accuracy risk
- Some hi-fi genres legitimately lack ultrasonic content
- Legal/optics: adjacent to piracy tooling; frame strictly as verification

## Done means
Given a test set of 50 files (25 true lossless, 25 transcodes I encoded myself), v1 correctly classifies ≥90% of the transcodes with ≤1 false 'transcode' verdict on the true-lossless set, and emits a spectrogram PNG showing the detected cutoff line for each.

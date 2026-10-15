## Overview
Lost Texton is a daily generative art and audio piece for people with big camera rolls. Each morning it picks a photo from today and one from exactly a year ago, breaks both into textons (small repeating texture primitives), and interpolates between them to synthesize a never-repeating wallpaper. A paired ambient drone is generated from the same match.

## Problem
"On this day" memories just show you an old photo. They don't make anything new, and they get ignored. A texture blend of then and now is abstract enough to hang on a wall every day and personal enough to notice when it changes.

## How it works
1. At 6am, query the photo library for a today photo (most recent) and an anniversary photo (same date last year, best-scored).
2. Extract patches, embed them, and cluster them into roughly 64 textons per image.
3. Match textons across the two sets with optimal transport (Sinkhorn). Matched pairs are "shared vocabulary" and unmatched ones are "lost" or "new".
4. Synthesize a 4K texture by patch-based quilting, sampling 50/50 from matched pairs interpolated in feature space, with lost textons appearing as rare inclusions.
5. Sonify: each matched pair becomes a sine partial whose pitch comes from mean hue and whose amplitude comes from match strength. Lost textons become detuned grains.
6. Set it as the wallpaper and save an archive, so a year of these becomes a flipbook.

## Technical approach
- **Stack:** Python with PyTorch. Use VGG-19 conv3 features for patch descriptors and `POT` for Sinkhorn OT.
- **Synthesis:** Efros–Freeman image quilting over the interpolated texton atlas, or a Gram-matrix style-transfer pass for v2.
- **Photos:** macOS PhotoKit via `osxphotos`, filtered to exclude screenshots and faces-dominant images.
- **Audio:** `numpy` additive synthesis into a 60s seamless-loop WAV. A menubar app plays it softly.
- **Hard part:** keeping the output looking like texture rather than mush. Interpolating in feature space and quilting real pixels avoids blurry averaging.

## v1 scope
- A CLI that takes two image paths and writes PNG plus WAV
- Launchd job at 6am
- Set the wallpaper via `osascript`

## Out of scope (for now)
- Video or animated wallpaper
- Sharing or social features
- Windows or Linux

## Risks & unknowns
- Some days have no photo from a year ago, so fall back to the nearest date.
- Outputs could converge on a sameness of brownish noise. A palette-preservation term may be needed.
- Running VGG on Apple Silicon should take under 30s, but this is unverified.

## Done means
Given two real photos, the CLI produces a 3840×2160 PNG where both source palettes are visibly present, and a 60s loop WAV with no click at the loop point. Running the job three days in a row yields three distinct wallpapers.

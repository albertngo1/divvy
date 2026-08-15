## Overview
A browser-based forensic tool for moderators, journalists, and anyone in a group chat argument: paste a screenshot of a tweet, an iMessage thread, a Slack DM, or a Gmail message, and it tells you whether that text was actually rendered by the app it claims to be from — or typed over it in an image editor.

## Problem
Fabricated screenshots are the cheapest disinformation there is, and current checks are useless: EXIF is stripped by every platform, reverse image search fails on unique fakes, and "look at the JPEG artifacts" forensics dies the moment the image passes through a messaging app that re-encodes everything. Meanwhile the fake almost always betrays itself in the *typography* — an editor cannot reproduce a platform text renderer's exact advance widths, hinting, and antialiasing.

## How it works
1. Detect text lines and per-character bounding boxes (Apple Vision / PaddleOCR).
2. Infer render scale: measure cap height and x-height of the largest run, snap to the candidate template's known ppem ladder (iOS Messages body at 1x/2x/3x, Dynamic Type steps).
3. Re-shape the recognized string with HarfBuzz using the real font (SF Pro, Roboto, Segoe UI) at that ppem, then compare the predicted cumulative advance lattice to the measured one. Genuine renders match within sub-pixel tolerance across the whole line; retyped text drifts, because the forger's editor used different kerning/tracking.
4. Antialias check: measure per-glyph edge chroma. CoreText grayscale AA, Skia LCD subpixel AA, and Photoshop's rasterizer leave different color fringes. Any run whose fringe statistics disagree with the rest of the image is flagged.
5. Residual check: high-pass energy in each text run's bounding box, z-scored against the other runs in the same image — a pasted patch has its own recompression history.
6. Output: per-run verdict, a set of "platforms that could have produced this," and a side-by-side of what the real UI would have drawn.

## Technical approach
Python + harfbuzz-py + FreeType for shaping, OpenCV/NumPy for the raster work, FastAPI backend with a static frontend. The genuinely hard part — and the moat — is ground truth: a corpus builder that drives `xcrun simctl` iOS simulators, Android emulators, and headless Chrome/Firefox to screenshot a parameterized template of every target app at every DPR and Dynamic Type size, storing advance tables, glyph raster hashes, and baseline lattices in SQLite. That corpus is cheap for one person with a Mac and a weekend, and impossible for a moderator to build themselves.

## v1 scope
- One template only: iOS Messages, SF Pro, 3x, default type size.
- Advance-lattice test plus antialias-chroma test. No residual analysis.
- Verdict is three states: consistent / one run inconsistent / not enough text.
- Corpus captured from a single iOS simulator version.

## Out of scope
Video, non-Latin scripts, images below ~600px wide, deepfaked photos, any claim about *who* made the fake.

## Risks & unknowns
Platform re-encoding and upscaling can wash out chroma fringes; the tool must abstain rather than guess. False accusations are the real harm, so every verdict ships with the evidence image. App redesigns rot the corpus.

## Done means
Given 40 real iOS Messages screenshots and 40 where one line was edited in Photoshop or GIMP, the tool flags ≥90% of fakes with zero false positives on the reals, and shows the offending run highlighted.

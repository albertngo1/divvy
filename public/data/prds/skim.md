## Overview
Skim is a browser extension that issues an honest reading receipt for long articles and PDFs. It measures how much you actually read versus skimmed, using scroll-velocity and dwell telemetry (with optional webcam gaze estimation), and hands you a blunt post-read score. For people who lie to themselves about having "read" something before opining on it.

## Problem
The arXiv paper "Rating the Pitch, Not the Product" nails a human failing: we evaluate based on expectations and vibes, not actual engagement. We share, argue about, and feel informed by articles we skimmed in eight seconds. There's no honest mirror that says: you did not read this. Reading-time estimates on Medium are aspirational, not measured.

## How it works
As you read, Skim tracks per-paragraph exposure: which text nodes entered the viewport, how long they dwelled at readable scroll speed, and how fast you blew past others. It computes a "real read %" — fraction of content that stayed on screen long enough to plausibly be read at your personal words-per-minute baseline. Blast through 3000 words in 12 seconds and it knows. Optional webcam mode adds coarse gaze estimation (PAGE-style) to distinguish "on screen but you were looking at Slack" from actual attention. At the end it shows a receipt: read %, longest skimmed stretch, and a streak-style honesty log over time. Mischievous toggle: block the site's share button until you clear a threshold.

## Technical approach
Manifest V3 extension. Core signal is `IntersectionObserver` on text blocks + a scroll-velocity integrator; per-node dwell time is bucketed against a calibrated WPM (estimated from the user's slowest sustained reading passes). Read% = weighted coverage of word-count that met the dwell threshold. Optional webcam path uses a lightweight in-browser gaze model (MediaPipe FaceMesh → coarse screen-region estimate) running entirely client-side; nothing leaves the machine. State is `chrome.storage.local`. The hard part is the WPM calibration and avoiding penalizing legitimate fast readers or re-readers — the model must adapt per user rather than assume a fixed rate, and gaze estimation from a laptop cam is noisy enough that it's a tiebreaker, not the backbone.

## v1 scope
- IntersectionObserver + scroll-velocity read% for article pages
- Post-read receipt overlay
- Per-user WPM auto-calibration
- Local-only, no webcam

## Out of scope
- Webcam gaze (v2, opt-in)
- PDFs and native apps
- Cloud sync / social sharing of scores

## Risks & unknowns
- Reading isn't linear (skipping to the good part isn't not-reading) — read% may feel unfair.
- Privacy optics of any webcam feature, even if fully local.
- Could feel judgmental and get uninstalled fast; framing matters.

## Done means
Reading a long article at normal pace yields a read% above ~80; deliberately flick-scrolling to the bottom in seconds yields under ~20; the receipt renders on page-leave with per-section coverage, and all computation stays on-device.

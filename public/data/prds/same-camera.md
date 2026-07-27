## Overview

A local desktop tool for anyone who posts images under a name that isn't theirs — leakers, harassment targets, moderators, journalists' sources, people selling a couch without doxxing their apartment. You hand it the image you're about to publish plus (optionally) a folder of photos already public under your real name. It runs the attacks a competent analyst would run and returns a linkability report: *what survived your scrub.*

Every privacy tool in this space strips metadata. This one is the inversion: it assumes you already stripped it, and shows you it wasn't enough.

## Problem

"Remove EXIF" is the entire mainstream mental model of image anonymity. But EXIF is the shallowest layer. A JPEG's quantization tables identify the encoder and often the camera model. Sensor pattern noise (PRNU) links two images to the *same physical device* even across crops, and it survives resizing and recompression. Shadow direction plus a visible skyline constrains time and latitude. Embedded thumbnails frequently survive editing and show the *uncropped* frame. None of this is visible to the person about to hit post, and there's no tool that just tells you.

## How it works

Drag a file in. The report is a ranked list of findings, each with a severity, a one-line plain explanation, and the raw evidence:

- **Device linkage** — if you supplied a reference folder, it estimates a PRNU fingerprint from those photos and correlates it against the target, reporting a Peak-to-Correlation-Energy score and a plain verdict ("same camera, high confidence").
- **Camera model** — quantization-table + Huffman-table signature matched against a local table database, plus JPEG trailer bytes and APPn segment order.
- **Edit history** — JPEG ghost / double-quantization analysis showing regions recompressed at a different quality, i.e. splices and clone-stamped redactions.
- **Hidden frame** — embedded thumbnail and MPF preview extracted and shown side-by-side with the visible image; mismatch is flagged loudly.
- **Sun geometry** — you click one vertical object and its shadow tip; it solves for solar azimuth/elevation and prints the (date, latitude) band consistent with it.

Then a **Scrub** button that actually defeats what it found (re-encode at a fixed quality with standard tables, PRNU suppression via light wavelet-domain notching, thumbnail rebuild) and re-runs to prove each finding is gone.

## Technical approach

Python, offline, Tauri or plain Textual TUI. Core: numpy + PyWavelets. PRNU via Mihcak/Lukáš wavelet denoise residual, Wiener-filtered in DFT domain, correlated with normalized cross-correlation; PCE rather than raw NCC so the threshold is interpretable. Cropping/resizing breaks alignment, so the correlation runs as a brute-force search over ~40 scale factors and full 2D translation via FFT — that's the genuinely hard part and the main compute cost. Quantization tables read with a patched jpeglib binding (Pillow discards too much); table DB seeded from public corpora. Ghost analysis: re-compress at q=50..95, plot per-block RMS difference. Solar geometry: NREL SPA, invert for the (day, lat) set.

## v1 scope

- JPEG only, single file in, HTML report out
- Quantization-table fingerprint + thumbnail extraction + JPEG ghost map
- PRNU correlation against a user-supplied reference folder, no scale search (same-resolution only)
- No scrub button yet — just findings

## Out of scope

HEIC/video, model-based deepfake detection, C2PA signing, cloud anything, uploading images off-device (ever).

## Risks & unknowns

PRNU on modern computational-photography phones is degraded by aggressive multi-frame denoise — the tool may be quietly wrong about iPhone-to-iPhone linkage, and it must say so rather than print a confident number. False *reassurance* is the real hazard here: an unflagged image is not a safe image, and the UI must never imply otherwise.

## Done means

Given 20 photos from one phone as reference and one from that phone plus one from a different unit of the same model, the tool scores the matching pair >60 PCE and the non-matching pair <10, and correctly names the camera model of both from quantization tables alone with EXIF fully stripped.

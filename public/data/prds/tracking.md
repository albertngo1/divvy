## Overview
Tracking (the typographic term, and the other one) is a CLI + small web tool that embeds a per-recipient identifier into the inter-word spacing of a justified document, and recovers it from a scan, a screenshot, or a crooked phone photo of a printed page. Two audiences: people distributing sensitive drafts to a known list (board decks, prerelease press embargoes, legal discovery), and — the more interesting half — anyone who wants to check whether a document handed to *them* is carrying a fingerprint.

## Problem
Every leak investigation reduces to "which of the 40 people we sent this to?" and the answer is usually unknowable, so organizations resort to visible watermarks, which are trivially cropped, or DRM viewers, which everyone hates and which fail the moment a photo is taken. Meanwhile the asymmetry runs entirely one way: recipients have no way to know they're being individually marked. Both halves deserve a tool.

## How it works
**Embed:** you supply a PDF and a recipient list. For each recipient, the tool rewrites the text-showing operators of the justified body text, nudging each inter-word gap by ±δ (δ ≈ 1.5% of the em, well under the eye's threshold, and *within* the range a justification engine already varies) to encode one symbol per gap. The payload is a 24-bit recipient ID protected by Reed–Solomon and repeated across the page, with line indices as sync markers. Output: N visually identical PDFs and a keyfile mapping IDs to names.
**Extract:** drop in a photo. The decoder finds the page quad, corrects perspective via homography, binarizes (Sauvola), segments words as connected components, measures gaps in units of the line's x-height (scale-invariant), normalizes per line to kill the justification baseline, quantizes to symbols, and RS-decodes. Report: "recipient #17 — Dana R. — confidence 0.94, 6 of 9 pages agreed."
**Detect:** given a single copy and no key, run a distributional test — a legitimately justified paragraph has gap widths clustered by line (one width per line, by definition of justification); a marked one has bimodal *within-line* gaps. That's a chi-square away, and it's the mode nobody ships.

## Technical approach
Python. Embedding via `pikepdf`/`mupdf` on the content stream — adjusting the numeric kerns inside `TJ` arrays rather than re-typesetting, so fonts, layout and page count are untouched. `reedsolo` for ECC. Decoding via OpenCV: `findContours` for the page quad, `warpPerspective`, Sauvola threshold, morphological dilation to merge glyphs into word blobs, then per-line gap vectors. The hard part is capacity vs robustness: a page has only ~300 usable gaps, JPEG compression and print-scan-print add real noise to a ±1.5% em signal, and δ large enough to survive a bad photo starts to be visible to a designer. Expect a paranoia dial that trades pages-needed against detectability.

## v1 scope
- Single-column, single-font, justified PDFs only
- 16-bit payload, repetition code (no RS yet)
- Decode from a clean 300dpi scan, not a photo
- The detect mode, on scans, as a plain chi-square report

## Out of scope
Multi-column and tables, non-Latin scripts, line-shift and glyph-shape coding, adversarial removal-resistance, anything that touches DRM.

## Risks & unknowns
Re-flowing the PDF through any editor destroys the payload — this only works on the artifact as sent. Photo decoding may simply not clear the noise floor at invisible δ. And the ethics cut both ways: shipping the detector alongside the embedder is the whole reason this is defensible.

## Done means
A 6-page document is emitted in 20 marked variants; a 300dpi scan of page 3 of variant 12 decodes to ID 12 with zero false positives across all 20; and the detect mode flags all 20 as marked while flagging an unmarked control as clean.

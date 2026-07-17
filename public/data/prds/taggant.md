## Overview
Taggant is a leak-tracing tool for anyone who circulates sensitive text to a known set of people — a board memo, an unreleased script, an NDA'd spec, a whistleblower packet's cover story. Inspired by the HN "Decoy Font" trick, it assigns each recipient a per-person font in which a subset of characters are silently remapped to visually-identical alternate glyph outlines. The rendered document looks identical to everyone. But because the *shapes* differ, even a screenshot or a phone photo of the leaked page carries a recoverable fingerprint pointing at the recipient.

## Problem
Existing document watermarking is fragile: zero-width characters and homoglyph Unicode swaps die the instant someone retypes, OCRs, or screenshots the text. Visible watermarks get cropped. There's a real gap: a mark that survives *retypesetting-by-camera* — i.e., is baked into pixels, not metadata or code points — while staying invisible to the naked eye.

## How it works
You upload a document and a recipient list. Taggant generates one font per recipient by, for a secret pseudo-random subset of glyph positions, substituting an alternate outline that differs by sub-pixel-perceptible tweaks (a slightly different serif terminal, a 1% wider bowl, a shifted ink trap). The per-recipient *pattern* of which-glyphs-got-which-variant encodes an ID via an error-correcting code. It emits a PDF with the font embedded per person. Later, given a leaked image, you run the extractor: locate glyphs, classify each into its variant via a trained matcher, decode the ECC, and it names the leaker (or says "inconclusive").

## Technical approach
Font surgery with `fontTools` (Python): start from an open variable font, generate K near-identical outline variants per targeted glyph by nudging control points / axis values. Encode recipient IDs as codewords of a Reed–Solomon code over the variant-choices vector, so partial recovery (cropped/blurry leak) still resolves an ID and it resists a collusion attack of a few recipients averaging their copies (fingerprinting-code design — Tardos codes are the serious version). PDF assembly via ReportLab embedding the per-recipient subset font. Extractor: OpenCV glyph segmentation on the leaked raster → per-glyph CNN/template classifier trained on rendered variant samples → ECC decode. The genuinely hard part is a variant set that is *robustly distinguishable after JPEG + camera blur* yet *imperceptible on screen* — a direct tension requiring perceptual tuning and a decoder trained on realistically degraded captures.

## v1 scope
- One base font, 2 variants on ~20 common glyphs (1 bit each)
- Up to 16 recipients (4-bit ID) with a small ECC margin
- PDF-out per recipient; extractor runs on clean screenshots (not yet phone photos)
- CLI only

## Out of scope
- Collusion-resistant Tardos codes
- Arbitrary uploaded fonts
- Robustness to print-then-rescan

## Risks & unknowns
- Variants distinguishable after camera blur may be visible to sharp eyes — the core tradeoff
- Ethics: this is a surveillance tool; needs clear "you must own/authorize the docs" framing and consent norms
- OCR-and-retype by the leaker defeats it entirely (honest limitation)

## Done means
Generate 16 per-recipient PDFs of the same memo that look pixel-indistinguishable to a human at reading size; take a screenshot of recipient #11's copy, run the extractor, and have it correctly output "recipient 11" — and output "inconclusive" (not a false name) on a screenshot of an unrelated document.

## Overview
Left Uncorrected is a CLI and small web tool that embeds a secret message in the *error pattern* of an OCR transcript. You give it a plaintext page and a payload; it emits a transcript that reads like an unedited scan, with typos in specific places. Anyone with the key and the same codebook reads the bits out of the text alone — no image required. For people who want a covert channel that survives copy-paste, screenshots being retyped, and plaintext-only mediums where pixel steganography dies.

## Problem
Every deniable-stego scheme fights the same losing battle: the carrier looks clean, so any anomaly is evidence. OCR output is the rare medium where *noise is the expected state*. Nobody has built a channel that spends that budget deliberately. Meanwhile LLM-based stego needs both parties to run bit-identical inference, which almost never holds.

## How it works
1. **Codebook.** From real post-OCR correction corpora (Overproof, ICDAR-2017 post-OCR), mine character-level confusion pairs: `rn↔m`, `l↔1↔I`, `cl↔d`, `ii↔n`, long-s substitutions. Keep only pairs where *both* spellings are attested outputs for the same source glyphs.
2. **Carrier selection.** Walk the plaintext. A word is a carrier if it can be written two ways under the codebook AND a keyed PRF over `(secret key, word index, 3-word left context)` selects it. Both sender and receiver compute the same carrier set from the *stego* text, because carrier-hood depends only on the word's identity-class, not on which form was chosen.
3. **Embedding.** Bit 0 = the clean spelling, bit 1 = the confusable spelling. Matrix embedding (Hamming (7,4) syndrome coding) so a k-bit payload flips ~half as many words as naive embedding.
4. **Rate matching.** The tool measures the flip rate and pads or throttles so the transcript's typo density and confusion-class histogram match a target profile ("1920s newsprint, Tesseract 5"). Too clean is as suspicious as too dirty.
5. **Extraction.** Receiver runs the same keyed walk over the received text, reads each carrier's form as a bit, decodes the syndrome, gets the payload.

## Technical approach
Python. `regex` + a normalized word-class index for carrier detection; HMAC-SHA256 as the PRF; a confusion-pair table as JSON with per-pair frequency weights learned by aligning ground-truth/OCR pairs with `difflib` on the character level. A `--profile` flag loads a target error-rate distribution measured from an actual corpus. Optional `render` mode ships a matching page image (Pillow + a period font + light noise/skew) so the transcript has a plausible parent — the image is decoration; the bits live in the text. The genuinely hard part is contextual plausibility: `rn`→`m` inside a word an English reader parses instantly as a real other word (`corn`→`com`) is a *stronger* carrier than a nonsense one, so carriers need a language-model check that the flipped form is a typical OCR error rather than a semantically loaded substitution.

## v1 scope
- 12 hardcoded confusion pairs, English only
- Encode/decode round-trip on a pasted paragraph
- Capacity readout: bits available in this text
- No image rendering, no rate matching

## Out of scope
Non-Latin scripts, PDF layout preservation, robustness to a hostile spellchecker, key exchange.

## Risks & unknowns
Capacity is thin (maybe 1 bit per 40 words), so long payloads need long covers; an adversary who has the *original* document trivially diffs it; autocorrect anywhere in the transport pipeline destroys the payload; and the honest security claim needs a detector built and beaten, not asserted.

## Done means
A 600-word paragraph carries a 40-bit payload, round-trips exactly, and a blind reader shown both the stego and a genuine Tesseract transcript of the same page cannot tell which is which better than chance across 20 trials.

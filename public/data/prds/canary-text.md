## Overview
Canary Text is a tiny web tool that fingerprints text. You paste a sensitive message and a list of recipient names; it emits N visually identical copies, each carrying a unique invisible watermark encoded in zero-width characters and homoglyph swaps. Later, when a copy leaks, you paste the leaked text back in and it decodes which recipient's copy it was — "this came from the copy you sent to Dana." It flips the Claude-steganography headline into a practical betrayal-detector for group-chat drama.

## Problem
When you forward something sensitive to N friends and it leaks, you have no idea which friend betrayed you. Screenshots and forwards strip all attribution. There's no lightweight, no-account way to embed per-recipient provenance into ordinary text.

## How it works
Encode: assign each recipient an integer index, serialize that index to bits, and embed the bits invisibly across the message. Distribute one marked copy per recipient. Decode: paste any leaked copy back; the tool extracts the embedded index and names the source. Redundancy across the whole message means partial leaks still resolve.

## Technical approach — specific & technical
Stack: single static HTML page, vanilla TS or a tiny React build, no backend — everything runs client-side so plaintext never leaves the browser. Encoding layer 1 (zero-width): map recipient index → binary → insert U+200B (0) and U+200C (1) between words, with U+FEFF frame markers; the index is repeated across gaps for redundancy. Encoding layer 2 (homoglyphs): swap select Latin characters for visually identical Cyrillic/Greek codepoints — Latin `a`→Cyrillic `а` (U+0430), `e`→`е` (U+0435), `o`→`о` (U+043E), `p`→`р` (U+0440) — using presence/absence of swaps at fixed positions as extra parity bits so decoding survives clients that strip zero-width chars. Data model: `{index → [byte pattern]}` plus a checksum byte (CRC-8) to reject garbage decodes. Decode: normalize the pasted text, scan for zero-width runs and homoglyph positions, reconstruct bits from both layers, majority-vote across redundant copies, verify checksum, map index → name. Copy-to-clipboard per recipient via `navigator.clipboard.writeText`. The hard part: robustness — surviving copy-paste, quoting, and re-wrapping that mangle whitespace, while keeping the two encoding layers independent so at least one survives; and avoiding false positives when innocent text happens to contain matching codepoints (the checksum guards this).

## v1 scope (humiliatingly small) — bullets
- Single static page, no backend.
- Encode: interleave U+200B/U+200C as a binary recipient index between words.
- Decode: strip and read the index back, map to name.
- Copy-to-clipboard per recipient.
- Text only (no screenshots).

## Out of scope (for now)
- Homoglyph layer, checksum/redundancy hardening (v1 is zero-width only).
- Screenshot ingestion + OCR decode.
- Accounts, storage, sharing links, mobile app.

## Risks & unknowns
- Retyping (not copying) destroys the watermark entirely.
- Some clients normalize/strip zero-width characters on paste.
- False attribution if decoding lacks a checksum.

## Done means — concrete, testable
I send two differently-marked copies of the same paragraph to two people, one pastes theirs back, and the tool correctly names the source.

## Problem
The Claude steganography post shows text can carry invisible per-request marks. Flip it into a social tool: when you forward something sensitive to N friends and it leaks, you have no idea which friend betrayed you.

## What it is
A tiny web tool. You paste a message and a list of recipient names. It emits N visually identical copies, each carrying a unique fingerprint encoded in zero-width characters / homoglyph swaps. Later you paste the leaked screenshot's text (or the text itself) back in, and it decodes which recipient's copy it was — 'this came from the copy you sent to Dana.'

## v1 (humiliatingly small)
Single static page, no backend. Encode: interleave zero-width chars (U+200B/U+200C) as a binary index of the recipient between words. Decode: strip and read them back. Copy-to-clipboard per recipient. Works only on text (screenshots-with-OCR is v2).

## Done means
I send two differently-marked copies of the same paragraph to two people, one pastes theirs back, and the tool correctly names the source.

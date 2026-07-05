## Overview
Out of Order is a steganography toy that hides a short message in the *ordering* of a shareable list — a playlist, a photo album, a bookshelf, any list of unique items. The arrangement looks arbitrary but encodes bits. For privacy tinkerers, puzzle-makers, and note-passers.

## Problem
Classic stego hides data in pixels or whitespace, which dies the moment the carrier is re-encoded — Spotify re-renders playlists, iMessage recompresses images, forums strip metadata. But a *permutation* survives verbatim: reorder a 50-item list and the order itself is the payload, worth log2(50!) ≈ 214 bits, riding along invisibly through any channel that preserves the items.

## How it works
You pick a carrier list (paste ≥N unique lines) and type a message. The app maps your message to a rank in [0, n!) via a Lehmer code / factorial number system, then permutes the list to exactly that rank. You share the reordered list normally. The recipient pastes the received order back in; the app re-derives the canonical base order (sort by a stable key), reads off the permutation's rank, and recovers the bytes → the message. A length+checksum header detects corruption.

## Technical approach
TypeScript, fully client-side. Encoding: message bytes → BigInt → factorial-base digits → Lehmer code → permutation, selected in O(n log n) with a Fenwick/BIT. Capacity = floor(log2(n!)) bits, shown live ('you can hide 26 characters in 50 items'). Optional AES-GCM the plaintext first with a shared passphrase, so a shuffled order is meaningless without the key. Both ends anchor on a canonical order (sort by stable id / lowercased text) so decoding is deterministic. A generic paste-a-list mode covers everything; a later Spotify Web API (PKCE) mode reads and reorders your own playlist by track URI. The hard part is robust round-trips when the carrier loses or dupes an item — handled with a length+checksum header and erasure tolerance.

## v1 scope
- Paste-a-list mode only (no OAuth)
- Encode + decode with capacity meter
- Optional passphrase (AES-GCM)
- Copy reordered list; header-based corruption detection

## Out of scope
- Spotify OAuth / live playlist reordering
- Image or EXIF carriers
- Heavy error-correction beyond a checksum
- Native mobile app

## Risks & unknowns
- Brittle if the carrier mutates order-preservation assumptions
- Both sides must agree on the canonical-sort convention
- Educating users that this is obfuscation, not strong secrecy (unless AES is on)

## Done means
Paste 40 lines + 'meet at noon,' get a reordered 40-line list; paste that list on another machine and recover 'meet at noon' exactly, while a single swapped pair is flagged as corruption.

## Overview

A library + CLI that watermarks a typeset document by choosing among its *near-optimal* line-break solutions. The text is byte-identical, the typography is indistinguishable from ideal, and the payload survives printing, photocopying, and being photographed on a desk. For anyone who distributes a sensitive document to N people and wants to know which copy leaked; also a toy for stego people who are tired of zero-width characters.

## Problem

Existing text watermarks are fragile or ugly. Zero-width characters and homoglyphs die the instant someone retypes, screenshots, or pastes into Slack. Inter-word-space-nudging stego (the classic 1990s trick) produces visibly loose lines and is trivially detected by measuring spacing variance. Meanwhile the *real* redundancy in typeset text has been sitting unused since 1981: for most paragraphs, dozens of different break sequences are within a hair of optimal.

## How it works

Knuth-Plass models line breaking as a shortest-path problem over feasible breakpoints, minimizing total demerits. Instead of taking the single best path, `looseline` enumerates every path whose demerits are within ε of the optimum, sorted deterministically. If a paragraph yields 2^k such layouts, it carries k bits.

Encode: `message → bits → Reed–Solomon(255,191) → header (version, length) → index into the sorted candidate list, per paragraph`. Render to PDF. Nothing about spacing is nudged — every emitted layout is one a purist typesetter would accept.

Decode (digital): pull word positions from the PDF, recover which word ends each line, re-run the same enumeration from the same source text + font metrics, find the index. Decode (photo): dewarp via page-corner homography, segment lines by horizontal projection profile, segment words by gap threshold, read off the break sequence — you only need to know *which word ends each line*, which is the most robust signal on a scanned page.

## Technical approach

TypeScript. Knuth-Plass implemented over integer scaled points (TeX's 2^-16 pt) — **float arithmetic would break encoder/decoder agreement**, and that determinism is the crux of the whole design. Candidate enumeration is top-k shortest paths on the breakpoint DAG (per-node top-k DP, not Yen's, since k is small). Font metrics from `opentype.js`; PDF emission via `pdf-lib`. Photo decoder is Python + OpenCV, ~200 lines.

The hard parts: (1) capacity is brutal — measured on real prose, expect 1–3 bits per paragraph, so ~2–5 bytes per page, meaning the payload is a short recipient ID, not a message; (2) the decoder needs the cover text and metrics, so this is a *watermark* (issuer-verifiable), not a covert channel between strangers; (3) ε tuning trades capacity against a typographer noticing.

## v1 scope

- One font (Latin Modern Roman 10pt), one column width, English prose
- Encode an 8-bit ID across an 8-paragraph document
- Decode from the generated PDF only
- Capacity report: bits available per paragraph for a pasted-in text

## Out of scope

Photo/scan decoding. Hyphenation-point selection as an extra bit source. Non-Latin scripts. Collusion resistance (two recipients diffing their copies). HTML/browser rendering.

## Risks & unknowns

Capacity may be under 1 bit/paragraph on short-paragraph documents, killing it. Any reflow (different paper size, a PDF-to-text-to-Word trip) destroys the payload. Enumeration determinism across platforms must be proven, not assumed.

## Done means

Encoding recipient ID `0xA7` into a 900-word document produces a PDF whose line breaks differ from the ε-optimal baseline in ≥3 paragraphs, no line's badness exceeds the optimum by more than ε, and the decoder recovers `0xA7` from the PDF with zero errors on 20/20 different cover texts.

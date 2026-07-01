## Overview
Marked Deck is a browser tool for anyone who shares sensitive text with a small trusted group — journalists, execs, playtesters, NDA'd reviewers — and wants to trace a leak. You paste a document, add recipients, and it emits one invisibly-watermarked copy per person. Later, paste a leaked copy back in and it names the traitor. Every copy is the same card face-up; each is secretly marked.

## Problem
The HN Claude Code steganography story showed how easy invisible marking is — but there's no friendly tool that weaponizes it *for you*. When a confidential doc leaks from a group of five, you usually have zero forensic signal. Full DRM is overkill and breaks copy-paste; people just want traitor-tracing on plain text.

## How it works
Input a document and a recipient list. Marked Deck assigns each recipient a unique binary codeword and embeds it redundantly using a layered codebook: zero-width characters at word boundaries (bit carriers), homoglyph swaps (Latin vs. Cyrillic look-alikes), and micro-variations in whitespace/punctuation. It exports one copy per recipient. The Detect pane takes any leaked snippet — even a partial paste that's been reformatted — extracts surviving marks, and runs error-corrected decoding to recover the codeword and rank suspects by confidence. A 'How marked is this?' meter shows redundancy so you can trust partial leaks.

## Technical approach
Stack: pure client-side TypeScript, no server (secrets never leave the browser). Codewords use an error-correcting code (Reed–Solomon or a simple repetition+parity scheme) so partial/corrupted leaks still decode. Carriers: (1) zero-width joiner/non-joiner sequences inserted at token gaps encoding bits; (2) a homoglyph substitution table applied at deterministic positions; (3) optional whitespace-run length coding. Data model: per-document a seed → per-recipient codeword → carrier placement plan; store only the seed+roster locally so re-detection is reproducible. Detection normalizes the leaked text, harvests each carrier channel independently, votes across redundant copies, and outputs a suspect ranking with a confidence score. Hard part: robustness — surviving copy-paste, markdown re-rendering, and 'smart quotes' mangling — while staying invisible enough to not trip a careful reader or a naive unicode-stripper.

## v1 scope
- Paste doc + recipient list → download N marked copies
- Zero-width + homoglyph channels only
- Detect pane that names the top suspect from a pasted leak
- Confidence meter, everything client-side

## Out of scope
- File formats beyond plain text/markdown (no PDF/DOCX)
- Collusion-resistant fingerprinting (two recipients averaging copies)
- Server-side logging or accounts

## Risks & unknowns
- Trivial defeat by unicode-normalization/strip tools
- Homoglyphs breaking search or accessibility (screen readers)
- False accusations from low-confidence partial decodes — needs honest uncertainty

## Done means
Generate 5 marked copies of a 300-word doc, mangle one (reformat + paste through a plain-text editor), and Detect names the correct recipient as top suspect in ≥9 of 10 trials.

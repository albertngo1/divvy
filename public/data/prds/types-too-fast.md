## Overview

A browser extension that detects LLM-generated text on a page by its *delivery* rather than its content. It runs a `MutationObserver` over the document and looks for the signature of token streaming: monotonic appends into a single text node, arriving in bursts of 2–8 characters at a near-constant 20–90 tokens/sec, with a distinctive re-render at the end when markdown is finally parsed.

For people maintaining AI blocklists and cosmetic filter lists, and for anyone who wants a truthful "this was generated" indicator that isn't a coin-flip stylometry classifier.

## Problem

AI content blocklists are hand-maintained CSS selector lists — someone notices a site shipped an AI summary widget, files a PR, the site ships a new class name, repeat forever. Meanwhile every text-classifier approach to "is this AI" is unreliable enough to be worse than nothing. But there is one tell that is nearly free and nearly unfalsifiable: you can *see the model type*. Streamed generation has a fingerprint in the DOM mutation timeline, and nobody is reading it.

## How it works

1. Content script attaches a `MutationObserver` with `characterData` and `childList` at `document.documentElement`, subtree, recording (timestamp, target node path, delta length, is-append).
2. Group mutations into candidate streams: same text node or same subtree root, ≥15 consecutive appends, no deletions.
3. Score each stream on four features and combine into a confidence: inter-arrival regularity, chunk-size distribution, monotonicity, and the terminal reflow.
4. On a positive, drop a small marker on the container and log the CSS path.
5. Export panel: generate a ready-to-paste cosmetic filter rule (`example.com##.ai-summary`) for the streaming container's most stable ancestor selector, so blocklist maintenance becomes observation rather than archaeology.

## Technical approach

Manifest V3, vanilla TS, no model, no network. The observer runs at document_start; keep a ring buffer of the last 2000 mutation records to bound memory.

Key discriminators against false positives:
- **Human typing in a textarea/contenteditable**: log-normal inter-key intervals with a fat right tail (thinking pauses > 800 ms), frequent backspaces (deletions), and single-character deltas. LLM streams have a tight unimodal interval distribution and multi-char chunks. Compute the coefficient of variation of inter-arrival times — humans sit around 0.8–1.5, streaming SSE around 0.15–0.45.
- **Typewriter/marquee animations**: perfectly constant intervals (CV ≈ 0) driven by `setInterval`, and always exactly one character. Flag as "scripted, not streamed."
- **Chunked HTML delivery / lazy loading**: appends whole element subtrees at once, not characterData deltas.

Selector generation: walk up from the streaming text node to the nearest ancestor with a stable, non-hashed class or a `data-*` attribute; reject Tailwind-style utility soup and CSS-module hashes with a regex heuristic, prefer `[data-testid]` and semantic roles.

The genuinely hard part is the discriminator threshold: some UIs buffer SSE and flush on `requestAnimationFrame`, which quantizes intervals to 16.7 ms and makes streaming look scripted. Handle by treating rAF-quantized-but-variable-chunk-size as streaming.

## v1 scope

- Detect and log streams to the extension console only
- Two features: interval CV and monotonic-append run length
- No UI, no marker, no filter export
- Test corpus: 10 hand-recorded mutation traces (5 chat UIs, 3 typewriter animations, 2 humans typing)

## Out of scope

Detecting non-streamed generated text, images, Firefox/Safari ports, any server component, blocking anything.

## Risks & unknowns

Sites that render server-side and never stream are invisible to this — it detects the *act*, not the artifact, which is a real ceiling on coverage. Observer overhead on mutation-heavy pages needs measuring. Sites could deliberately jitter their stream to defeat it; that's a fine arms race to lose slowly.

## Done means

On the 10-trace test corpus the detector labels all 5 chat UIs as streamed and produces zero false positives on the typewriter animations and human typing, and on a live chat UI it emits a cosmetic filter rule that, when pasted into uBlock Origin, hides exactly the response container.

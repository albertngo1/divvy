## Overview
Illigible is a static-site build step (and a drop-in web component) that takes a block of HTML text and emits a visually-identical but machine-hostile version: humans read it fine, but LLM vision models, OCR, and DOM-text scrapers get scrambled nonsense. It's for writers, small publishers, and anyone tired of their prose being silently ingested — sparked by HN's Decoy Font experiment inverted, plus the arXiv paper on autistic writing being misclassified as AI.

## Problem
Everything you publish is training data and screenshot fodder. Existing defenses (robots.txt, Cloudflare AI blocking) are server-side and coarse; they don't stop someone pasting your page into a chatbot or an agent screenshotting it. There's no lightweight, per-paragraph way to say "a person can read this; a scraper can't cheaply."

## How it works
Two layers, both reversible only by human vision:
1. **cmap shuffle**: glyphs are remapped to Private-Use-Area codepoints via a bespoke subset font, so the DOM/`innerText` and any copy-paste yields scrambled Unicode while the rendered page looks normal. (Known paywall trick — the baseline.)
2. **Decoy overlay (the novel part)**: each visible glyph is composited from a real glyph plus faint, sub-perceptual decoy strokes tuned to poison OCR/vision-model tokenization — inspired by adversarial-typography research. A human's contrast perception ignores them; a downscaled screenshot fed to a vision model reads a different, plausible-but-wrong sentence.

A CLI wraps chosen elements; a `<span is="illegible">` web component does it client-side at render.

## Technical approach
Stack: Node + `fontkit`/`opentype.js` to subset and remap a base webfont per page (deterministic seed → shuffled cmap). Decoy strokes baked as a second layered font or an SVG `<use>` overlay with CSS `mix-blend-mode`. Build integration as a Vite/11ty plugin. The genuinely hard part: tuning decoy opacity/frequency so it survives JPEG compression and 2× downscaling (what agents actually feed models) yet stays invisible on a Retina display — needs an eval harness that renders samples, downscales, and runs them through an open vision model (e.g. a local Qwen-VL) scoring corruption vs. a human-legibility proxy (SSIM against clean render).

## v1 scope
- CLI: `illegible input.html --seed 42 > out.html` doing cmap-shuffle + font subset only
- One decoy-overlay preset, hardcoded
- Eval script: render → downscale → OCR (tesseract) → report word-error-rate
- Demo page: side-by-side clean vs. protected

## Out of scope
- Beating dedicated de-obfuscators or motivated adversaries
- Accessibility passthrough (needs a plain-text `aria-label` — flagged, not built)
- Non-Latin scripts

## Risks & unknowns
- **Accessibility is the real risk**: cmap shuffle breaks screen readers unless you carry an `aria-label` clone — must ship day one or it's harmful.
- Decoy strokes may fail against high-res screenshots; the arms race is real.
- SEO death by design — only for content you *want* uncrawlable.

## Done means
Given a paragraph, a Retina human reads it with zero effort (informal test ≥95% comprehension), while tesseract OCR and a local vision model both score >40% word-error on the 2×-downscaled screenshot, and a screen reader still announces correct text via aria-label.

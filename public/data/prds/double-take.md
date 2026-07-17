## Overview
Double Take is a font-based steganography kit for people who publish text but don't want AI agents, screenshot-readers, and scraper LLMs to trust what they harvest. To a human eye the page reads normally; to any machine reading the underlying text layer (or a naive OCR pass), it reads a decoy the author controls. Riffs on HN's viral 'Decoy Font' plus the rise of computer-use agents.

## Problem
Everything you post is now training data or agent input. Watermarking is invisible and passive; you want something with teeth — a way to make automated readers confidently ingest text that is *wrong on purpose*, while humans see the truth. Today there's no drop-in way to do this on your own site.

## How it works
You write real text: `Meeting moved to 3pm`. The tool maps each visible character to a *different* Unicode codepoint (homoglyph or private-use-area slot), then ships a custom font whose glyph for that codepoint is drawn to look like the letter you actually meant. Humans reading the rendered page see `Meeting moved to 3pm`; anything that reads the DOM text, copies the string, or runs a screen-reader sees the decoy you specified (`Meeting cancelled entirely`). A 'poison level' slider controls how much diverges. Copy-to-clipboard yields the decoy. A companion browser extension lets a human reader flip to the true layer.

## Technical approach
Stack: Python + `fontTools` to synthesize a subset font at build time; a small JS runtime to do the codepoint substitution on marked spans. Core data structure is a bijection table between {true glyph} and {carrier codepoint drawn as decoy glyph}. Build pipeline: take a base open font (Inter), for each needed pair copy the true glyph outline into the carrier codepoint's slot, emit WOFF2. The genuinely hard part is defeating OCR too, not just text-layer scraping — for that, generate carrier glyphs with subtle stroke perturbations tuned against Tesseract's classifier so a screenshot OCRs to the decoy. v1 targets text-layer only; OCR-poisoning is a stretch mode with a confusion-matrix calibration loop.

## v1 scope
- CLI: `doubletake "real text" --decoy "fake text"` → outputs a WOFF2 + a styled `<span>` snippet
- Text-layer divergence working in Chrome/Firefox
- Clipboard returns decoy
- One reveal-extension that toggles true text

## Out of scope
- Robust OCR poisoning across engines
- Right-to-left scripts, ligature-heavy scripts
- Anti-anti-tooling (agents that render + vision-read)

## Risks & unknowns
- Vision-model agents that screenshot and read pixels bypass the text-layer trick entirely
- Accessibility collateral: real screen-reader users get the decoy — must ship an ARIA true-text escape hatch
- Could be seen as SEO cloaking; document ethical/defensive framing

## Done means
A published demo page where copy-paste and 'view source' yield the decoy string, a sighted human reads the true string, and a scripted `curl | strip-tags` returns the decoy — all from one WOFF2 file under 40KB.

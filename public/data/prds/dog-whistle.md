## Overview
Dog Whistle is a browser party/red-team game where you design a single image containing text that a **human reads one way and a vision-language model transcribes another way**. It's the deliberate inversion of Ghost Font (a font humans can read but AI cannot): here the goal is a covert channel humans can't perceive but the machine obeys. For security-awareness trainers and curious hackers who want a visceral demo of image-based prompt injection.

## Problem
Adversarial typography and prompt-injection-via-image are a fast-emerging attack surface as agents gain vision. But the threat is abstract to most people until they *feel* it. There's no playful sandbox to build intuition, and security trainers lack a cheap, concrete demo they can point a room at. The arbitrage: running a vision model on a submitted image is trivially cheap for me; a legible-yet-divergent adversarial image is exactly what a workshop needs and can't easily make.

## How it works
You get a fixed human-target phrase for the day (e.g. "the cat is asleep"). In a canvas editor you type text and apply tricks: homoglyph swaps, sub-perceptual low-contrast overlays, adversarial pixel perturbation, kerning collisions, faint background glyphs. On submit, the server sends your rendered PNG to a real vision model for transcription. **Score = human-legibility × AI-divergence**: high if a person still reads the target clearly AND the model's transcript is far (edit distance) from it. Daily leaderboard of the most successful "whistles."

## Technical approach
Frontend: HTML5 canvas layer editor (React), export to PNG. Backend: Node calling a vision model transcription endpoint (Claude/GPT vision). AI-divergence = normalized Levenshtein between transcript and the human-target. Human-legibility proxy in v1: a lightweight local OCR (Tesseract) must still read the target above a threshold — this blocks the trivial "hide the text entirely" cheat. Data model: submissions {imageHash, targetPhrase, aiTranscript, legibilityScore, divergenceScore}. Hard part: a *stable, cheap* human-legibility proxy that isn't gamed by invisible text, and rate/cost control on model calls.

## v1 scope
- One fixed daily target phrase
- Canvas editor with text + contrast + homoglyph tools
- One vision model transcription on submit
- Tesseract legibility gate + edit-distance divergence score
- Single global daily leaderboard

## Out of scope
- Multi-model consensus scoring
- Real crowd human-legibility voting
- Mobile editor
- Persistent accounts

## Risks & unknowns
- Model updates shift what fools them, invalidating leaderboards
- Per-submission API cost and abuse (spam images)
- Tesseract is a weak stand-in for human vision; some fools slip through
- Dual-use optics — frame explicitly as defensive/awareness

## Done means
A user types text, applies adversarial styling, submits, and receives back the vision model's actual transcript plus a numeric score; two clearly different submissions produce clearly different scores; the day's best whistle sits atop the leaderboard.

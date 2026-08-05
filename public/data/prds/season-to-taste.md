## Overview
A web tool that turns a written menu or recipe into a generative score designed to shift how the food tastes. Twenty years of crossmodal-correspondence research shows people reliably rate the same food as sweeter under high-pitched consonant music and more bitter under low, rough, dissonant music — effect sizes around 5-10% on perceived intensity. That research lives in papers and one-off installations. This makes it a text box. For restaurants, supper-club hosts, coffee roasters, and anyone who wants their dinner party to be quietly rigged.

## Problem
"Sonic seasoning" is a real, replicated effect with a real commercial use, and there is no tool for it. A chef who reads about it has to hire a composer. Meanwhile every restaurant playlist is chosen by vibe alone, actively fighting the food — bass-heavy playlists over a delicate crudo measurably flatten it.

## How it works
1. Paste menu text, or a recipe URL. Each course is parsed into a dish with an ingredient list.
2. Each ingredient maps to a flavor vector across six axes: sweet, sour, salty, bitter, umami, fat/creaminess — plus texture (crisp, unctuous, effervescent) and temperature.
3. The vector drives a parameter set from the correspondence literature: sweet → high register, consonant intervals, legato, piano/bell timbre, slow-moderate tempo. Sour → high, fast, staccato, sharp attack. Bitter → low register, brass/distorted, dissonant intervals. Salty → mid, staccato, dry, percussive. Umami → mid-low, warm, sustained, harmonically rich. Fat → slow attack, heavy reverb tail, smoothed envelopes.
4. Output: a continuous, non-repeating generative piece per course, with crossfades timed to a course length you set. Export as a WAV per course, or run a live "service mode" page a tablet leaves open behind the bar.
5. An A/B toggle plays the inverse mapping so you can hear — and taste — the contrast. That's the demo that sells it.

## Technical approach
- Front end: SvelteKit; audio via Tone.js with a small set of hand-tuned instruments (FM bell, bowed pad, detuned brass, plucked string, filtered noise percussion).
- Ingredient → flavor vector: seed a lexicon of ~800 common ingredients from FooDB/FlavorDB compound classes plus hand-authored ratings, keyed by lemmatized n-gram match. Unmatched ingredients fall back to a Claude call that returns the six-axis vector as strict JSON, cached by ingredient string forever.
- Correspondence table: a versioned JSON encoding the mappings from Crisinel & Spence and Knöferle & Spence, with each row citing its paper. This file is the product's actual IP and must be auditable.
- Composition: per course, pick a mode and register band from the dominant flavor axis, then generate melody with a first-order Markov chain over scale degrees whose transition matrix is weighted by consonance (dissonance temperature = bitterness). Rhythm from a Euclidean generator with density from sourness/crispness. Reverb size from fat.
- Hard part: not sounding like a MIDI demo. The correspondence mapping is easy; making eight minutes of music that a real dining room will tolerate is the whole job. Needs voice-leading constraints, register separation, and a hard cap on event density.

## v1 scope
- Paste plain-text menu, one to five courses.
- Six flavor axes, one mapping table, four instruments.
- Browser playback only, plus the inverse A/B toggle.

## Out of scope
- Spotify/Sonos integration, WAV export, multi-room sync, accounts, mobile app.

## Risks & unknowns
- The effect is real but modest; the tool must not overclaim or it becomes wellness nonsense.
- Correspondences vary by culture — the recent cross-cultural work suggests the mappings are not universal, so the table may need locale variants.
- Generative music that's pleasant for 90 minutes is genuinely hard.

## Done means
A five-course menu pasted in produces five distinct pieces, and in a blind taste test with ten people eating identical dark chocolate under the bitter mapping vs. the sweet mapping, the sweet-mapping group rates it measurably sweeter.

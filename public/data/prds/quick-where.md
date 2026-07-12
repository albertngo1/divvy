## Overview
A daily browser guessing game for the curious and the geography-brained: you see a single crude sketch of an everyday object and must guess the country of the person who drew it. Sparked by the arXiv paper on cultural variation hidden in billions of human sketches — the twist is you *play against* that variation instead of reading a chart of it.

## Problem
That paper's finding — that people from different places draw the same 'plug' or 'bread' or 'house' in systematically different ways — is fascinating and completely inert as a PDF. There's a latent, delightful game in it that nobody has built: the drawing conventions are a fingerprint, and guessing the fingerprint is Geoguessr-shaped.

## How it works
Each round shows one vector sketch of a prompt word (e.g. 'traffic light', 'sock', 'mailbox'). You place a pin on a world map or pick from 5 candidate countries. Score by great-circle distance (à la Geoguessr) or exact match. Five rounds a day, same seed for everyone, emoji-grid share string. A post-round panel reveals *why*: 'Brazilians draw the mailbox as a wall slot; Americans draw a flag-mounted box' — turning each guess into a tiny lesson.

## Technical approach
Data is the unlock: Google's **Quick, Draw!** open dataset ships ~50M sketches as simplified stroke vectors, each tagged with the drawer's **country code**. Offline preprocess: filter to categories with high inter-country variance (compute per-category KL divergence of a cheap stroke-feature histogram — stroke count, bounding-box aspect, ink density, dominant angle — across countries; keep the top ~120 discriminative categories). Store selected sketches as compact `{word, country, strokes}` JSON, rendered client-side to canvas from stroke arrays (no image hosting). Frontend is a static SvelteKit/vanilla site; daily seed picks 5 (sketch, decoy-countries) tuples deterministically from date. Leaderboard optional via a tiny KV. Hard part: curating a set that's *guessable-but-not-trivial* — filter out sketches so ambiguous even a human can't, using an entropy threshold on a k-NN country classifier over stroke features.

## v1 scope
- Static site, one region-locked daily puzzle of 5 rounds
- 5-candidate multiple choice (skip the map for v1)
- Reveal card with the real country + a one-line convention note
- Emoji share string, localStorage streak

## Out of scope
- Global leaderboard, accounts, ELO
- Freehand map-pin distance scoring
- User-submitted drawings
- Mobile app

## Risks & unknowns
- Quick, Draw! country labels are self-reported and skewed toward US/EU — need to balance sampling or the game becomes 'guess USA'.
- Some categories are culturally flat (a circle is a circle); the variance filter must be honest.
- Licensing: Quick, Draw! data is CC-BY — fine, needs attribution.

## Done means
A stranger can load the URL, play 5 rounds, get a shareable score, and at least 3 of the 5 reveal-notes teach a real, checkable drawing-convention difference between countries.

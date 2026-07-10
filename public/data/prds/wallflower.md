## Overview
A drawing party game about disappearing, for 4–6 people who know each other. Everyone draws the same prompt, and the win condition is pure anonymity: be the one whose drawing nobody can attribute to you. The takeaway is a genuinely funny keepsake — a grid of a dozen nearly-identical houses.

## Problem
Every drawing party game (Drawful and its kin) rewards standing out: the funniest, most recognizable doodle wins. Nobody plays the *opposite* instinct — blending in, erasing your own hand, being pleasantly forgettable. That inversion is a fresh and weirdly calming tension, and the win is social (you vanished), not a number.

## How it works
The host shows ONE shared prompt and everyone draws the SAME object — "a house," "a cat," "a birthday cake." Each phone is a private canvas; you finger-draw your version, unseen by anyone. Your goal: draw the most median, generic version imaginable, indistinguishable from everyone else's. When all submit, the host displays the grid of near-identical drawings, anonymized and shuffled. Then each phone PRIVATELY attributes — for every drawing, tap who you think drew it (you know the people in the room). The server tallies how many people correctly fingered each artist. You WIN if you're among the least-identified — the wallflowers nobody could place. The artifact: the anonymized grid is a saveable, shareable image that's funnier the more identical it is. No scoreboard.

Private (phone): your canvas while drawing, then your secret attribution taps. Shared (host): the shuffled anonymized grid and the final "who blended in" reveal. One passed-around phone breaks it — drawing must be simultaneous and unseen, attribution independent and secret.

## Technical approach
Host tab + phone PWA + authoritative WS server. Data model: `Room{prompt, phase, drawings:{playerId->strokePaths}, guesses:{guesserId->{drawingId->guessedPlayerId}}}`. Drawings captured as vector strokes (pointer events) → compact JSON, rendered on both phone and host. Sync: phones push final stroke JSON on submit; server strips `playerId`, assigns anonymous `drawingId`s, randomizes order, and broadcasts the anonymized set to every phone for the attribution round; collect guess maps; compute per-artist correct-guess counts; broadcast reveal. The only real subtlety is anonymization hygiene — normalize canvas size and stroke color so *style*, not metadata or ordering, is the only possible tell. Keepsake export: host composites the grid via `canvas.toBlob` → PNG → QR.

## v1 scope
- 4 players, one fixed prompt
- One drawing round, one attribution round, one reveal
- One saveable grid PNG
- No timer tuning, no prompt selection

## Out of scope
Multiple rounds/prompts, cross-round scoring, brush/color options, undo beyond clear, a gallery, AI as the guesser.

## Risks & unknowns
Everyone may draw so identically it's a boring wash — mitigate with prompts that leave room for small tells, plus a small canvas and short timer that force character to leak. Attribution is random noise among people who don't know each other's art — this game needs friends. Core unknown: is "try to be forgettable" actually fun, or anticlimactic?

## Done means
Four phones each draw the same prompt unseen, the host shows an anonymized shuffled grid, each phone secretly attributes every drawing, and the host reveals which players nobody could identify — alongside a downloadable grid image.

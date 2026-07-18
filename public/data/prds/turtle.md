## Overview
Turtle is an online party game where players write short drawing programs — turtle-graphics or raw SVG paths — with **no live canvas**, then everyone sees the renders at once and guesses who drew what. It weaponizes the pelican-riding-a-bicycle benchmark's core joke: blindly describing an image as code is hilarious and hard.

## Problem
Drawing games reward manual dexterity and a good stylus. The Kimi K3 pelican-benchmark discourse showed there's a whole other skill — imagining an image and emitting it as code sight-unseen — that nobody competes at. It's funny *because* it goes wrong.

## How it works
Each round has a secret prompt ("cat in a boat"). Every player gets ~90s in a tiny editor with a constrained DSL (`forward`, `turn`, `arc`, `penup`, `color`) — the canvas stays blank until lock-in. On reveal, all drawings appear in a gallery; players guess which prompt each drawing was, from a shuffled list. Points for correct guesses and for being guessed correctly. An LLM can join as a fourth blind "artist" whose attempt you also rate.

## Technical approach
Web: React front end, a small deterministic DSL interpreter compiling to SVG (so renders are reproducible). Multiplayer over WebSocket (PartyKit or a tiny Node server). For the optional LLM player/guesser, rasterize SVG server-side with resvg to PNG and send to Claude with the image. Data model: `room`, `round`, `submission(code, svg)`, `guess`. The hard part is DSL design: expressive enough to be fun, constrained enough that blind coding is tractable and the humor lands — plus a fair scoring model for guesses.

## v1 scope
- 3–8 players, one room, turtle DSL only
- Human guessing only (no LLM yet)
- 5 rounds, shareable static gallery of the round's drawings

## Out of scope
- Matchmaking/lobbies, accounts
- LLM artist/guesser
- Mobile-optimized code editor

## Risks & unknowns
Blind coding can tip from funny to frustrating; the DSL learning curve gates the audience. The "no preview" constraint is load-bearing — tune timer and primitives so failures are charming, not punishing.

## Done means
Four people in a room finish a 5-round game, laugh at least twice, and the shareable gallery link renders every drawing correctly.

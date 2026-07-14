## Overview
Lethe is a cooperative two-player game about inventing a private symbol-language under a partner you can't fully talk to — with deliberate *forgetting* baked in as the core engine. Straight riff on the arXiv finding that forgetting improves conceptual alignment in coordination games. For couples, close friends, and anyone who likes Codenames' 'we think alike' rush.

## Problem
Convergence games (Codenames, Wavelength) reward pairs who already share references; they don't *build* shared meaning, they test it. And they punish memory loss. Lethe inverts it: the interesting alignment only emerges when your first, lazy, in-joke shorthand gets wiped and you're forced to re-encode a concept more abstractly. Nobody's turned 'forgetting' into a mechanic.

## How it works
Each round the Sender is shown a concept card (an abstract noun, an emotion, an opening line from literature). They draw a tiny glyph or pick from a constrained stroke-palette — no letters, no existing words — to encode it, and it enters the shared codebook. The Receiver guesses. Over rounds you accrete a private visual dialect. Then the Lethe rule fires: after every few rounds the game silently *forgets* a fraction of codebook entries (grays them out, unusable), and old concepts recur. You can't reuse the erased glyph; you must re-encode — and the paper's result is the payoff, that these forced re-encodings are where abstraction and genuine alignment happen. Score rewards fast mutual recognition of *re-encoded* concepts more than first-time ones.

## Technical approach
Pure client-side web app (Svelte + canvas), two phones over a peer link (WebRTC via PeerJS, or a tiny relay). Glyph capture: pointer strokes normalized to a fixed grid, stored as polylines. Concept deck: bundled JSON mixing abstract nouns, emotion words, and public-domain opening lines (scraped once, à la verbaprima). The forgetting scheduler is a seeded function over round number that marks codebook entries `retired`; a spaced-recall system re-surfaces retired concepts to force re-encoding. Scoring: recognition latency + a bonus multiplier when the concept was previously encoded-then-forgotten. Hard part: tuning the forget rate — too aggressive and it's frustrating, too gentle and you never re-align. Needs a 'half-life' knob and playtesting to find the sweet spot the paper implies exists.

## v1 scope
- Two-device WebRTC session, no accounts
- 40-card concept deck, stroke-palette glyph editor
- Shared codebook with retire-on-schedule forgetting
- Score with re-encoding bonus, end-of-game 'dialect' recap image

## Out of scope
- 3+ players, spectators
- AI partner
- Persistent cross-session dictionaries

## Risks & unknowns
- Forget-rate tuning is the whole game; could feel arbitrary
- Glyph input on phones may be fiddly; palette vs. freedraw tradeoff
- Does the paper's effect actually feel *fun*, not just measurable

## Done means
Two phones pair, play 12 rounds where at least 3 concepts are forgotten and recur, the re-encoding bonus fires correctly, and the end screen shows the evolved glyph dialect as a shareable card.

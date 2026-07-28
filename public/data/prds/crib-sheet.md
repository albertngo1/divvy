## Overview
A single-player dungeon roguelike for people who love systems games and hate grinding for permanent stat upgrades. There is no meta-progression tree, no unlock currency, no "+3% crit forever." Between runs you get one index card. Whatever you wrote on it is what your character knows.

## Problem
Roguelike meta-progression is a lie: the game withholds knowledge you already have and sells it back as a currency. Meanwhile the actual skill — remembering that the Ash Priest telegraphs its grab with a half-step *backward* — lives in the player's head and dies when they take a two-week break. The paper on student cheat sheets nailed the real dynamic: the act of *authoring* a compressed reference is the learning. Nobody has made that the loop.

## How it works
The game holds ~300 knowledge atoms: enemy tells, reagent combinations, merchant scams, altar costs, boss phase triggers. When the UI would normally show a tooltip or an item description, it instead queries your card. If a line on your card semantically covers that atom, the tooltip renders — verbatim in your own words, in your own layout. If not, you get a blank box and a question mark.

The card is a fixed area. You cannot hoard: the editor sums glyph bounding boxes and hard-stops at 45% ink coverage of a 3×5 card. To add, you delete. And each card line binds to at most two atoms per run, so "watch for the tell" as a catch-all does nothing.

At run start you may instead **take** a pregenerated card (from the in-game TA, or an exported card from another player's save). Taking costs you a permanent run modifier — cheaper start, worse growth. Make or take, priced.

## Technical approach
TypeScript + Vite, seeded deterministic sim, no server. Atom embeddings (all-MiniLM-L6-v2, quantized) precomputed at build time; card lines embedded at edit-time in a web worker via transformers.js. Binding requires **both** cosine > τ ≈ 0.62 **and** at least one shared IDF-weighted rare token, which kills generic-phrase exploits. Card editor is a canvas with a real area budget; card state is a JSON doc versioned per run so a death shows you a diff of what you wished you'd written.

The genuinely hard part is fairness calibration: τ too low and "stuff about fire" unlocks the fire chapter; τ too high and correct-but-terse shorthand fails and the player feels cheated. Ship with a card lint that shows, live, which atoms a line currently binds.

## v1 scope
- One 8-floor dungeon, 12 enemies, 2 bosses
- 40 knowledge atoms, hand-written
- Typed cards only, one card slot
- Post-death screen: "you died to an atom you didn't write down"

## Out of scope
Handwriting/OCR cards, card sharing marketplace, mobile, procedural atoms.

## Risks & unknowns
Blank tooltips may read as a bug rather than a mechanic — needs loud onboarding. Embedding matching could feel arbitrary; the lint is the mitigation. Players may just wiki it, which is fine: transcribing the wiki onto a finite card is still the game.

## Done means
A playtester who has died three times can point at a specific card edit they made and explain why it saved the fourth run — without the phrase "I unlocked."

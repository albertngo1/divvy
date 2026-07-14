## Overview
Potluck is a simultaneous-commit reasoning game for 3–6 players — distributed graph-coloring disguised as planning a dinner. The whole table wins only if everyone brings something different, but each player can only 'cook' from a private, asymmetric menu, so you can't just agree to number off.

## Problem
'Everyone bring something different' is a real, familiar coordination pain — and the classic anti-coordination party bit ('nobody say the same number') is trivial once you can talk. Potluck makes it a genuine puzzle by giving each player DIFFERENT private capabilities, so no simple shared rule solves it and collisions are earned mistakes, not luck.

## How it works
The host TV shows the table: a row of dish-category slots (e.g. Salad, Bread, Roast, Dessert, Cheese) and, as commits land, which slots are filling. Each phone PRIVATELY shows only that player's allowed dishes — a subset of all categories, different per player (player A can make {Salad, Bread, Dessert}; player B can make {Bread, Roast}). You pick exactly one and lock it, blind to everyone else's menu and choice.

On reveal, any dish chosen by two or more players SPOILS — those players score zero and the slot is ruined on the TV with a comic splat. A dish chosen by exactly one player is served (points). The room wins a clean spread only if all commits are unique. The reasoning is real: you weigh 'this dish is rare on MY menu, so it's probably rare on others' — grab it' against 'Bread is common, everyone can make Bread, so avoid it.' The private, non-uniform palettes are the entire point — pass one phone around and the puzzle collapses because there'd be no simultaneity or hidden asymmetry.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare DO). Data model: `Room {dishes: string[], palettes: {playerId: dishId[]}, commits: {playerId: dishId}}`. At round start the DO deals palettes from a curated deck ensuring a solvable-but-tight instance: a valid all-unique assignment exists but at least one dish is contested across ≥2 palettes (so naive greedy fails). Phones fetch only their own palette. Commits are held server-side and revealed simultaneously — the sync is easy (one barrier). The genuinely hard part is INSTANCE GENERATION: procedurally dealing palettes that are always solvable, never trivially so, and 'interesting' (forcing at least one real deduction), verified by a quick constraint check (does a perfect matching exist? is it non-obvious?) before dealing.

## v1 scope
- One round, 3–4 players
- Hand-authored pool of ~8 dishes; palettes dealt from a small vetted set of pre-solved instances (no live generator yet)
- Simultaneous lock + reveal; spoil animation; win/lose

## Out of scope
- Live procedural instance generator (use fixed vetted deals in v1)
- Multi-round campaign, scoring ladder, difficulty tiers
- Any chat/negotiation channel

## Risks & unknowns
- Balancing tightness: too loose = boring, too tight = feels like a coin flip
- Whether 3 players give enough constraint tension (may need 4–5)
- Communicating 'your menu is different from theirs' clearly on the phone

## Done means
4 phones + TV: each phone shows a distinct palette, all four lock a choice blind, the reveal correctly spoils any duplicate with a splat and serves uniques, and at least one vetted deal demonstrably punishes the naive 'grab the rarest-looking slot' heuristic.

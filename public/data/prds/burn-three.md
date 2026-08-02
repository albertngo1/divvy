## Overview
A short, turn-based, single-player roguelike where every random number in the game comes from one shared, visible tape. A strip down the left edge shows the next 24 values as colored bars. Every action — yours and every enemy's — consumes a known number of them. You cannot change the values. You can only change who gets them.

## Problem
RNG manipulation is the most beloved skill in speedrunning and it is completely invisible to normal players. Meanwhile roguelikes hide their randomness and then apologize for it with pity timers and mercy invulnerability. Burn Three does the opposite: it puts the entropy on screen and makes shoving it around the entire game.

## How it works
Each action declares its draw cost up front. Step: 0. Swing: 1. Kick: 2. Bomb: 3. Enemies act after you and their cost is printed on their card. An outcome resolves by comparing the drawn value against a threshold shown on the tooltip. So a turn reads like a plan: *if I step, the wolf's lunge eats the 0.04 and my swing lands on the 0.91.* Burning a cheap action to shift the tape by one is the core verb — the title is what you say out loud.

Tension comes from fog. Past value 12 the bars render as blurred quantile bands. A few effects (crit tables, poison ticks) consume a variable count, so long plans decay. Items are tape editors, not stat sticks: Splice swaps two upcoming values, Rewind rolls the counter back three at the cost of HP, Sieve deletes everything under 0.2 and takes a wound per deletion. The floor boss's gimmick is stealing your horizon — it shortens the visible strip every time it hits you.

## Technical approach
TypeScript + Vite, DOM and CSS for the board, no engine. State is a plain object plus a PCG32 instance with an explicit call counter; the counter *is* game state, so undo, replay, and save are all just snapshots of `{state, counter}`. The one hard invariant: nothing may consume randomness except through the tape API. Enforced by an ESLint rule banning `Math.random` and by passing the generator explicitly rather than importing a singleton. Replays are `seed + input list` and reproduce bit-identically, which doubles as the bug report format.

Level QA runs an IDA* search over action sequences to depth ~10 against the exact tape a seed produces, so every generated room is verified winnable, verified *not* winnable by mashing, and auto-tuned by nudging thresholds until the solver needs at least three burn actions. The genuinely hard part is that full information turns the game into arithmetic; horizon length and variable-cost effects are the two knobs that keep it a game instead of a spreadsheet.

## v1 scope
- One room, one floor, no procgen beyond enemy placement
- Three enemy types, four player actions
- Tape of 24, fully visible, no fog
- Win condition: clear the room. No items, no meta.

## Out of scope
Meta-progression, unlocks, art beyond colored rectangles, sound, mobile layout, multiple floors.

## Risks & unknowns
Legibility is everything — if players can't instantly see what consumes what, the mechanic reads as noise. Full visibility may collapse into tedium; fog may just feel like ordinary hidden RNG wearing a costume. The solver may surface a degenerate line that trivializes every room.

## Done means
A first-time player, before committing a turn, can point at the strip and correctly state which enemy is about to miss and why — and a seed plus input log replays to the identical final state.

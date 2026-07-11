## Overview
A nutrition micro-game that grafts Valheim's beloved food mechanic onto real eating. You hold three 'food slots'; every logged meal fills a slot and grants decaying stat bars (Health / Stamina / Focus). Same food twice? Wasted slot. For people who find calorie apps joyless but would happily min-max a buff bar.

## Problem
MyFitnessPal-style logging is a chore of guilt and gram-counting. What actually matters for most people is boring: eat a variety of real foods, spaced through the day. Valheim already solved the *fun* of that loop — three distinct foods, no stacking duplicates, buffs that fade so you re-eat — and millions internalized it. Nobody has pointed that loop at real life, where 'eat three different things' is genuinely good advice.

## How it works
You log a meal by picking from a food list (or free-typing). It occupies one of three slots and contributes to three bars: Health (protein/produce density), Stamina (carbs/calories), Focus (protein + hydration + micronutrient variety). Each slot's contribution decays linearly over that food's satiety window (a snack ~1h, a full meal ~4h). Eating a food already in a slot refreshes only if it's the *same* slot — logging a duplicate while all three are distinct wastes it, nudging variety. A live HUD shows your three bars ticking down; the game is keeping all three topped by eating varied, well-timed meals. Daily 'Rested'-style bonus for hitting variety + spacing goals.

## Technical approach
Local-first PWA (SvelteKit or React + IndexedDB). Food-to-stat mapping seeded from a trimmed USDA FoodData Central export (protein/carb/fat/fiber per 100g), bucketed into the three bars via a simple weighting formula; free-typed foods fuzzy-match to the nearest entry. Decay is pure client-side interpolation from each slot's `filledAt` timestamp and a per-food `satietyMinutes`. The buff bars re-render on a requestAnimationFrame tick. The only real data structure is `slots[3] = {foodId, filledAt, contributions}`; no backend needed for v1. Hardest part is tuning the stat formula and satiety windows so it *feels* like Valheim without pretending to be a real dietary tool.

## v1 scope
- Three slots, three decaying bars, a searchable ~500-food list
- Duplicate-slot 'wasted' feedback and a daily variety bonus
- Everything in localStorage, one screen

## Out of scope
- Calorie targets, macros goals, weight tracking
- Barcode scanning, restaurant DBs, wearables sync
- Multiplayer / leaderboards

## Risks & unknowns
- Fine line between 'delightful toy' and 'implying medical advice' — keep it explicitly playful
- Satiety-window tuning is subjective; may need a couple iterations
- Will people log consistently, or does it die like every food app?

## Done means
A user can log three distinct real meals across a day, watch three buff bars fill and decay on the correct timescales, get 'wasted slot' feedback for a duplicate, and earn the daily variety bonus — all offline.

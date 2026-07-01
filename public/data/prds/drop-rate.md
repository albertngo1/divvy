## Overview
Drop Rate steals the loot-rarity system from ARPGs (Grim Dawn, PAYDAY 2, Diablo) and bolts it onto your actual spending. Every item you buy is rolled into a tier — Common, Magic, Rare, Epic, Legendary — based not on price but on *cost-per-use over time*. It's for people who feel vague buyer's remorse but never quantify it, and who respond to a color-coded loot beam more than a spreadsheet.

## Problem
Budgeting apps tell you *what* you spent; they never tell you whether it was *worth it*. A $12 spatula used daily for two years is one of the best purchases of your life; a $180 sous-vide used once is a disaster — but both are just line items in Mint. The signal we actually crave is the dopamine of a good drop, and the shame of a gray. Nobody has gamified value-per-use.

## How it works
You log a purchase (name, price, category) and, crucially, tap a widget every time you *use* it — one tap. Drop Rate computes cost-per-use = price / uses, ages it by time owned, and maps it to a rarity tier with a satisfying reveal animation and a loot-beam color. Your "stash" is a grid of owned items sorted by rarity; Legendaries get a glow, grays get a "vendor this?" prompt (donate/sell nudge). A monthly "loot recap" shows your best and worst drops and your overall drop rate (% of spend that turned Rare+).

## Technical approach
Stack: local-first PWA — Svelte or vanilla JS + IndexedDB, no backend, installable on phone. Data model: `Item {id, name, price, boughtAt, category, uses[]}`. Rarity is a pure function: `cpu = price / max(uses,1)`; tier thresholds are category-relative (a $2/use tier for kitchenware differs from electronics), computed as quantiles over the user's own history so it self-calibrates. The loot-beam reveal is a CSS/canvas animation keyed to tier. The hard part is *frictionless use-logging* — no one will open an app to tap "used spatula." Solve with home-screen shortcuts / an NFC-tag option (tap phone to a sticker on the item) and optional geofence auto-increment for location-bound items (gym membership pings a use when you enter the gym).

## v1 scope
- Manual add-item, manual +1-use tap
- Cost-per-use → 5-tier rarity with reveal animation
- Stash grid sorted by rarity, IndexedDB persistence
- Monthly recap screen (best/worst drop)

## Out of scope
- Bank/receipt import, NFC/geofence auto-logging, multiplayer/leaderboards, cloud sync, actual resale integration.

## Risks & unknowns
- Use-logging friction is the whole ballgame; if people don't tap, cost-per-use is garbage.
- Category quantile thresholds may feel arbitrary until there's enough data.
- Could feel judgmental — tone must be playful, not scolding.

## Done means
I can add three items, tap uses over a week, and see them sort into distinct rarity tiers with the correct cost-per-use math; a fresh Legendary triggers the loot-beam reveal; and the monthly recap correctly names my best and worst drop from the logged data.

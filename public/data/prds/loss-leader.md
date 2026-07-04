## Overview
A browser tycoon about running a Costco-style membership warehouse, for people who love shop-sims but are tired of every one of them rewarding endless catalog bloat. Sparked by the HN "Costco is the anti-Amazon" piece.

## Problem
Every store tycoon (from Supermarket Simulator to your average idle) pushes you toward MORE: more SKUs, more upsells, infinite shelves. Costco proved the opposite works — a curated ~4,000-item club, a hard markup ceiling, loss-leader chicken, and a business model that lives or dies on membership renewal. No game models scarcity-as-strategy, where saying "no" to a supplier is the smart play.

## How it works
You run one warehouse with a HARD cap on aisle slots. Each candidate SKU has cost, margin, footfall pull, perishability, and a "treasure-hunt delight" value. You enforce a self-imposed markup ceiling (Costco's famous 14% rule). Loss leaders — a rotisserie chicken sold below cost — pull members through the door where they buy high-pull staples. Seasonal treasure-hunt items rotate to keep novelty alive. Win condition: membership renewal rate and member count at season end, NOT quarterly margin. Suppliers constantly pitch you; the game is mostly about refusing them.

## Technical approach
TypeScript + Pixi.js for rendering, a tiny hand-rolled ECS, deterministic weekly-tick simulation. Member agents carry `{trust, novelty_appetite, stockout_tolerance}`; each tick they shop, and renewal probability is a logistic function of rolling satisfaction (price trust + hunt novelty − stockouts). Data model: `SKU{cost, price, pull, delight, perishable, slot}`, `Member{...}`, `Aisle{slots[]}`. The genuinely hard part is balance tuning: catalog bloat must measurably *lower* renewal (dilutes trust, raises stockouts, kills the hunt) so the constraint is truly optimal, not a gimmick. Save to localStorage.

## v1 scope
- Single warehouse, 40 aisle slots
- 200 simulated members, 12-week season
- One loss-leader mechanic + one rotating treasure-hunt slot
- Renewal-rate score screen at end of season

## Out of scope
- Multiple stores, e-commerce, employees, real supply-chain logistics
- Art beyond simple sprites/icons
- Multiplayer or leaderboards

## Risks & unknowns
- Is a constraint-driven tycoon actually *fun*, or just restrictive?
- Legibility: players must feel *why* renewal dropped, or it reads as random.
- Balance so 40 curated slots beat 40 high-margin-junk slots without hand-holding.

## Done means
You can play a full 12-week season, and a strategy of curating <40 items with one loss leader produces a demonstrably higher end-of-season renewal rate than stuffing all 40 slots with high-margin impulse junk — verified across three seeded playthroughs.

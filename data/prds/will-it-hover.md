## Overview
A static web calculator that verdicts a DIY multirotor parts list *before* you buy or solder anything — aimed at first-time builders like the octocopter-from-scratch blogger who had no prior hardware experience.

## Problem
Novices pair mismatched motors, props, and batteries, then discover on the field that the craft won't lift, tips over, or flies for 90 seconds. The feedback loop is slow and expensive: crashed carbon, popped LiPos, wasted weekends. The physics that would've flagged it is simple but nobody runs the numbers.

## How it works
Pick frame size, motor, prop, battery (cells + mAh), and a target all-up-weight from dropdowns. It computes thrust-to-weight ratio, hover throttle %, and estimated hover time, then prints a blunt verdict: **"WON'T HOVER — T/W 0.8"**, **"Sluggish (T/W 1.9)"**, or **"Twitchy but flyable (T/W 4.2)"**, and names the single limiting factor ("battery can't source peak current").

## Technical approach
Static site (Svelte or vanilla + Vite). The component DB is seeded from public thrust data: manufacturer test tables (T-Motor, iFlight) and community stands (Miniquad Test Bench, rcbenchmark logs) parsed CSV→JSON as `motor+prop+voltage → [{throttle, thrust_g, current_A}]`. Hover thrust = AUW/motorCount; interpolate the throttle that yields it; hover time = `(mAh × 0.8 / 1000) / (hover_current × motors) × 60`. A C-rating check flags if peak current exceeds the pack. The genuinely hard part is data coverage and quality across the motor × prop × cell matrix, and honest interpolation between tested props.

## v1 scope
- ~15 popular motors, ~8 props, LiPo 3S–6S
- One flight regime: hover (T/W, throttle %, time) + verdict + limiting factor
- Curated, known-good data combos only

## Out of scope
- Full flight dynamics, wind, aggressive maneuvers, payload delivery
- Fixed-wing, autonomy, BOM pricing/links

## Risks & unknowns
Bad data yields a dangerously wrong "it'll fly" — must be framed as an estimator, not a guarantee. Sparse coverage for uncommon combos forces "no data" honesty over guessing.

## Done means
Enter a real, known build (e.g. 5" quad, 4S, 2207/1750kv, 5043 props) and the predicted hover throttle and flight time land within ±20% of an actual bench or field measurement.

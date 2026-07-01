## Overview
A browser drone-building sandbox: pick motors, props, battery, and frame from real component datasheets and immediately see whether your multirotor hovers, for how long, and whether it meets a mission. For makers chasing the build-an-octocopter-from-scratch dream who'd rather fail in a sim than on a $600 parts order.

## Problem
Building a drone means guessing whether components match — will these motors lift this frame on this battery for a useful time? Tools like eCalc answer this but feel like a tax form, not play. Make the physics legible, tactile, and a little fun.

## How it works
Drag components onto an airframe. The sim computes all-up weight, thrust-to-weight ratio, hover throttle, current draw, and estimated flight time from real motor Kv, prop thrust curves, and battery specs. A mission panel sets goals — "lift a 400g camera, fly 8 minutes, survive a 20 km/h gust." Green/red gauges show pass/fail. A lightweight physics view flies the craft so you feel your margins, and "cursed" builds (eight motors, a tiny battery) unlock for laughs.

## Technical approach
React + three.js + a physics lib (rapier or cannon-es). Component DB seeded from public data — motor Kv/max current, APC prop thrust tables, LiPo capacity/C-ratings — as curated JSON. Core math: per-motor thrust from prop thrust-coefficient × RPM² (RPM ≈ Kv × voltage × throttle), summed against weight for TWR; hover throttle solves thrust = weight; flight time = battery Wh × usable fraction ÷ hover power. Flight sim: a rigid body with per-motor thrust vectors and a simple PID attitude hold so it visibly stabilizes or tips. The hard part is sourcing and curating *trustworthy* component data and making the thrust model accurate enough to teach without a wind tunnel.

## v1 scope
- Quadcopter only
- Fixed list of ~8 motors, ~4 props, ~3 batteries
- Compute TWR + estimated hover time
- One mission with static pass/fail gauges

## Out of scope
- Hexa/octo frames
- 3D flight physics view and PID sim
- Custom part import
- Aerodynamics, gusts, wind

## Risks & unknowns
- Bad component data → confidently wrong results (must cite sources)
- Thrust model is a simplification of real prop aerodynamics
- Scope creep toward a full flight simulator

## Done means
You can select a valid quad configuration and the app reports TWR and estimated hover time within the same ballpark as eCalc for identical parts, and flags an under-powered build as failing its mission.

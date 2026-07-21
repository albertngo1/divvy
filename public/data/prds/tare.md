## Overview
A real-time cooperative-with-traitor game for 4-5 players. Everyone is a sensor operator on a single shared machine, watching a private live gauge and holding one control. The imposter's gauge reads *biased* — offset just enough that, believing their own instrument, they keep giving the group wrong instructions. The crew must hold the machine stable AND deduce whose readings can't be trusted.

## Problem
Co-op "keep the thing alive" games (Spaceteam, Keep Talking and Nobody Explodes) have no traitor; hidden-role games almost never sit on top of a live cooperative task. Fuse them: a shared system you can only stabilize by talking, where one operator's instruments lie — so their *honest* help sabotages you, and you have to find them before the core cooks.

## How it works
The machine is a reactor core whose temperature drifts. **The host screen shows (shared):** only a coarse public status — green/amber/red — plus a health sparkline and a countdown. No numbers, no per-operator data.

**Each phone shows PRIVATELY:** a live gauge of the same underlying core value, rendered as a qualitative band + trend arrow ("hot, rising"), never a raw integer; plus one control the player owns (a vent or valve). Crew gauges track truth ± tiny noise. The imposter's gauge carries a constant bias, so their band reads a step hotter/cooler than reality — and they don't know it.

Because no one sees anyone else's gauge or the true value (only the public color), players must talk: "mine's redlining, I'm venting." The imposter keeps recommending the wrong direction. Over ~90s the group nudges controls to hold the green while inferring who steers wrong. At the end they vote. **Win = core survived AND imposter identified.** Qualitative bands (not raw numbers) mean a constant offset isn't a blurt-away giveaway — it surfaces only as a *pattern* of bad calls.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object) running the sim tick server-side at ~10Hz. Model: `room { coreValue, target, controls{seat->setting}, biasBySeat, phase, timer }`. Each tick the server integrates coreValue from all controls, then sends each phone *its own* biased view. The hard part is genuine real-time sync: a server-authoritative sim pushing per-seat transformed views at 10Hz over mobile WS latency, with bias tuned subtle enough to hide yet strong enough to matter — and a sim controllable by novices so any failure reads as *social*, not mechanical.

## v1 scope
- 4 players, one 90-second round
- One core, one bias type (constant offset), one control each
- Qualitative band + trend display only
- Single vote at the end, host reveal

## Out of scope
- Multiple machines or bias types
- Difficulty scaling, scoring, streaks
- Mid-sim reconnection handling
- Raw-number instrument modes

## Risks & unknowns
- Sim tuned too hard or too easy
- Bias too obvious (someone reads a value aloud) or too weak to matter
- Real-time WS jank on phones
- If the crew simply ignores one operator, deduction becomes trivial — the machine must be hard enough that ignoring anyone hurts

## Done means
Four phones each drive a live gauge and control, exactly one biased; a 90s server-authoritative sim runs while the host shows only coarse health; the group holds the core green and votes; the host reveals the biased seat and win/lose — end-to-end on real devices.

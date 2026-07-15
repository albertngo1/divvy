## Overview
Peak Load is a 3–5 player real-time cooperative panic game for a shared host screen (TV) plus phones as private controllers. You are roommates sharing one overloaded electrical circuit, each trying to finish your own laundry-and-dishes list without tripping the breaker on everyone else.

## Problem
Most co-op party games let you SEE what teammates are doing and just talk it out. The itch here is contention over an invisible shared resource: you can feel the aggregate strain but can't see who's causing it, so the only tool is silent, nervous restraint. Collisions — two people running high-draw appliances at the same instant — are the failure, and they're punishing because they reset progress.

## How it works
Each phone privately deals a hand of 3–4 appliances (microwave 900W/8s, dryer 1500W/20s, kettle 1200W/6s…). Each appliance, once tapped, draws its wattage continuously for its full run time, then completes. Every player must complete their whole private hand before a 90s round timer.

The host TV shows ONLY the aggregate: a live amperage needle sweeping toward a red BREAKER LIMIT line, plus a per-player 'chores done' row of dots. It never shows who is drawing what.

Each phone PRIVATELY shows: your own appliance buttons (with wattage + run-time), which of yours are currently running, and your remaining checklist. You cannot see anyone else's appliances or intentions.

If, at any instant, the summed instantaneous draw exceeds the breaker limit, the breaker TRIPS: every appliance currently running (for everyone) resets to un-run, and a 3s blackout lockout hits. So you learn to stagger — start your dryer, watch the needle, and hold your kettle until the needle dips, trusting others are doing the same. Win when all checklists clear before the timer.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room {breakerLimit, timer, players[]}; Player {id, appliances[{id,watts,runMs,state:idle|running|done, startedAt}]}. The server ticks at ~20Hz, sums instantaneous draw across all running appliances, and is the sole authority on trips (clients never decide). Sync: phones send tap intents (start appliance); server validates and broadcasts a compact aggregate frame (total watts, tripped bool, each player's done-count) to the host, and per-appliance state deltas privately to each owning phone. Genuinely hard part: fair trip attribution under latency — a tap that 'lands' server-side after the needle already spiked shouldn't feel arbitrarily unfair, so the server uses its own receive-timestamps and a tiny grace band, and animates the needle from server frames so every phone sees the same rising strain.

## v1 scope
- 3 players, one 90s round, one fixed breaker limit.
- 3 appliances per player, hard-coded wattages tuned so the instance is solvable only by staggering.
- Host needle + done-dots; phones show buttons + checklist only.
- Trip = reset running appliances + 3s lockout.

## Out of scope
- Matchmaking, accounts, multiple rounds, difficulty tiers.
- Sound design beyond a trip 'clunk'.
- Appliance variety / power-ups.

## Risks & unknowns
- Latency fairness on trips could feel cheap; needs the server-authoritative grace band tested on real phones.
- Instance tuning: too loose = trivial, too tight = unwinnable frustration.
- Without any per-player feedback on who tripped it, blame could sour the room — the anonymity is the design, but needs playtesting.

## Done means
Three phones join via a room code; each sees a distinct private appliance hand; simultaneous over-limit draw trips the breaker and resets running appliances for all within one server tick; and a room that carefully staggers can clear all three checklists before the timer and see a WIN on the host screen.

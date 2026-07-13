## Overview
Rolling Blackout is a 3–4 player concurrent-room game (host TV + private phones) about congestion, not exclusion. Everyone shares one power grid with a hard capacity ceiling; the challenge is that you each *must* run your own appliances, and running them at the same time trips the breaker.

## Problem
Anti-coordination games usually punish two people picking the *same thing*. This one punishes two people acting at the same *time* while pulling from a shared budget — a congestion/tragedy-of-the-commons itch. You can see the grid is nearly maxed, but not who is about to spike it, so you can never safely fire up your dryer.

## How it works
The grid has a capacity (e.g. 3000W). Each player must complete their whole appliance queue before a 2-minute clock runs out.

**Each phone shows PRIVATELY:** your appliance queue — a handful of cards (Kettle 1500W/8s, Dryer 2500W/15s, Toaster 900W/5s…), each showing its wattage and run-duration, and which one you currently have switched ON. Only you know your loads and their sizes.

**The host TV shows PUBLICLY:** a single live total-wattage meter with a red capacity line, and a count of appliances each player still has left (a number, never *which*). When you toggle an appliance ON it must run its full duration uninterrupted to complete.

If, on any tick, total draw exceeds capacity, the **breaker trips**: a public blackout, a forced 5-second grid reset during which nobody can draw, and every appliance that was mid-cycle loses its progress and must be restarted. So you stagger: watch the aggregate meter, guess the headroom, sneak your big loads into the gaps others leave. Two players both firing a 2500W dryer into a 3000W grid = instant trip that burns both their progress.

Win: all queues finished before time. A 'clean run' (zero trips caused while you held a load) is a bonus; last player still holding loads at time-out is the goat.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object; Socket.IO over Tailscale Serve locally).

**Data model:** `Room{capacity, totalDraw, players:{id, queue:[{watts,dur,progress,on}], remaining}}`. Queues are private to each owner; the server only broadcasts `totalDraw` and per-player `remaining` counts.

**Sync:** server ticks at 10Hz, advancing `progress` on every ON appliance and summing `totalDraw`. Phones send `toggle(applianceId)`. On each tick the server checks `totalDraw > capacity`; if so it enters a `tripped` state, zeroes in-progress `progress`, forces all `on=false`, and broadcasts a blackout for 5s. Host renders the meter from the public slice; each phone renders its own queue from its private slice.

**Genuinely hard part:** attributing 'who caused the trip' fairly under latency — a toggle that arrives a tick late shouldn't scapegoat someone. The server evaluates the trip on the resolved post-tick sum and marks *every* appliance that was ON at the overload as complicit, so simultaneity is collectively punished (thematically right) rather than blamed on the unluckiest packet.

## v1 scope
- 3 players, one 2-minute round.
- 3 appliances per player, fixed wattages, fixed capacity.
- Host: one wattage meter + capacity line + blackout animation + per-player remaining counts.
- Phone: queue of appliance toggle cards with progress rings.

## Out of scope
- Variable capacity, time-of-day pricing, per-player scoring history.
- Any chat/signaling; multi-round tournaments; appliance draft.

## Risks & unknowns
- Does the aggregate-only meter give enough signal to stagger, or does it feel like flailing? (May need a short 'ramp' animation so spikes are legible.)
- Griefing: a player could hog by firing big loads early; the clean-run bonus is meant to disincentivize this — needs playtest.
- 10Hz progress sync bandwidth with 4 phones on flaky wifi.

## Done means
3 phones join via QR; each sees a private appliance queue; the public meter sums live draw; two big simultaneous loads push past the capacity line, trigger a visible blackout, and zero both offenders' in-progress appliances; staggered play lets all queues finish and the host declares the round complete with a clean-run callout.

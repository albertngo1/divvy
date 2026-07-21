## Overview
A 3-player cooperative real-time triage game. Each player is an emergency dispatcher with their own flood of incoming calls; all three share one tiny pool of response units. The fun is the 90 seconds of overlapping shouting where you argue whose crisis outranks whose for the last free ambulance.

## Problem
Devils & the Details nails 'everyone busy at once, screaming for shared stuff,' but most digital riffs either make the shared resources visible-to-all (so no negotiation needed) or the private tasks solo-able (so no shouting). The itch: shared scarcity you can all SEE, paired with private urgency only YOU can see — the exact combination that forces you to announce your situation aloud to arbitrate.

## How it works
- **Each dispatcher's phone (PRIVATE):** a live queue of incoming calls. Every call shows a type (CARDIAC, STRUCTURE FIRE, cat-in-tree) and a **hidden severity** and a countdown to 'goes critical' that ONLY you can see. Calls arrive on all three phones simultaneously and independently.
- **Host TV (SHARED):** the UNIT BOARD — e.g. 2 ambulances, 1 fire truck, 1 patrol car — each showing free/busy and a busy-timer once dispatched. Also the shared team score and the wave clock. Everyone sees the board; nobody sees anyone else's severities.
To resolve a call you tap-assign a matching free unit. Because units are scarce and shared, a tap is a first-come atomic grab — so when only one ambulance is free and two of you have cardiac calls, you MUST say your severity out loud to decide who takes it and who eats the wait ("mine's a code red, thirty seconds to critical — hold yours!"). A call that hits zero before it's served spikes a shared penalty. Voice is the only channel that surfaces private priority, so the room negotiates continuously. Cooperative: one team score, but scarcity manufactures the conflict.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. **Data model:** room{units:[{id,type,busyUntil,heldBy}], scriptedWave:[{t,dispatcherId,type,severity,criticalAt}], score}. **Sync:** server owns the unit pool and streams board state at ~10Hz; each phone gets only its own call queue over a private channel. **Hard part:** atomic unit claims under contention — two near-simultaneous taps for the last ambulance must resolve to exactly one winner deterministically (server timestamps, RTT-normalized), with the loser's phone instantly reflecting 'taken.' Plus tuning wave arrivals so contention *peaks* land where negotiation is forced, not constant.

## v1 scope
- Exactly 3 dispatchers, one 90-second wave (~12 scripted calls), one round.
- 4 units, 3 call types, 3 severity tiers.
- One team score + a 'calls dropped' count.

## Out of scope
- 4+ players, unit types beyond four, map/geography.
- Real audio calls, ASR, difficulty ramps, campaign.
- Any competitive/traitor variant.

## Risks & unknowns
- If units aren't scarce enough, players never talk; too scarce and it's hopeless — arrival tuning is the whole game.
- Players might silently grab-race instead of negotiating; the UI must make 'announce your severity' the obviously-better strategy.
- Atomic claim correctness under phone latency.

## Done means
Three phones on a LAN run one wave: each sees only their own calls' severities, all see the shared board, and at least one moment forces an out-loud fight over the last free unit — resolved to exactly one grabber — ending in a team score and a replay button.

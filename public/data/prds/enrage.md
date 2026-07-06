## Overview
Enrage is a co-op MMO-raid boss fight for 3-6 players on one host screen (the raid arena + boss) and a phone each (your private role and telegraphs). You're a raid group learning one boss's mechanics in real time; nobody has the full picture, and the boss enrages if you're too slow. For friends who've wiped in WoW/FFXIV and want that STACK—NO SPREAD—MOVE adrenaline without a five-hour raid night.

## Problem
Raid mechanics are the best cooperative pressure ever designed — private assignments (you got the bomb, you're marked) executed simultaneously under a timer — but they're locked behind gear grinds and 20-player logistics. Party games never steal this. Trivia and drawing games are turn-based and low-stakes; no genre makes a living room feel like a raid pull.

## How it works
The boss casts a mechanic every ~8 seconds. The host TV shows the boss, its HP, an enrage timer, a 3×3 zone floor, and a shared RULE for the incoming cast (e.g. "🔥→Left, ❄️→Center, ⚡→Right"). Each phone privately shows only THAT player's element for this cast (one sees 🔥, another ❄️), a 5-second countdown, and three zone buttons. You must read your private element, map it through the shared rule, and tap the correct zone before the timer.

The twist: zones have capacity. If private elements funnel three of you to the same zone, someone overflows and the raid takes a hit — so you must also shout to decide who flexes. At the deadline the server checks each phone's zone against its private assignment and capacity; a clean cast chunks the boss, a sloppy one spikes raid damage and shrinks the enrage timer. Survive N casts before enrage = kill.

Privately per phone: your element, countdown, tapped zone, damage flashes. Shared on TV: boss, rule, aggregate "2 players overlapping in Left!" warnings (never who), raid health, enrage bar.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, one room object). Data model: `Room { players[], bossHP, raidHP, enrageMs, cast }`; `Cast { id, ruleMap, deadline, assignments:{playerId→element}, zonePicks:{playerId→zone} }`. The server is the clock: it emits `cast_start` with each player's private element (sent only to that socket) and the public rule to the host, runs a server-authoritative countdown, collects `zone_pick` events, and at `deadline` resolves damage and broadcasts `cast_result`. Sync strategy: server owns time; phones render an interpolated countdown but never decide outcomes. Hard part: fair simultaneity — clock skew and last-millisecond taps. Use server timestamps, a ~250ms input grace window, and lock picks at the authoritative deadline so no laggy tap silently misses.

## v1 scope
- 3 players, one boss, one mechanic type (elements → zones).
- 3 casts total; clean all three = kill.
- Private element per player per cast; tap-a-zone on phone.
- Host shows boss HP, rule, enrage bar, overlap warnings.

## Out of scope
- Multiple mechanic types, tank/heal roles, room-sensor movement, animations, spectators, matchmaking, scoring/leaderboards, more than one boss.

## Risks & unknowns
- Is tap-a-zone enough tension, or does it need physical room movement?
- Clock skew making the deadline feel unfair on slow phones.
- Balancing overlap punishment so coordination matters without feeling arbitrary.

## Done means
Three phones join, each receives a distinct private element per cast, the TV runs a synchronized 3-cast fight, the server correctly scores each cast against private assignments plus zone capacity, and the boss dies iff all three casts are clean — demoed end-to-end on real phones.

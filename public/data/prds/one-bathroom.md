## Overview
One Bathroom is a 3–4 player cooperative timing/packing game for a shared host screen (TV/laptop) plus per-phone controllers. It dramatizes the most relatable coordination hell there is: a single bathroom on a rushed weekday morning. The room wins only by silently dividing one shared resource across time.

## Problem
Most 'coordinate without talking' party games are really convergence games — match your friends. This inverts it: overlap is the enemy. The itch is the specific comedy of bin-packing a shared resource under private deadlines, where hogging the sink early screws the person who has to leave first — and you don't even know who that is.

## How it works
The host TV shows one clock hand sweeping 6:00→9:00am over ~90 real seconds, plus a single OCCUPIED light (green = one person inside, red = collision) and a row of anonymous progress bars — one per player — that only fill while that player is inside alone.

Each PHONE privately shows only two things: your remaining routine minutes (e.g. 'you still need 22 min of bathroom time') and your hard deadline ('you leave at 7:40 — bank your minutes before the hand reaches it'). You never see anyone else's need or deadline. A single hold-to-OCCUPY button lets you claim the bathroom during the sweep.

The rule: only one person may occupy at a time. While you hold alone, your minutes bank. If two people hold simultaneously, the door bangs — COLLISION — both stop banking and lose a few banked minutes to the chaos. Because durations and deadlines are asymmetric and hidden, you must infer 'someone clearly needs the sink now, I'll yield' purely from the shared occupancy light and the sweep. Win = everyone banks their full routine before their own deadline passes. Lose = the hand passes anyone's deadline with minutes left.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { clockMs, phase }`, `Player { id, needMs, deadlineMs, bankedMs, occupying:bool }`. Phones send `occupy(true/false)`; server is the single source of truth for who holds the resource. Each server tick (~100ms) it computes the set of currently-occupying players: if exactly one, increment their bankedMs; if ≥2, flag collision and decrement each. It broadcasts ONLY aggregate state (occupied light color, each player's bankedMs ratio) to the host, and each phone's own needMs/deadline/banked privately. The genuinely hard part is collision fairness under network jitter: define a fixed server-side coalescing window (~120ms) so a player who releases just as another grabs isn't unfairly dinged; resolve occupancy on the server clock, never the client's.

## v1 scope
- 3 players, one 90-second morning, one shared bathroom.
- Fixed hand-authored routine/deadline set that is tight-but-solvable.
- Host shows clock, one occupancy light, three anonymous bars.
- Win/lose screen only.

## Out of scope
- Multiple bathrooms/resources, difficulty tiers, matchmaking, accounts, sound design beyond a door-bang SFX, score history.

## Risks & unknowns
- Is the shared occupancy light enough signal to yield gracefully, or does it feel arbitrary? Playtest the info floor.
- Collision penalty tuning: too harsh = griefy, too soft = ignore it.
- Network jitter making collisions feel unfair — mitigated by server-authoritative windowing.

## Done means
Three phones join via QR; each sees a different private need+deadline; the hand sweeps; holding alone banks minutes and two simultaneous holds visibly collide and dock both; a run where players stagger cleanly ends in a win screen and a run where anyone's deadline passes with minutes left ends in a loss — all driven by the authoritative server, reproducible twice.

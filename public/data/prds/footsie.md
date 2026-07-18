## Overview
Footsie is a two-player real-time duel that steals the most cerebral layer of fighting games — the *neutral game* / footsies — and strips away every execution barrier. The shared TV is a single sideways lane with two fighters facing each other; each player's phone is a private controller that knows something the other phone does not. It's for people who love the tension of a spacing mindgame but bounce off quarter-circle motions and 60-frame combos.

## Problem
The best moment in fighting games is the whiff-punish: baiting an opponent to swing at empty air and cracking them in the recovery. That thrill is buried under execution walls, so party crowds never taste it. And it *cannot* exist on a single passed-around phone — the instant both players see both ranges, the read evaporates. Private, asymmetric knowledge is the whole game.

## How it works
The **host TV** shows only public truth: the lane, both fighters' positions, the tile-distance between them, and — when someone attacks — a poke animation resolving to HIT or WHIFF.

Each **phone** shows privately: two step buttons (advance / retreat), one POKE button, and a little diagram of *your own* attack — its exact reach in tiles, its startup delay, and its recovery window — plus a stamina bar that drains on each poke. Crucially, you never see your opponent's reach or timing. You infer it from how they move and what happened last time they swung.

The round is one sudden-death exchange: you win by landing a poke while the enemy is inside your reach at your active frame and you are outside theirs, or by whiff-punishing them during their recovery. Tiptoe, bait, punish, done.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `match { laneLength, players: [{ pos, reach, startup, recovery, stamina, state }] }`. Inputs are client-timestamped and sent on press; the server holds a short input buffer (~80ms), resolves all pokes on its own tick clock (30–50ms), and is the sole authority on hit/whiff. The TV subscribes to full public state; each phone subscribes only to its own private frame-data channel. The genuinely hard part is **latency-fair real-time resolution** across two phones with different RTTs — solved with server-authoritative timing, a rollback-free input buffer, and a brief on-screen telegraph frame so a laggy player isn't robbed of the punish window.

## v1 scope
- 2 players, one lane, one poke type each (with asymmetric reach/timing rolled per fighter).
- One exchange, sudden death — no rounds, no meter, no health bars.
- Two preset "fighters" (long-reach-slow vs short-reach-fast) so the read matters.

## Out of scope
- Combos, multiple attack buttons, blocking, more than 2 players.
- Best-of-N sets, characters, matchmaking, remote/WAN play (LAN only).

## Risks & unknowns
- Latency fairness could make the punish feel random.
- Footsies may be illegible without animation polish telegraphing active frames.
- Range asymmetry needs tuning or it feels unfair rather than tense.

## Done means
Two people on two phones, the TV shows the lane, one player baits a whiff and lands a punish that resolves publicly as a clean HIT — and at no point could either see the other's reach.

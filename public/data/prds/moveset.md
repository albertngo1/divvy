## Overview
A cooperative party game for 3-5 that steals the metroidvania traversal loop — 'I finally got the dash, now I can cross that gap' — and shatters the moveset across the room. One shared avatar; the party is its nervous system; each phone holds a private fragment of what the body can do.

## Problem
Unlocking a traversal ability is a solo dopamine hit. Moveset turns 'I have the dash' into a shouted negotiation, because you have the LAST dash, it's the third time it's been needed, and your neighbor is out.

## How it works
The TV shows a side-scrolling avatar auto-running toward obstacles that scroll in labeled with the move they demand: gap = Dash, high wall = Wall-Cling, spike pit = Double-Jump, low ceiling = Slide. There's one shared HP bar.

Each phone PRIVATELY holds a scarce, asymmetric hand of ability-charges — maybe 3 Dash + 2 Slide for you, a different mix for everyone. Your big button lights up READY only when the incoming obstacle matches a move you actually hold. As the obstacle enters a timing window, whoever holds the match taps to spend a charge and clear it. One valid tap suffices; the charge is consumed. If nobody taps in the window, the avatar eats the obstacle and the shared HP drops. Because charges are scarce and hands are hidden, players must talk: 'I've got the last cling — someone save a jump for the double pit coming after.' Reach the end before HP hits zero. A passed phone couldn't hold 4 simultaneous secret hands.

## Technical approach
Host tab drives an authoritative transport clock; phones subscribe over WebSocket (PartyKit / Socket.IO on Tailscale Serve). Data model: `run{seed, obstacles[]{type, t0, t1, resolved}, hp}`, `player{hand:{dash,cling,jump,slide}}`. Phones send `spend(ability, obstacleId)`; server accepts only the first valid spend landing in `[t0,t1]` with a matching charge, decrements it, and broadcasts resolution. Hard part: consistent timing windows across phone latency — a one-time offset calibration per phone — plus preventing two players double-spending on the same obstacle (server locks the obstacle on first accept).

## v1 scope
- 3 players, one gauntlet of ~10 obstacles, ~60 seconds
- 4 ability types, shared HP = 3
- Fixed hands dealt at start, no mid-run pickups
- TV shows scroll, HP, and win/lose

## Out of scope
- Ability pickups or recharges mid-run
- Branching paths, bosses, more than 5 players
- Sprite polish beyond simple shapes

## Risks & unknowns
- Timing-window fairness under latency is the make-or-break.
- 'Read TV, check hand, tap' may be too simple solo yet too chaotic in chorus.
- Charge-economy balance so a gauntlet is winnable but tense.

## Done means
Three phones with different hidden hands run a 10-obstacle gauntlet; each accepted spend consumes the correct charge within its window and locks the obstacle against double-spend; an unanswered obstacle drops shared HP; the TV shows a clean win or a death.

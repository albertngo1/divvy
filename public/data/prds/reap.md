## Overview
A cooperative horde-survival party game for exactly 4 players plus a shared TV. It steals the core loop of Vampire Survivors — endless swarm, auto-attacking heroes, level-up-card drafting — but strips away all movement and aiming. Your ENTIRE agency is the blind, timed draft, and the fun is coordinating builds you can't see each other making.

## Problem
Vampire Survivors is a beautiful solo trance; the delight of discovering a build synergy is never social. Co-op party games rarely deliver real action-game 'feel' — they're mostly quiz or drawing shells. The itch: a loud, real-time cooperative game where four people frantically coordinate character builds without a shared build screen, discovering what clicks in the moment.

## How it works
The TV shows the shared arena: four auto-moving, auto-attacking survivors, an encroaching horde, one shared health bar, a wave timer, and shared XP. Combat plays itself. Every ~20s the wave breaks and a draft window opens: each phone PRIVATELY shows a hand of 3 upgrade cards plus your currently-active components, with an 8s countdown to pick one. Cards are either solo boosts (move speed, projectile damage) or COMPONENTS that only fire as cross-player synergy pairs — Powder+Fuse = bombs, Chill+Shatter = frost nova, Beacon+Swarm = magnet pull. You cannot see anyone else's hand or pending pick, so you shout intentions across the couch. On resolve, all four picks apply and the TV plays the wave out. Survive 3 waves = win; shared health hitting 0 = wipe.

Private (phone): your hand, your active components, and a hint of which synergies you're one card away from. Shared (TV): arena, horde, shared health, wave timer, and which synergies are CURRENTLY firing (so you learn what worked) — never anyone's pending pick.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: Room{players[], sharedHealth, wave, phase}, Player{hand[3], activeComponents[], picked}. The horde sim is authoritative and deterministic server-side (spawns, positions, damage); the TV is a thin render client interpolating server snapshots at ~15Hz. Synergy resolution is a pure function of the multiset of active components across players — cheap. The genuinely hard part is server-side sim bandwidth to the TV (many sprites) while phones exchange only one tiny pick message per wave, plus a strictly simultaneous 8s draft window with server-enforced deadline and auto-pick on timeout. Phone latency is a non-issue (one message per 20s); TV throughput is the real constraint.

## v1 scope
- Exactly 4 players, one room code
- 3 waves, 8s draft each
- 8 upgrade cards including 4 synergy pairs
- Single map, auto-move + auto-attack (no steering)
- Shared health bar, win/wipe screen

## Out of scope
Player movement/aiming, multiple maps, meta-progression, >4 players, boss waves, reconnection polish, cosmetics, difficulty tuning beyond one preset.

## Risks & unknowns
Is blind drafting enough agency to feel like a game rather than a slot machine? Tuning synergy dependence so coordination matters but a bad wave isn't an unrecoverable death spiral. TV bandwidth for many sprites. 8s may feel rushed or draggy — needs playtest. Making 'which synergy is firing' legible on the TV.

## Done means
Four phones join via code; three 8s draft windows fire simultaneously with private hands; at least one cross-player synergy visibly triggers on the TV and measurably clears more horde than uncoordinated solo picks; the group reaches a win or wipe screen; no phone ever sees another player's hand.

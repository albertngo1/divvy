## Overview
A 90-second co-op boss fight for 3–5 people, stolen wholesale from RPG level scaling (Oblivion) and the EverQuest "con" system. The host TV shows a boss with no numbers on it at all. Each phone privately holds an XP pool, a secret character level, and a single color word describing how the boss cons *to you*: green, blue, white, yellow, red. Leveling up makes you stronger — and drags the boss's scaling up for everybody.

## Problem
Party games about greed usually make greed visible (bidding, taking chips). The genuinely nasty version of that tension already exists in RPGs and nobody has squeezed it into a room: your own power creep is a tax on everyone else, applied invisibly, retroactively, and permanently. The itch is a betrayal you can *feel on your screen* but cannot attribute.

## How it works
One round. Boss has hidden HP; a 90-second timer; the room wipes if the timer runs out.

Every 3 seconds each phone accrues XP. At any moment a phone may press LEVEL UP (irreversible), which raises that player's damage multiplier by a step. The boss's level is a live function of the room's *mean* player level, so every level-up buffs the boss's HP and its enrage clock for all four players.

PHONE (private): your level, your XP bar, the LEVEL UP button, an ATTACK button (tap-to-DPS), and one word — the con color, recomputed live as `boss_level - my_level`. Nothing else.

TV (public): the boss art, an unlabeled damage-taken bar, a whole-room DPS needle (aggregate only, never per player), and the timer. No levels, no names, no numbers.

So when a teammate levels, your color slides one step redder while you did nothing. Because you know your own level, your color leaks the room's hidden mean — every phone is a differently-biased instrument reading the same secret aggregate. Kill the boss and the *lowest-level survivor* takes the loot; the room's shared goal and each player's private goal point in opposite directions.

## Technical approach
Authoritative Node/Socket.IO server behind Tailscale Serve (or a PartyKit Durable Object). One `Room` object: `{bossHP, bossLevel, tEnd, players: {id, level, xp, dmgDealt}}`. Server ticks at 10 Hz, recomputes `bossLevel = floor(mean(levels))`, and fans out two *different* payloads: a public snapshot to the host and a per-socket private frame carrying only that player's color. Attacks are client taps, rate-limited server-side and applied as `dmg = base * mult[level]`.

The hard part is not throughput, it's leak control: the per-player frames must never carry anything from which a clever player could reconstruct another's level, and the aggregate DPS needle must be quantized/smoothed so a single level-up isn't a visible step function on the TV. Color transitions also need a 400 ms debounce so simultaneous level-ups don't strobe.

## v1 scope
- 3 players, one 90-second fight, one boss
- 5 con colors, 4 level steps, tap-to-attack only
- Aggregate DPS needle + timer on TV; nothing else
- Post-fight reveal screen: every level-up timestamped and named

## Out of scope
- Classes, abilities, cooldowns, healing
- Multiple rounds, campaign, persistent characters
- Any per-player stat on the TV mid-fight

## Risks & unknowns
- The commons may collapse instantly: if everyone levels in the first 10s, the round is over before it's fun. Needs an XP accrual rate tuned so ~2 level-ups is optimal.
- Con color may be too coarse to feel like information; may need 7 steps.
- Players may simply not notice their own color changing while tapping.

## Done means
Three phones in a room complete a fight where at least one player's color visibly reddens without them acting, the reveal screen correctly names who caused it, and in playtest at least one group wipes purely from over-leveling.

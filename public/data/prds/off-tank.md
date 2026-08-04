## Overview

A three-player real-time co-op boss fight that steals the single weirdest system in MMOs — the threat/aggro table — and makes it the whole game. Host TV plus three phones, one 60-second encounter, no character creation, no loot.

## Problem

Aggro is a hidden leaderboard that every raider spends years learning to feel without ever seeing. It's a perfect party mechanic hiding inside a genre nobody has partified: a shared invisible ranking that each player can only push from their own end. Co-op party games usually go the other way, showing everyone the same board and asking them to agree on it.

## How it works

The TV shows a boss, a party HP bar, a boss HP bar, a 4-second swing timer, and one arrow: which player the boss is currently facing. That arrow is the *only* public state. Threat numbers appear nowhere on the TV, ever.

Each phone privately shows: your own exact threat value (a number, live), your own cooldown rings, and three buttons.

- **STRIKE** — deals damage, adds threat. 1.2s cooldown. The only way to actually kill the boss.
- **FEINT** — subtracts a chunk of your threat, deals nothing. 3s cooldown.
- **BRACE** — usable **once per run**, halves damage for 2s, and only helps if the boss actually hits *you*.

The boss swings every 4 seconds at whoever it faces. At t=20s, t=40s and t=58s it telegraphs a **Cleave** on the TV three seconds in advance: triple damage to the current target.

The boss HP requires near-constant STRIKEs from all three players to fall in 60 seconds — but STRIKE is the thing that yanks aggro. So the fight is a shouted negotiation over an invisible ranking. "I'm at 340, I've got it" — but is 340 high? You have no idea what anyone else's scale looks like, and threat decays 2%/tick, and the arrow flips mid-sentence. BRACE is a one-shot private resource, so somebody has to admit out loud they've already burned theirs.

Wipe on party HP zero. Win by killing the boss.

## Technical approach

Host tab + phone PWAs + one PartyKit Durable Object (or Socket.IO over Tailscale Serve) running an authoritative 20Hz sim. State: `{bossHp, partyHp, threat:{pid:float}, cooldowns:{pid:{}}, braceUsed:{pid:bool}, targetPid, nextSwingAt, cleaveAt[]}`.

Each tick the server sends every phone only its own threat and cooldowns, and sends the TV only `targetPid` plus the two HP bars. Aggro flips only when a challenger exceeds 110% of the current holder's threat — the real MMO rule, borrowed here because it stops the arrow from strobing on jitter.

The genuinely hard part is latency fairness on BRACE. A player who taps at 2.9s into a 3s telegraph deserves the mitigation even if the packet lands at 3.15s. Clients measure RTT offset via WS ping/pong, stamp inputs with corrected client time, and the server accepts any input whose stamp precedes the cleave resolution by up to 250ms of arrival lateness — a rollback-lite window applied only to BRACE, since STRIKE and FEINT are forgiving.

## v1 scope

- 3 players, exactly one 60-second encounter, fixed boss stats
- Three buttons; BRACE once per run
- One arrow on the TV, two HP bars, one swing timer, three telegraphed Cleaves
- Win/wipe card showing the final threat table — the reveal is the payoff

## Out of scope

Classes, healing, multiple bosses, mechanics that move players in space, more than 3 players, persistence, reconnect mid-fight.

## Risks & unknowns

Balance is the whole risk: if the DPS check is loose, everyone FEINTs and nothing happens; if it's tight, the run is pure spam with no negotiation. Threat scale is arbitrary, so "I'm at 340" may be meaningless noise rather than useful communication — an alternative is showing threat as a 0–100 normalized dial, which is friendlier but leaks less. Unclear whether 60 seconds is enough for players to build the intuition that makes the arrow readable.

## Done means

Three phones join by QR. Each phone displays a threat number that differs from the others and is never transmitted to any other client (verifiable in the WS log). The TV's arrow flips only on the 110% rule. A BRACE tapped just before a Cleave lands halves that damage; one tapped just after does not. The run reliably ends in a win or a wipe inside 60 seconds and reveals the full threat table on the TV.

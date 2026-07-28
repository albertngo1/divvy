## Overview

A 90-second cooperative boss fight for 4–6 players that steals FFXIV/WoW raid mechanics wholesale. The TV is the arena; every phone is one raider's private debuff and private reading of the boss's telegraph. Talking out loud is not a workaround — it is the entire interface.

## Problem

Raid mechanics are the best real-time cooperative puzzle in games, and reaching one costs twenty hours of gearing and a guild. The genuinely funny part — the post-wipe replay where you find out whose confident call deleted the party — is locked behind all of it. There is no version of this you can hand to four people on a couch.

## How it works

The fight is six casts. Each cast: an 8-second bar.

**Host TV (public):** a top-down arena of 4 wedge zones, one colored dot per player, the cast bar, and the telegraph — two abstract symbols painted onto zones. Position is public. Everyone can see where everyone stands.

**Your phone (private):** three things nobody else sees.
1. **Your debuff** for this cast — PUDDLE (the zone you end in becomes permanently lethal), CHAIN (you're tethered to whoever ends nearest; if you share a zone, you both die), BOMB (everyone in your zone dies, you survive).
2. **Your legend** — which of the two telegraph symbols means *safe*. Legends conflict across players, and each cast exactly one player's legend is stale, left over from the previous phase. Somebody is confidently wrong and it isn't their fault.
3. **A tap-to-move zone picker,** one move per cast, locked at the deadline.

So your private card creates a *public positional consequence other people suffer and cannot see the cause of.* You must run out with the bomb, which means abandoning the chain partner who doesn't know they're chained.

At the cast deadline, moves lock, the server resolves debuffs in a fixed published order, and the TV animates deaths. Survive six casts with 3+ alive to win.

**The payload:** the **wipe replay.** The TV re-runs the fatal cast with every hidden card floated over its dot — all debuffs, all legends, the stale one flagged. The room does the postmortem. That is the game.

## Technical approach

PartyKit DO (or Socket.IO over Tailscale Serve). Model: `Fight{castIdx, zones[4].hazards[], staleLegendPlayerId}`, `Player{id, zone, targetZone, alive, debuff, legend}`. Server broadcasts `castStart{castId, deadlineEpochMs, telegraph}` publicly and `assign{debuff, legend}` privately per socket. Phones send `moveTo{castId, zone}`; anything past the deadline is dropped server-side. Resolution is a pure `resolve(state, moves) → events[]` shipped to server, TV, and replay view identically, so the animation and the truth can't diverge.

Hard part one: clock skew. Phone lockout and TV bar must agree within ~200ms or players feel robbed — do an offset handshake on join and express all deadlines in server epoch ms. Hard part two: legibility of resolution order (PUDDLE → CHAIN → BOMB). Get it wrong and the room feels cheated instead of outplayed.

## v1 scope

- 4 players, 4 zones, 6 casts, one boss, no HP bar
- 3 debuffs only; 2 telegraph symbols; exactly one stale legend per cast
- Win condition: 3+ alive after cast 6
- Replay of the first fatal cast only
- Honor rule for phone privacy (no tilt-to-dim)

## Out of scope

Classes, healing, damage numbers, boss phases, multiple bosses, matchmaking, more than one fight per session.

## Risks & unknowns

Spaceteam adjacency — the differentiator must visibly be the public-position/private-cause loop plus the replay. 8 seconds may be too short to negotiate. Conflicting legends must be *solvable by talking*, not arbitrary. Everyone staring down at phones instead of at the TV.

## Done means

Four phones and a TV run a 6-cast fight; at least one cast kills someone; the replay screen shows the victim's zone alongside the killer's debuff and the stale legend; and a playtest room correctly identifies who misread, with no phone ever shown.

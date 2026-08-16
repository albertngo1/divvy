## Overview

A 60-second real-time panic co-op for 4 people in one room. You run a failing utility plant. Alarms raise and expire on 5-second windows. Every alarm needs **exactly one** hand: zero hands and it ruptures; two hands and you cross-thread the valve, which is worse than the rupture. For groups who like Spaceteam but are tired of games that reward the room for shouting in sync.

## Problem

The entire Spaceteam lineage pays you for tighter synchronization — louder, faster, more overlap. Nobody has built the inverse: a game about the bystander effect, where the honest reason you did nothing is that you assumed someone else could see it too, and the honest reason you crashed is that you both could. Two outfielders converging on one fly ball is among the funniest things two people can do to each other, and no party game models it.

## How it works

**Host screen (shared, and deliberately near-useless):** a plant schematic, a hull bar, and a rolling consequence ticker. It shows alarms **only after they resolve** — HANDLED / RUPTURED / CROSS-THREADED, with names. During a live window the TV shows nothing but a count of alarms currently open. The shared screen is a scoreboard, not a source of truth.

**Phone (private):** a vertical list of only the alarms *your* phone can see, in a private shuffled order. Each row has a 5s ring, a name drawn from a per-phone name pool, and a badge: `SEEN BY 3`. Counts are honest; identities never appear. One big tap = you take it.

**Resolution at window close:** exactly 1 tap → handled, +1 point. 0 taps → rupture, −2 hull. 2+ taps → cross-threaded: −3 hull *and* every player who tapped is gloved-out for 6s, so a pileup starves the next three alarms and cascades.

The generator guarantees a mix: `SEEN BY 1` is free money if you trust the badge, `SEEN BY 2` is pure chicken, `SEEN BY 4` demands a convention the room has to invent live. Voice is allowed and half-broken — alarm names differ per phone, so "the coolant one!" is meaningless. Rooms that survive invent protocol ("lowest seat number takes evens"). That invention is the game.

## Technical approach

Host browser tab + phone PWAs + authoritative WS server (PartyKit Durable Object, or Socket.IO over Tailscale Serve).

Server owns the only real table: `Alarm {id, tRaise, tExpire, visibleTo: Set<playerId>, labelFor: Map<playerId,string>, taps: [{playerId, tServer}]}`. Each phone receives a projection containing only its own rows; visibility sets and other players' taps are never sent. Clients render rings from a server tick plus a clock offset estimated by a 3-sample ping handshake at join.

The genuinely hard part is fairness under latency — but it's *easier* here than in normal games, and that's the design's luck: we never resolve a race. We only decide whether two taps landed inside the same window, with a 250ms grace past `tExpire`, so a laggy tap at 4.9s still counts and still collides. No rollback, no authority handoff. The other hard part is the generator keeping the seen-by mix flat as the round accelerates and gloved-out players shrink the eligible pool.

## v1 scope

- Exactly 4 players, room code only, no reconnect
- One 60-second round, then a final tally
- 10 alarms, 5s windows, visibility sizes 1/2/4
- Hull 10; TV shows hull, open-alarm count, 3-line ticker
- Two sounds total: rupture and cross-thread

## Out of scope

Multi-round campaigns, 3/5/6-player counts, alarm *content* puzzles (dials, sliders), spectators, accounts, install prompts, any art beyond text and rings.

## Risks & unknowns

The badge may make it solvable in the boring direction: if `SEEN BY 2` reliably freezes both players, ruptures dominate and the round is just grim. The rupture:cross-thread penalty ratio (−2 vs −3) is the whole tuning surface and needs playtest. If window length drops near round-trip latency, skill becomes ping. The shuffled per-phone names may read as noise rather than as a puzzle worth solving.

## Done means

Four phones and a laptop, one 60s round. The final TV log contains **both**: at least one RUPTURED alarm that 2+ players could see and nobody took, and at least one CROSS-THREADED alarm where two players tapped inside the same window and both got gloved. The room laughs at the second one and immediately argues about a protocol for the rematch.

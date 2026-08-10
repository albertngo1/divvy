## Overview

A 75-second silent cooperative round for three players plus a host screen. Each phone starts on a private number. All three must end on the *same* number, and lower is better — the perfect landing is exactly the highest starting value in the room, which nobody knows. Dials only move **up**. Every mistake is permanent.

## Problem

Matching games let you correct yourself, so they resolve into polite converging averages. Nothing is at stake in a single move. Make adjustment irreversible and the psychology inverts: raising becomes a commitment you impose on everyone else, and patience becomes the actual skill.

## How it works

Each phone is privately dealt a start in 3–12. Your dial raises one step at a time on a 0.6s hold-to-raise ramp; there is no down.

**PRIVATE on each phone:** your own current number, your remaining PEEKs (3), and the PEEK lamp. A peek returns one bit — *someone is above you* or *nobody is above you* — and freezes your dial for 4 seconds. That freeze is the price: information costs you tempo in a race where others are still climbing.

**PUBLIC on the TV:** a 75-second clock and one number — how many **distinct values** currently exist in the room. Nothing else. Watching it fall 3 → 2 tells you two people just collided, but not who and not where. Cruelly, it can climb back: if two players are tied and one raises off the tie, the room watches 2 → 3 and knows someone just broke it.

The round ends when the count reaches 1, or the clock expires. The TV then reveals the three secret starts, the true optimum (their max), and the room's overshoot. Overshoot of 0–1 is a clean landing; more than 4 is a failed round. This scoring is what kills the degenerate "everyone slam to the cap" line — reaching agreement is easy, reaching it *cheaply* is the game.

One phone passed around cannot produce this: three simultaneous secret starts and three separately-rationed private oracles are the entire information structure.

## Technical approach

Host tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object, or Socket.IO over Tailscale Serve for a LAN party).

Data model: `Room {code, phase, deadline, tick}`, `Player {id, start, value, peeksLeft, frozenUntil}`. Server owns `start` and `value`; phones send only `RAISE` intents and `PEEK` requests and never learn another player's number.

Sync: a fixed 200ms server tick evaluates all raises accepted in that window *together*, then computes `distinctCount` and broadcasts only that to the host. Per-socket messages carry each player's own value and any peek result. Evaluating on the tick rather than per-event is deliberate — it means two players raising "at the same time" genuinely are simultaneous, and nobody loses a tie to network latency.

Hard part is fairness rather than throughput: raise intents must be idempotent under retransmit (a dropped ack must never double-raise, since raises are irreversible), and a disconnect mid-climb must freeze that player rather than forfeit the room.

## v1 scope

- Exactly 3 players, one round, starts drawn 3–12, hard cap 20
- 75s clock, 3 peeks each, 4s freeze per peek
- TV shows distinct-count and clock only; reveal screen shows starts, optimum, overshoot
- Room code join, no accounts, no rematch button

## Out of scope

4+ players, multiple rounds, competitive scoring, downward moves of any kind, sound design, reconnection recovery.

## Risks & unknowns

The peek budget is the tuning dial — three may be enough to solve it mechanically (raise until the lamp says you're top, stop), so the freeze cost and clock must be tight enough that pure oracle-play loses to nerve. Unknown whether the distinct-count is legible enough as the *only* public feedback. Hold-to-raise may feel mushy on low-end phones.

## Done means

Three phones join by code, no talking; a round reaches distinct-count 1 before the clock, and the reveal screen correctly names the optimum as the max of the three dealt starts and shows a nonzero overshoot in at least one of five test rounds.

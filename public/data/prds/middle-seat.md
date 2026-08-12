## Overview

A 5-player, four-minute number game where matching someone is never your problem — it's the problem of whoever is seated between you. For groups that already like Liar's Dice or Skull but are tired of the punishment landing on the person who deserved it.

## Problem

Every "don't pick the same thing" party game punishes the colliders. That's a solved, slightly boring incentive: just be weird. Nobody has built the version where collisions are an *externality* — where accidental agreement between two strangers across the room ruins a third party who did nothing. That flips anti-coordination from a private optimization into live table politics: you must model not just what everyone will pick, but who *wants* a pileup and where.

## How it works

Five players sit in a fixed ring, drawn as five avatars on the TV in their real seating order. Each round, every phone privately picks a number 1–9 within a 12-second window. Talking is allowed and encouraged.

Reveal is simultaneous on the TV. Resolution:

- Any two players who picked the same number are **matched**.
- Damage is 2 hearts, dealt to every player sitting strictly between them along the **shorter arc** of the ring. The matched pair takes nothing.
- If a matched pair is adjacent (nobody between them), the damage **bounces**: 1 heart each. This kills the degenerate strategy of colluding with your neighbor.
- Three-way matches resolve as all pairs.

**Phone shows privately:** your number pad; your exact heart count (3 to start); and one asymmetric leak — the number that *one specific other player* chose last round, wired in a hidden derangement. You never learn whose number you're seeing, and you never learn who is watching you.

**TV shows publicly:** the seating ring, everyone's revealed numbers each round, arcs drawn as the blast travels, and a per-player status of only `OK` / `HURT` / `OUT`. Never exact hearts.

The comedy: someone says "let's both take 7" out loud, and the two people in the middle hear it, know exactly what's coming, and can do nothing about it — while the person who quietly picked 7 by coincidence has just detonated the table.

## Technical approach

PartyKit Durable Object per room; host tab joins as `role: host`, phones as PWA clients over WSS via Tailscale Serve.

State: `{ seats: [playerId], hearts: {id:int}, round: int, sealed: {id:number}, peekRing: {id:id} }`. Picks are sealed server-side and never fan out until the window closes — the server broadcasts a single `resolve` event containing the full pick map plus a precomputed damage script (`[{fromA, fromB, arc:[ids], dmg}]`) so the TV animation is deterministic and the phones can't front-run it.

The hard part isn't throughput — it's **legibility**. Arc damage must read in under four seconds or the room won't learn the rule. Also: rejoin must restore a phone's own sealed pick without ever replaying another player's, and `peekRing` must be a true derangement re-rolled each round.

## v1 scope

- Exactly 5 players, 3 rounds, numbers 1–9.
- Hearts, shorter-arc damage, adjacent-bounce.
- The one private last-round peek.
- Host ring animation; no lobby art, no avatars beyond colored discs.

## Out of scope

- Variable player counts, seat shuffling, the "Duck" immunity token, multi-game scoring, spectators, reconnect polish.

## Risks & unknowns

- With 5 players and 9 numbers, collision rate may be too low to teach the rule; may need to shrink to 1–6.
- The private peek may be noise rather than signal at 3 rounds.
- Middle seats may feel structurally doomed; needs playtest on whether ring position is fair.

## Done means

Five phones on a LAN play 3 rounds; at least one collision resolves with correct shorter-arc damage and one adjacent-bounce fires; inspecting WS frames confirms no phone receives another's pick before reveal; and a fresh table can restate the damage rule after one round without the host re-reading it.

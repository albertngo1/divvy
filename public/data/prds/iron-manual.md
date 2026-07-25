## Overview

Iron Manual is a 3-4 player concurrent-room co-op that steals the *frame data* layer of fighting games — the part players normally memorize from a wiki — and shards that wiki across phones. A boss on the shared TV throws one attack per beat; the room has to collectively identify the correct defensive answer under a hard clock, using knowledge no single person holds. It's for groups who like Spaceteam-style verbal panic but want the satisfaction of a real, learnable system underneath.

## Problem

Fighting games have the best hidden-information structure in gaming — *is this move plus or minus on block?* — and it's completely invisible at parties because it lives in one player's memory. Co-op party games usually shard trivia or shapes; nobody shards a rule system where the pieces genuinely compose. And most "shout at each other" games are noise: the shouting isn't load-bearing, it's just flavor.

## How it works

The boss (TV) enters a stance and a 3.5-second startup bar begins draining. The TV shows only: the boss's silhouette in a stance (LOW / MID / OVERHEAD), a color aura (RED / BLUE), and the shrinking bar. That's the *query*.

Each phone privately holds 2 of 6 **manual pages**. Pages are atomic rules, e.g. "RED + LOW → the counter is DUCK", "BLUE attacks are always -4 on block: PUNISH beats BLOCK", "an OVERHEAD following a whiffed LOW cannot be ducked". No phone has enough pages to resolve any given attack alone; every attack requires composing 2-3 pages held by 2-3 different players. Pages are dealt so at least one required page is always on a phone that can't see the others'.

Each phone shows privately: its 2 page texts, a 3-button commit pad (BLOCK / DUCK / PUNISH), and a lock-in state. It never shows other players' pages or choices.

Before the bar empties, every phone must commit. Server resolves: all-correct = boss takes a chunk; any mismatch = the party takes a hit. Three hits and the run ends. The fun is the 3.5 seconds of "RED and LOW — who has red?! — I have red-low, it's DUCK — no wait is it blue?"

## Technical approach

PartyKit Durable Object per room. State: `{players: {id, pages: PageId[], commit: 'block'|'duck'|'punish'|null}, boss: {hp, attack: {stance, aura, startedAt, windowMs}}, hearts}`. Attacks are drawn from a hand-authored table of 12 (stance, aura, context) → correct answer, each annotated with the page set required to derive it; the dealer guarantees the required pages span ≥2 players.

Sync strategy: server is the clock authority. It broadcasts `attack_start` with a server timestamp; phones render the bar locally from an NTP-style offset estimated over WS ping/pong, so nobody's bar is meaningfully ahead. Commits carry the client's stamp but the server rejects anything past `startedAt + windowMs + 250ms` grace.

Hard part: the *deal*, not the sync. Page sets must be provably insufficient alone and sufficient together, for every attack in the table, at 3 and 4 players. v1 solves this by brute-forcing all deals offline and shipping only the valid ones as a lookup table.

## v1 scope

- 3 players, one boss, 6 hearts-free rounds then done
- 6 manual pages total, 12 attacks in the table, hand-authored
- Three buttons, no combos, no offense — pure defense
- TV: silhouette + aura + bar + hearts. No animation beyond a stance swap
- Phone: two page cards, three buttons, locked-in checkmark

## Out of scope

Boss phases, page trading/drafting, a real fighting-game engine, 5+ players, page unlocks between rounds, any audio.

## Risks & unknowns

3.5s may be too tight for verbal composition — needs playtest tuning, possibly 5s for round 1 decaying to 3s. Players may memorize the 12-attack table by round 4, killing the game (mitigation: v1 is meant to be short). Reading a page card aloud under pressure may be the actual difficulty rather than the deduction.

## Done means

Three phones join a room, each shows two distinct page cards. The TV runs six attacks. For every attack, at least one page needed to resolve it sits on a phone other than the one the group first asks. All three phones commit inside the window on at least four of six attacks, and the group audibly argues about a page they can't see.

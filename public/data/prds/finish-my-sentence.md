## Overview

**Finish My Sentence** is a 4–6 player cooperative shouting game for a TV plus phones. Each player privately holds fragments of machine commands — some are beginnings, some are endings — and nobody ever holds both halves of the same command. To make the machine do anything, two people must voice-match their fragments and tap within the same window. It is a distributed matching problem where the only network is a room full of people yelling over each other.

## Problem

Spaceteam-likes give you an instruction and someone else the control, which is a one-to-one lookup: shout the label, done. Once the room learns the labels, the difficulty is just reading speed. There's no *search* problem — no moment where you have to broadcast into a noisy channel and let the right stranger recognize themselves. And no failure that's funny in itself; a missed instruction is just a miss.

## How it works

One 100-second round. The machine is a chemical plant on the host screen.

**Your phone shows privately:** an inventory of 6 tappable fragments, split into HEADS (`VENT THE STARBOARD…`, `DOUBLE THE…`) and TAILS (`…FOAM, TWICE`, `…UNTIL IT STOPS SCREAMING`). Your inventory is yours alone, it never contains a legal pair, and fragments **decay** — each has a shrinking bar, and expired ones are silently swapped for new ones.

**The host screen shows publicly:** four plant gauges, a stability meter, and a scrolling EXECUTION LOG of every command the machine has run — in full, verbatim, including the broken ones.

A head-holder shouts their fragment. Anyone whose tail completes it shouts back. Both tap; if the taps land within 2.5 seconds the machine executes. Legal pairs (server-validated against a pairing table) push a gauge toward green. **Illegal-but-grammatical pairs still execute** — the machine is obedient, not smart — and the resulting sentence goes up on the log while the stability meter drops. Half the fun is the log filling with things like `DOUBLE THE STARBOARD FOAM UNTIL IT STOPS SCREAMING`.

The genuine difficulty is channel contention: six people broadcasting fragments simultaneously, each scanning their own private list for a completion, with everything expiring underneath them.

## Technical approach

Host tab + phone PWAs + Socket.IO over Tailscale Serve, server authoritative.

Data model: `Fragment{id, kind: head|tail, text, slotClass, expiresAt}`, `Player{id, inventory[6]}`, `Room{stability, gauges{}, log[], pendingTaps[]}`. Fragments carry a `slotClass`; a pair is *legal* if classes match, *grammatical* (executes as nonsense) if classes differ but arity fits, and *rejected* otherwise.

Sync: server owns the clock and the deck. Phones send only `TAP{fragmentId}`. The server keeps a 2.5-second pending-tap buffer and resolves on every incoming tap — greedily matching the oldest compatible head/tail pair. Expiry is server-side; clients render countdowns from a server timestamp with an estimated offset, so a fragment can vanish under your thumb.

**The hard part** is match arbitration when three people tap near-simultaneously. Greedy-oldest produces surprising pairings; the alternative — resolving the whole buffer as maximum bipartite matching every tick — is fairer but non-obvious to players watching the log. v1 ships greedy and instruments how often it mispairs.

## v1 scope

- One 100-second round, 4 players
- 24 heads / 24 tails across 4 slot classes, hand-written
- Inventory of 6 with 25-second decay
- Host screen: stability meter + execution log (gauges can be cosmetic)
- End card: final stability plus the three funniest illegal commands executed

## Out of scope

Multiple rounds, radio-silence windows, per-player scoring, a saboteur holding poisoned fragments, procedurally generated fragments, more than 6 players.

## Risks & unknowns

Writing fragments that are funny *and* combinatorially valid is authoring-heavy — the whole game lives or dies on 48 lines of copy. Reading a fragment off a phone while six people shout may exceed working memory, making the round feel like noise rather than pressure; decay speed is the main dial. Groups may converge on a boring optimum ("everyone read your heads left to right") — needs playtesting to see if contention holds.

## Done means

Four players, one round, no rules explanation beyond a 15-second host animation: the room executes at least eight legal commands, the execution log contains at least three unintended nonsense commands, and in a post-game question every player can name a fragment that someone *else* was holding.

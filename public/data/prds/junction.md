## Overview
Junction is a 3-player co-op Schelling walk through a branching tree of rooms. Each phone is a lonely explorer that can only see its *own* current room and the two doors leading out of it; the host TV shows the whole tree glowing with anonymous heat. The group wins only if all three explorers, choosing simultaneously and silently, end up standing in the exact same final chamber.

## Problem
Most convergence games are static: pick a word, mark a grid, snap a moment. There's no *dread of drift* — the feeling of realizing, too late, that you and your friends have wandered into different rooms and can never call each other back. Junction makes divergence irreversible and invisible, so every fork carries weight.

## How it works
The tree is depth 3 → 8 leaves. Play runs in three simultaneous rounds. Each round, every phone privately shows: the name/art of the room you're standing in, and two doors, each labeled with an evocative Schelling word (e.g. **FIRE** vs **WATER**, then **CROWN** vs **KEY**, then **DAWN** vs **DUSK**). You tap a door; the server advances you one level. Crucially your door labels at level 2+ depend on which door you took at level 1 — so if you split early, you're now in a different subtree seeing different choices, with no signal that you're lost.

**Phone (private):** only your current room + your two doors. Never others' positions, never the tree shape.
**Host TV (shared):** the full tree, each node glowing brighter the more explorers stand on it (a 0–3 heat count), no identities, no path lines. The room watches the glow fracture or fuse in real time.

After three picks everyone lands on a leaf. **Win = all three on the same leaf.** The winning chamber reveals a tiny illustrated destination ("the Drowned Library") as a shared payoff; a split reveals the three separate rooms the group scattered into.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `tree` (static per game: node → {label, leftDoor:{label,child}, rightDoor:{label,child}}), `players[id] = {nodePath: [], ready}`. Each round the server gates on all three `ready` flags, resolves moves atomically, and broadcasts only anonymized per-node occupancy counts to the host — never raw positions. Phones receive only their own new room payload. No hard real-time sync needed (turn-gated), so the tricky part is purely *information hiding*: the host aggregate must never leak which player is where, and door labels must be generated so both branches feel equally plausible (bad content = a dominant "obvious" door and no tension).

## v1 scope
- Exactly 3 players, one game, one hand-authored depth-3 tree.
- Three simultaneous rounds, then win/lose reveal.
- Host heat glow + winning-chamber art.

## Out of scope
- More players / variable depth / random trees.
- Narrative text at each room, scoring across games, spectators.
- Reconnect handling beyond a simple rejoin.

## Risks & unknowns
- Content is everything: a fork with an obvious answer collapses the game. Needs playtested door-label pairs.
- Only 8 leaves → ~1/8 blind-luck convergence; the fun must come from *feeling* the Schelling pull, not odds. May need depth-4.

## Done means
Three phones join, each sees only its own room, all pick three doors blind, and the host correctly shows anonymized node heat throughout, declares a win iff all three share a leaf, and reveals that chamber.

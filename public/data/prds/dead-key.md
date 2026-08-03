## Overview

A three-player cooperative word game for a couch and a TV. One prompt, three phones, one goal: all three of you submit the *identical* word. The catch is that each phone's keyboard has six letters that quietly refuse to type, a different six per player, and you are never told anyone else's. For groups who like Codenames-style silent inference but are tired of clue-giving.

## Problem

"Everyone type the same answer" games collapse in one beat — the room converges on the single most obvious answer and there's nothing left to play. And private-information word games nearly always make the private thing a *secret word*. Making the private thing a **constraint on what you are able to say** is untapped, and it produces the good stuff: you read the room by what people conspicuously *fail* to write.

## How it works

Host TV shows one category: **SOMETHING IN A KITCHEN**. Each phone shows a full QWERTY. Six keys are dead — they look completely normal, no strikethrough, no buzz, they just produce no character. You discover your own dead keys by feel within about ten seconds of typing. You never see anyone else's.

All three players type a word and hit LOCK. Nothing is visible until all three lock (or a 45s timer fires). The host then reveals the three words **side by side, shuffled and unattributed**. Three identical words = win. Otherwise, attempt 2, then attempt 3.

The inference is the game: *nobody wrote SPOON, and SPOON is the obvious answer — somebody is missing an S, a P, an O or an N. KETTLE appeared twice. Try KETTLE.* Meanwhile you're privately steering toward answers you can actually type.

- **Private per phone:** your dead-key set (discovered, never displayed), your in-progress word, your lock state.
- **Public on the TV:** the prompt, the attempt counter, and each attempt's three shuffled submissions.
- **Reveal:** three keyboards side by side with each player's six dead keys lit red.

## Technical approach

PartyKit Durable Object per room. State: `{prompt, attempt, players: {id, deadKeys: string[6], draft, locked, submission}}`. Dead keys are assigned server-side from a seeded shuffle at round start and delivered **only** down that player's socket — never in a broadcast.

Two non-obvious problems:

1. **The client keyboard is not the enforcement.** The server re-validates every submission against that player's ban set. A native `<input>` is unusable here — iOS predictive text, swipe-typing and paste all inject dead letters. Ship a custom in-app key component with `inputmode=none`.
2. **The genuinely hard part is content, not sync.** Ban sets must guarantee at least one prompt-appropriate answer typable by all three players, or the round is unwinnable and the room blames the game. Generate ban sets by rejection-sampling against a curated 12-word answer list per prompt.

Simultaneity is trivial: hold all submissions until every player locks.

## v1 scope

- 1 prompt, 3 players, 3 attempts
- 6 dead keys each, validated against a hand-written 12-word answer list
- Custom on-screen keyboard, server-side ban enforcement
- Host: prompt, attempt counter, shuffled submissions
- One reveal screen: three keyboards, bans in red

## Out of scope

Multi-round scoring, 4+ players, generated prompts, full dictionary validation, spectators, competitive/traitor variants, rejoin after disconnect.

## Risks & unknowns

Unwinnable ban sets. Signalling exploits — a player typing "AAA" to broadcast which letters they have; v1 blocks this by requiring submissions be members of the curated list. Whether negative-space inference lands for a first-time room, or whether three attempts is simply too few.

## Done means

Three phones join by QR; each player finds a *different* set of dead keys by typing; a crafted socket message containing a dead letter is rejected server-side; the room reaches three identical words within three attempts in at least half of six playtests; the reveal shows three visibly distinct keyboards.

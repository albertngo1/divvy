## Overview

A 3-player, ~12-minute party game whose entire output is a printed charter: a short list of house rules for a real friend group. There is no score screen. You leave with a card, and the card carries its own casualties.

## Problem

Party games end in a leaderboard nobody remembers by the car ride home. Separately, real friend groups genuinely do make house rules — about the group chat, road trips, who cooks — and those rules die the same way every time: someone proposes a rule that obviously benefits them, gets called on it, and it's dead. That failure mode is a game. Nothing bottles it.

## How it works

1. **Domain.** TV draws one card: "Rules for this group's road trips."
2. **Stakes (private).** Each phone gets a secret STAKE — a smuggle objective from a deck ("the charter must end up containing a rule about food", "...a rule that lets someone leave without saying goodbye", "...a rule naming a specific day") — plus a private BAN LIST of three words it may not use, closing off the obvious phrasing and forcing indirection.
3. **Draft (90s, private).** Each phone writes ONE rule, 6–12 words. The TV shows only ruled lines filling with word-length blocks — no text — so the room watches the charter assemble as shape.
4. **Read.** Rules appear on the TV shuffled, in one typeface. Read them aloud. Three minutes of open table talk, no voting.
5. **Trace (private, simultaneous).** Each phone assigns every rule to a player. Self-assignment forbidden, full assignment forced.
6. **Strike.** A rule is struck if a majority of non-authors named its author. The TV blacks it out and prints the author's name under the bar.
7. **Seal.** Surviving rules render as a charter — domain header, rules unattributed, all names as co-signatories at the foot, struck rules kept as black bars. QR on the TV; every phone downloads the same PNG.

The room "wins" if ≥3 rules survive and ≥2 stakes were satisfied. Nothing is counted per player.

**Private vs shared:** phone holds your stake, your ban list, your draft, your trace ballot, and a live "stake satisfied?" light during Read. The TV holds shape-blocks, the shuffled list, the bars, the charter.

## Technical approach

PartyKit Durable Object per room. `Room{code, domain, phase}`, `Player{id, name, stakeId, banWords[3], ruleText, ballot:{ruleId→playerId}}`, `Rule{id, authorId, text, struck}`. Rule text never leaves the server until the Read phase — client-side hiding leaks in devtools, and authoritative redaction *is* the game. Ballots are held and revealed simultaneously. Stake satisfaction is a server-side keyword/regex predicate over surviving text. The hard part isn't sync; it's calibrating the stake deck — trivially-smuggled stakes make tracing impossible, over-specific ones make it free.

## v1 scope

- Exactly 3 players, one round, one domain card
- 8 stake cards, 40-word ban pool
- Host tab renders the charter to PNG on a canvas; QR to download
- No accounts, no rejoin, no persistence

## Out of scope

Multiple rounds, LLM-judged stakes, 4+ players, real printing, spectators, charters that persist between sessions.

## Risks & unknowns

Stake calibration. Players hedging into vagueness, producing an untraceable but boring charter (mitigate with the 6-word floor). Someone must be willing to read aloud. Being traced leaves a named black bar — tone needs playtesting to land as funny, not punitive.

## Done means

Three phones, one domain. No phone's network payload contains another player's rule text before Read. At seal, all three scan one QR and get the identical PNG charter with ≥3 rules and ≥1 black bar on it.

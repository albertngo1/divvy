## Overview

A 4-player party game in two acts, ~6 minutes total, for a group who actually like each other. Act one makes a small sincere artifact. Act two is a volunteer's dilemma over who gets to keep the only copy. The game ends in exactly one of two states: one person holds a PNG, or nobody does and it is genuinely gone.

## Problem

Keepsake party games all end the same way — everyone gets the file, so the file is worth nothing. Scarcity is what makes an object a keepsake, and scarcity forces the only interesting question a group can be asked: *who deserves this, and will you say out loud that it isn't you?*

## How it works

**Act 1 (3 min).** Each phone privately draws a **dedicatee** (another player, never revealed) and one prompt from a deck: *"the moment tonight when ___ was most themselves"*, *"what ___ should be warned about"*. Each player writes one line, max 80 characters, seen by nobody. The host typesets all four lines onto a postcard with a generative border — unattributed, undedicated. Everyone reads it. You know which line is yours and who it's about; you can only guess whether any of it is about you.

**Act 2 (90 s).** The host announces: one copy. Each phone shows a private **CLAIM** toggle, flippable as often as you like until the buzzer. Resolution:

- exactly one player has *not* claimed → the card is issued to them
- zero abstainers, or two or more → the render is destroyed on screen, unrecoverable

So the room must engineer exactly one martyr while every claim state is secret. Talking is the game and lying is legal, but a lie that misfires kills the artifact for everyone. At the 45s mark the TV flashes the claim *count* at that instant, once — one stale, noisy anchor that immediately starts rotting.

Per-phone privacy is the whole mechanism: a passed-around phone would show you everyone's claim state and there is no game left.

## Technical approach

Host tab + phone PWAs + one PartyKit Durable Object per room. State: `{ phase, lines: [{authorId, targetId, text}], claims: Record<pid, bool>, midSnapshot }`. Individual claim toggles are stored server-side and **never broadcast** — the only claim data on the wire is the single mid-round integer.

The hard part is the buzzer. Late toggles must resolve on the server's monotonic clock, so phones run a countdown corrected by an NTP-style offset estimate, plus a visible, announced **300ms lockout** before zero — being robbed by network jitter would poison the ending. Destruction has to be real: the PNG renders in memory, is served once against a single-use token, and other tokens return 410; nothing touches disk.

## v1 scope

- Exactly 4 players, one round, one prompt deck of 8
- 80-char lines, 90-second claim window, one mid-round count flash
- One 1080px postcard PNG to one phone; a burn animation otherwise
- No rematch, no reconnect, 4-letter room code

## Out of scope

Rerolls, multiple rounds, custom prompts, spectators, physical printing, saved galleries, >4 players, any points display.

## Risks & unknowns

The destroyed ending may read as punitive rather than as the better story — playtesting has to tell us which. A frank group might solve it honestly in ten seconds; the private dedicatee is the friction that should stop that, and it may not be enough. Sincerity is group-dependent and curdles fast with near-strangers. Losing something you helped write may simply not be fun.

## Done means

Four phones, one run under 6 minutes, terminating in exactly one verified state: one phone holding a PNG the other three provably cannot fetch (410 on their tokens), or a server holding no render at all — with a devtools check confirming no client ever received another player's claim state.

## Overview

A 3-player silent cooperative sorting game for a living room with a TV and three phones. Six mystery items are dealt so that **each item is held by exactly two of the three players**, and each player holds four. Everyone drags their four items into one of two unlabeled bins — a circle and a square. The room wins when every item's two holders put it in the same bin. No talking. No gestures. Roughly four minutes per round.

## Problem

Every "guess what your friends are thinking" game hands the whole room the same picture and asks for the same word. That is a popularity contest, not a coordination problem. The itch here is stranger: converge on a *classification rule* you can never name, from evidence none of you fully share, while also silently agreeing on which arbitrary bin is which.

## How it works

Host screen shows six numbered face-down slots and nothing else — the room never publicly sees a single item's text. Each phone privately shows only its four slots with their contents (e.g. Slot 2: OSTRICH, Slot 3: HELICOPTER, Slot 5: BAT, Slot 6: PENGUIN) and two bin targets: ○ and □. You do not know which four the others hold, or which two items you never see.

You infer a plausible rule from your four (flies / doesn't fly? alive / not alive? has feathers?), guess which rule your partners would land on given *their* fragment, guess whether ○ means "yes" or "no", and lock in.

On lock, host reveals a single number: **"4 of 6 items agreed."** Never which items. Never who differed. Three attempts, then the round ends and everything is revealed — items, holders, and all three sorts overlaid.

The deal graph is connected (item overlaps chain all three players), so full agreement genuinely requires one shared rule and one shared bin polarity, not three private local truces.

## Technical approach

Host browser tab + phone PWAs + one authoritative PartyKit Durable Object per room (Socket.IO over Tailscale Serve works identically).

Room state: `{ roomCode, players[3], deal: {itemId -> {text, holders[2]}}, bins: {playerId -> {itemId -> 'circle'|'square'}}, attempt: 0..2, phase }`.

Sync strategy: the server holds the deal and **fans out per-connection filtered views** — a phone's socket only ever receives the four items it holds. Bin choices are local until lock; on lock the server buffers and reveals nothing until all three have locked, then computes agreement count and broadcasts only the integer. Reconnect replays that player's filtered view plus attempt number.

Genuinely hard part: deal generation. You need six items whose holder-graph is connected, where at least two mutually incompatible rules are plausible from *every* 4-item fragment, and where no fragment is a giveaway. That is a content-authoring and constraint-solving problem, not a networking one — expect to hand-tune the first eight decks.

## v1 scope

- Exactly 3 players, one round, one hand-authored deck of six items
- Two bins, three attempts, agreement count only
- Host: six slot numbers + attempt counter + count
- Full reveal screen at the end
- Room code join, no accounts, no persistence

## Out of scope

- Scoring, streaks, multiple rounds, 4+ players
- Three or more bins
- Player-authored decks
- Any chat, emoji, or reaction channel

## Risks & unknowns

- Six items may be too few to make a rule feel discoverable — may need eight
- The bin-polarity flip could dominate and feel like a coin toss; a fixed convention hint ("○ is the bigger group") may be needed
- Players will absolutely try to eye-signal; the game only works with a stated honor rule

## Done means

Three phones join a code, each shows a distinct 4-item fragment the others cannot see, all three lock, the host prints a correct agreement count, and a deck exists where a naive room fails on attempt one and succeeds by attempt three at least half the time in playtest.

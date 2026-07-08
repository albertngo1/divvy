## Overview
Magpie is a simultaneous, timer-paced pick-and-pass draft for 3–6 friends. Each phone privately holds the pack currently in front of you, your growing hoard of shiny treasures, and your secret scoring objective. It's for people who love the tension of a booster draft but hate the physical bookkeeping around it.

## Problem
In-person drafting is delicious but tedious. You pass fat stacks of cards hand to hand, the whole table stalls waiting for the one person still agonizing, you can't remember what "wheeled" back to you, and managing a hidden hand out of fanned cardboard is fiddly. The signal-reading — inferring what others want by what's missing from a pack — is the actual fun, and it gets buried under logistics.

## How it works
The host TV shows shared state only: the round timer, a row of face-down hoard stacks (one per player, showing COUNT so everyone sees who's fat but not WHAT they hold), and a "Pack 2 of 3" indicator. At the end it flips every hoard face-up and animates scoring.

Each phone shows private state: the pack in front of you right now (e.g. five treasures, each a color + a number), your hoard so far, and your SECRET objective card ("longest run of consecutive numbers," "most of one color," "matching pairs"). You tap one treasure to pick it. At each 8-second tick, all picks lock at once and every pack rotates one seat; a fresh pack slides in from your other neighbor. Dawdle and a random auto-pick fires so no one stalls the room. Three packs, ~5 picks, ~2 minutes, then reveal and score.

Load-bearing: three private, DIFFERENT things per player (incoming pack, hoard, objective) update simultaneously every tick. One phone passed around literally cannot represent four hidden hands rotating at once.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit Durable Object). Data model: Room { players[], packs[][], tick, phase }; Player { hoard[], objective, currentPack[], pendingPick }. The server owns a monotonic tick clock; at each tick it collects pendingPick from every player, auto-picks for missing ones, rotates the currentPack pointers, and broadcasts to each player ONLY their own new pack. The genuinely hard part is the global rotation barrier: every pack must be complete before any rotates, so the server waits for the tick deadline, not for all players, and reconciles late or dropped clients by auto-picking so one slow phone never freezes the draft. Clients render an optimistic pick highlight but treat the server tick as truth.

## v1 scope
- 3 players, one draft of 3 packs × 5 cards
- One deck theme (colored numbered treasures), 3 objective types
- Fixed 8s tick, auto-pick on timeout
- End reveal + automatic scoring on the TV
- No accounts; 4-letter room code

## Out of scope
- Custom decks/objectives, hate-draft hints, more than 3 packs, spectators, persistent stats, rematch flow.

## Risks & unknowns
- Is 8s the right tick? Too fast frustrates; too slow reintroduces waiting.
- Objective legibility on a phone at speed.
- Swinginess if one objective is easier to hit — needs quick balancing.
- Perceived fairness of auto-picks.

## Done means
Three phones join by code, draft 15 picks under the shared tick with no stalls, hoards stay private until reveal, the TV flips and scores correctly, and a winner is declared — end to end in under three minutes.

## Overview

A 10-minute race for 3–5 players that steals the roguelike's permadeath loop *and* Dark Souls' asynchronous message system. Everyone runs the **same** dungeon simultaneously, at different depths, and the only channel between runs is a template-constrained anonymous note left on a door. For groups who like a little treachery with their cooperation.

## Problem

The best thing in Souls games is reading "try jumping" at a cliff edge and having to decide whether a stranger is helping or laughing. That mechanic has never been put in a room with people you can look in the eye. Party roguelikes usually become one person driving a shared screen; here the whole point is that nobody can see anyone else's run.

## How it works

Six chambers, three doors each. Exactly one door per chamber is safe — the same solution for every player, generated server-side from the room seed. Everyone starts at chamber 1 with 3 HP at the same moment.

On your phone (privately): your current chamber, your three doors with your own wrong guesses crossed out, your HP, your message tokens, and any messages previous players stuck on this chamber. Pick a door. Wrong → −1 HP, that door greys out, try again. Right → advance.

On leaving a chamber you may spend a token to leave one anonymous message, composed from two dropdown wheels — `[Beware / Try / No / Praise]` + `[left door, middle door, right door, ahead, behind, the sun]`. No free text: fast, safe, and deliberately ambiguous.

Anyone entering later sees the messages and may rate each Good or Bad. **Two Goods heals the author +1 HP** — exactly the Souls appraisal rule. So honesty buys survivability; lying buys tempo, because the leader poisoning the well slows everyone chasing them. Dying isn't the end: dead players become ghosts with +2 message tokens and nothing to lose.

The TV shows five lanes of depth pips, hearts, ghost skulls, and a feed that says only *"a message appeared in chamber 4"* — never its text. The finale reveals every message with its author and a lie count.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs over WebSocket. Seeded PRNG (mulberry32) derives `solution[chamber]` server-side only. State: `players[{id, chamber, hp, alive, tokens, eliminated{chamber:[idx]}}]`, `messages[{id, chamber, authorId, wheelA, wheelB, ratings[]}]`.

Phones send `{door, chamber}`; the server rejects any move whose chamber doesn't match its record (kills replay and skip-ahead). The genuinely hard part is not latency — it's the **information firewall**. There is no single broadcast state: the host gets an aggregate view, each phone gets a personal projection, and no packet ever carries a solution index or another player's crossed-out doors. One lazy `broadcast(state)` and the whole game is readable in devtools.

## v1 scope

- 3–4 players, one run, 6 chambers, 3 doors, 3 HP
- 12 message templates from two fixed wheels, 2 tokens each
- Rating is a two-button tap; heal at 2 Goods
- 20-second ghost cooldown after the first finisher, then reveal
- Local network, no accounts, no reconnect recovery

## Out of scope

Items, enemies, multiple floors, illusory walls, message search, rematch/meta-progression, spectator mode.

## Risks & unknowns

If lying dominates, everyone ignores messages and the channel dies — the heal must be worth more than the tempo. Blind guessing is only 1-in-3, so messages may not matter; may need 4 doors in later chambers. Reading costs seconds in a race, which is the intended friction but could feel bad.

## Done means

Three phones and a TV: one player leaves "Try left door" on a chamber where left is fatal, a follower obeys it, loses HP, rates it Bad, and the end screen names the liar — and a WebSocket capture from any phone contains zero solution data for any chamber that phone hasn't entered.

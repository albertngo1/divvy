## Overview

A 90-second real-time party game for 3–5 people in one room with a TV. The host screen is a baggage carousel; each phone is one traveler's private claim ticket. Everyone is trying to grab exactly one bag off a shared belt, and the belt does not care that two of you think the same bag is yours.

## Problem

Most "grab it first" party games reward the fastest thumb, which reduces to network latency and makes the room feel cheated. And most Jackbox-shaped games treat talking as the solution. Here talking is the *attempt*, and it demonstrably fails: the tickets are ambiguous by design, the window is short, and one ticket in the room is quietly wrong.

## How it works

The host TV shows a belt scrolling right-to-left. Bags have five visible attributes (color, hard/soft, ribbon, size, sticker). Exactly one bag sits inside a highlighted **reach zone** at a time, for 3 seconds, then the next one enters. Twelve bags per round.

Each phone privately shows: your claim ticket — only **two** of your bag's five attributes ("navy · has a ribbon") — a single fat GRAB button, and a pulse when the reach zone is occupied. Phones deliberately render **no belt at all**, so every eye is on the TV and every grab is unambiguously aimed at the one bag currently in reach.

Two attributes match two or three bags on the belt, so the room talks: "anyone else navy?" "mine's the soft one!" One randomly chosen player's ticket has one **misprinted** attribute, and nobody is told whether it's them — so the loudest, most confident announcement in the room may be a lie its owner believes.

You have one grab. Resolution on the host screen:
- Two or more grabs on the same bag → the bag bursts open, confetti of underwear, **both players score 0** and are out.
- Solo grab, correct bag → +5.
- Solo grab, someone else's bag → −2, and that owner is left holding nothing.
- No grab by the end of the belt → 0.

## Technical approach

PartyKit Durable Object per room (4-letter join code), host tab + phone PWAs over WebSocket. Server state: `{beltSeed, t0, speedPxPerSec, bags[12], reachIndex, players{id, ticket:{attrs[2], misprinted}, grabUsed, grabbedBagId}}`. The host renders the belt from `beltSeed + t0` with `requestAnimationFrame`; the server independently owns `reachIndex`, advancing it on a 3s timer and broadcasting `REACH_OPEN{bagId}`.

The genuinely hard part is fair simultaneity — and this game largely dissolves it. Grabs resolve to a **bagId**, not a timestamp: the server attributes an incoming grab to whatever `reachIndex` is current, so a 200ms-laggier phone doesn't lose a race, because collisions have no winner. Only window boundaries matter; we apply a 150ms guard band (grabs arriving within 150ms of a transition are attributed to the outgoing window, matching what the player actually saw on TV) and accept the residue. Clients send `{clientMonoTs}` for post-hoc audit only.

## v1 scope

- 3 players, one round, one belt of 12 bags
- Exactly one grab per phone; exactly one misprinted ticket, always
- Host: belt, reach highlight, burst animation, klaxon, final score table with the misprint revealed
- Phone: ticket, GRAB, reach pulse, post-grab "you're out" state
- LAN only, no accounts, no persistence, no reconnect

## Out of scope

Multiple rounds, bag art beyond icons, spectators, scoring history, mid-round rejoin, avatars, mobile-vibration feedback.

## Risks & unknowns

The misprint may feel unfair rather than funny at 3 players — tune by revealing it loudly at the end. Twelve bags may be too few for real ambiguity; attribute generator needs to guarantee each ticket matches 2–3 bags. Guard-band edge grabs will occasionally surprise someone.

## Done means

3 phones + a laptop on a LAN complete one round end to end; a deliberate double-grab on the same bag produces the burst and zeroes both players; the misprinted player is correctly identified on the final screen; server-computed scores match a hand calculation of the same round log.

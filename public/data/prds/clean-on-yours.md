## Overview

A cooperative riff on **Set** for exactly three players, ninety seconds a round. The nine cards are on the shared screen as featureless numbered tiles. Each player's phone renders those same nine cards in **one attribute only** — colour, or shape, or count. A set is still "every attribute all-same or all-different," so no one person can ever confirm one. Finding sets is a conversation.

## Problem

Set at a table is a solitaire race performed in front of an audience. The fastest pattern-matcher takes every card and everybody else watches them do it. The information is fully public, so there is nothing to say to each other — the game has no table talk in it at all.

## How it works

27-card deck: three attributes (colour, shape, count) × three values. Nine tiles dealt face up.

**Host TV:** nine grey tiles numbered 1–9. A 90-second clock. Sets banked so far. A lockout bar when a call fails. That's it — the TV is deliberately useless as a board.

**Each phone, privately:** the same nine positions, rendered in its assigned channel only. The colour player sees nine coloured discs. The shape player sees nine outlines, all in the same ink. The count player sees nine tallies: 1, 3, 2, 2, 1…

Each player can independently test any triple against their own channel. So the round is people talking fast: *"2, 5, 9?"* — everyone taps 2, 5, 9. On each phone a CALL/CONFIRM button lights **only if that triple is clean on that phone's channel**. One player calls; the other two have six seconds to confirm. Three lit confirms banks the set, tiles are replaced, clock keeps running. Any refusal costs a five-second board lockout, and the TV names which channel objected — never the values.

The texture is that a dark button is itself a public statement. "Not on mine" arrives as a fact, and the room re-plans around it: if colour is dirty on 2-5-9, swap the tile you trust least.

Pass one phone around and this collapses instantly into ordinary Set. That is the whole design.

## Technical approach

Authoritative server (PartyKit Durable Object, or Socket.IO over Tailscale Serve) holds `Board{version, tiles:[{id, colour, shape, count}]}` and `Player{seat, channel}`. Each socket receives a **projection** computed server-side: `[{id, value}]` for its channel and nothing else. Full card objects never cross a player socket. The server validates set-ness itself and never trusts a client's "it's clean."

Call flow: `call{tiles, boardVersion}` → server checks the caller's channel, opens a six-second window, broadcasts a confirm prompt → two `confirm{tiles, boardVersion}` → server validates all three channels, bumps `boardVersion`, pushes new projections.

The hard part is **projection discipline plus board freshness**. One sloppy payload — a replacement-card animation carrying the full card, a debug field, an over-eager state dump on reconnect — and one player quietly sees everything. And when three tiles are replaced mid-round, a player still looking at the previous frame can confirm a stale triple; every call and confirm carries `boardVersion` and is rejected on mismatch, with the phone showing a one-beat "board moved" flash rather than a silent failure.

## v1 scope

- Exactly 3 players, one 90-second round, one 9-tile board.
- Fixed channel assignment at join; no rotation.
- Call → two confirms → bank or 5s lockout.
- Score: sets banked. No leaderboard, no rounds two and three.

## Out of scope

- 4th attribute (shading), 4+ players, channel rotation between rounds.
- Hints, solo mode, timers per call, replays.
- Any TV rendering of card attributes.

## Risks & unknowns

- The count channel is far easier to eyeball than shape; the game may feel unfair by seat. Rotation would fix it but is out of v1.
- Colour channel must use colourblind-safe values, or one seat is unplayable.
- Verbal candidate-generation may stall — if nobody can propose triples, 90 seconds of silence. Might need the TV to highlight three random tiles as a seed.

## Done means

Three phones join by code, get three different channels, and run one 90-second round. A confirmed set only banks when the server independently validates all three attributes. Stale-board confirms are rejected, not banked. Inspecting any player's socket traffic for the full round reveals exactly one attribute. Two of three test groups bank at least two sets.

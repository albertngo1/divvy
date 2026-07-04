## Overview
A cooperative real-time crossing game for a party of 4-6. One player is the **Guide**, whose phone is the whole map. Everyone else is a **Wader** stranded on the flats, each on their own phone, who cannot see the map at all. The tide is rising (the timer). Get every Wader to the far bank before the water swallows the flats.

## Problem
Map-and-pieces games on a table let the pieces glance at the board. The itch is a coordination game where the people being directed genuinely *cannot see* where they are — so the fun is the Guide frantically translating a top-down truth into voice, and the panic of committing a blind leap you can't take back.

## How it works
**Guide's phone (PRIVATE):** a top-down grid of the tidal flats — safe stones (green), deadly currents (dark), the far bank, and a live token for each Wader. The Guide narrates out loud; that's the party's main channel.

**Each Wader's phone (PRIVATE):** NO board. Just "You are on a stone" and four leap arrows (up/down/left/right), plus a heartbeat showing water rising. Crucially, **each Wader's arrows are rotated a random 90/180° relative to the Guide's north** — so "go left" is comedy, not instruction. Waders don't see each other's positions.

**Host screen (SHARED):** just fog, the rising waterline, a tide countdown, and how many Waders have reached the bank. It reveals nothing about the safe path.

Each 8-second round every Wader privately commits one leap; all leaps resolve simultaneously. Land on a stone → safe. Land in a current → swept back a row (or out, on hard mode). The Guide, watching everyone move at once, must prioritize whose blind leap to save with their voice.

## Technical approach
Authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { grid: Cell[][], waders: {id, pos, rotation, alive}[], tideRow, phase, roundDeadline }`. Host and phones are views; only the server mutates. Phones send `commitLeap(dir)`; the server applies each Wader's private `rotation`, resolves the round atomically at the deadline, advances `tideRow`, and broadcasts a per-recipient diff (Guide gets full board; each Wader gets only their own local state). Hard part: the simultaneous-commit barrier feeling *fair* under lag — server timestamps commits, locks at the deadline, and shows a synced 3-2-1 so no one blames the network for a bad leap.

## v1 scope
- 1 round = one crossing, single 6x8 grid, one fixed layout.
- 1 Guide + 3 Waders.
- 8-second leap timer, tide rises one row per turn.
- Per-Wader random rotation on.
- Win = all 3 across; lose = tide reaches the last stone.

## Out of scope
- Multiple maps / procedural generation, difficulty tiers, Wader special abilities, scoring/leaderboards, reconnection polish, more than one Guide.

## Risks & unknowns
- Rotation comedy vs. pure frustration — may need a per-Wader calibration tap.
- Does voice alone carry it, or does the Guide need a limited private ping to one Wader? Playtest first.
- Simultaneous resolution readability on the Guide's small screen with 3+ tokens.

## Done means
Four phones join a room code; the Guide sees a board the Waders provably cannot; three blind Waders complete one crossing under a real timer with simultaneous commits, and losing to the tide feels fair, not laggy.

## Overview

A 4-player cooperative real-time game. One **Controller** sees the board on their phone. Three **Pieces** see nothing but their own private instrument and a D-pad, and lock their moves simultaneously. The Controller is muted by the software: their entire outgoing bandwidth per turn is one typed word addressed to one named player, plus one veto. Named after the carrier landing call — the person who can see is not the person flying.

## Problem

Blind-navigation games fail because the sighted player has unlimited words. Given free speech and a map, the guide simply reads out three instructions and the other players type them in. The fix is not a house rule about talking; it's a bandwidth budget enforced by the client. Scarcity turns "read out the answer" into triage: *who do I spend my word on, and can I afford to let the other two guess?*

## How it works

A 5x5 grid. Three pawns, five pits, one exit. Eight turns, twelve seconds each, three shared lives.

**Controller's phone (private):** the live board — terrain, pits, exit, all three pawns. Below it, a target selector (three names) and a single-word text field (12 chars, no spaces). Once the tick locks, a **WAVE OFF** button appears for ~3 seconds with the three submitted moves drawn as ghost arrows; tapping one cancels that move (that pawn stands still). One veto per turn, use it or lose it.

**Each Piece's phone (private):** a D-pad and exactly one instrument, different per player and never explained to the others by the game —
- *Rangefinder:* a single number, straight-line distance to the exit. No hazard info.
- *Feelers:* four lights, one per direction, red if that step is a pit. No idea where the exit is.
- *Spotter:* two arrows pointing at the other two pawns. No terrain at all.

**Host TV (public):** turn number, lives, a countdown ring, and the Controller's telegram rendered huge — `→ BEN: UP`. Everyone sees the telegram, including the two people it wasn't for, which is half the fun. After the lock it shows which move got waved off. It never shows the grid.

Pieces talk freely and constantly — arguing across incompatible instruments ("my number went *up*", "everything left of me is red"). The Controller cannot talk at all. Win: all three pawns on the exit within 8 turns.

## Technical approach

Host tab + phone PWAs + PartyKit Durable Object. State: `{ grid, pits, exit, pawns[3], lives, turn, phase, telegram, veto }`. The server owns the twelve-second clock and broadcasts `phase` transitions; clients render a countdown from a server timestamp rather than a local timer, so a laggy phone never gets a shorter turn. Moves are accepted only during `COLLECT`; the phase then flips to `VETO` before resolution.

The hard part is the **atomic simultaneous lock**. Moves must be invisible until all three land or the clock expires — a piece that sees another's arrow first breaks the whole premise. Server-side only: pieces get `{locked: 2/3}`, never contents. Second hard part is the veto window, a real-time interrupt inside a turn boundary where a dropped socket must not stall the round; the server resolves on timeout regardless.

## v1 scope

- Exactly 4 players, fixed roles, one hand-authored 5x5 board
- 8 turns, 12s each, 3 lives, 3 fixed instruments
- One telegram + one veto per turn; win/lose screen

## Out of scope

Moving hazards, rotating roles, instrument drafting, multiple boards, scoring, rematch, reconnect.

## Risks & unknowns

Twelve seconds may be too tight for pieces to argue and too loose for the Controller to type — expect these to want different clocks. The Spotter instrument may be near-useless in v1 (relative bearing with no terrain); it might need the exit's bearing instead. And one veto may be the wrong number; two makes the Controller comfortable, which is the wrong feeling.

## Done means

Four phones join by QR; the three instruments are visibly different; a network inspector confirms no piece ever receives another piece's move before the lock; the TV shows the telegram and the waved-off arrow; and four real players clear the board inside 8 turns at least twice out of ten attempts — with at least one round lost specifically because the Controller spent their word on the wrong person.

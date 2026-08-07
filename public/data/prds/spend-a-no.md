## Overview

A 4-player cooperative maze game where the maze exists on exactly one phone. One player is the **Mapholder**; the other three are **Pawns** who never see the board. The twist: the Mapholder cannot give directions. They can only *forbid*, four times, for the entire game. Everything else the room learns, it learns by crashing.

For groups of 4 who like the shouting-at-the-blind-driver genre but are tired of the driver having a megaphone.

## Problem

"Blind navigation" games collapse into one loud person dictating moves while everyone else executes. The information asymmetry is real but the *agency* asymmetry ruins it — the pieces are keyboards. Starving the mapholder's bandwidth to a handful of vetoes flips it: pawns make real choices, the mapholder's silence becomes a scream, and a veto spent is itself a leaked map fragment.

## How it works

A 5×5 grid: interior walls, three pit tiles, one exit. Three pawns start at known corners. Goal: all three pawns on the exit within 8 rounds.

Each round:

1. **Simultaneously and privately**, each Pawn's phone shows only their own pawn's remembered position, a compass rosette, and the room's shared "known walls" scratch map. They tap N/S/E/W. 20-second timer.
2. The **Mapholder's phone** — and only theirs — shows the true grid, all three live pawn positions, and the three incoming proposals rendered as arrows the instant each is locked. They may tap **VETO** on any arrow while the timer runs. Four vetoes exist for the whole game; a counter on the TV shows the remaining count to everyone.
3. A vetoed Pawn's phone buzzes and they must re-pick a *different* direction. That veto is public: the TV announces "Pawn 2's EAST was struck."
4. All surviving moves resolve at once. Walls bounce (turn burned). Pits cost the team a life and teleport that pawn back to start. Collisions between pawns swap them — publicly, chaotically.
5. The TV updates the shared scratch map with every wall bumped, pit fallen into, and veto spent. The Mapholder may not speak, gesture, or emote — enforced by the room, not the software.

The fun is triage. With four vetoes and eight rounds, the Mapholder must let two people fall into pits so that the *third* survives a corridor that matters — and the room reads which crashes were allowed as a signal about which crashes were unaffordable.

## Technical approach

Host browser tab plus phone PWAs over an authoritative WebSocket server (PartyKit / a single Durable Object per room; Socket.IO over Tailscale Serve for a LAN build).

Data model, all server-side:

```
Room { code, phase, round, vetoesLeft, lives }
Grid { walls: uint32 bitmask per cell, pits: Set<cell>, exit: cell }  // never broadcast
Pawn { playerId, cell, proposal: Dir|null, locked: bool, vetoedDirs: Dir[] }
PublicMap { knownWalls: edge[], knownPits: cell[], vetoLog: entry[] }
```

Sync strategy: clients send intents only (`propose`, `veto`); the server owns the grid and emits three distinct view-projections per tick — full truth to the Mapholder socket, self-position-plus-PublicMap to each Pawn, PublicMap-plus-veto-counter to the host. Projections are computed server-side so a Pawn's devtools contain no grid.

Genuinely hard part: the veto race. A veto arriving 40ms after a lock is ambiguous — did the Mapholder see the arrow or guess? Server timestamps every lock, gates vetoes to a strictly-after window, and freezes the round-resolution tick until the 20s timer plus a 300ms grace drains. Re-picks after a veto need their own mini-timer without desyncing the other two pawns' clocks.

## v1 scope

- Exactly 4 players: 1 Mapholder, 3 Pawns.
- One hand-authored 5×5 grid. No generator.
- 8 rounds, 4 vetoes, 3 team lives.
- Win/lose screen naming which veto the room thinks was wasted.

## Out of scope

Multiple rounds or grid rotation, Mapholder scoring, hidden-traitor Mapholder, more than 4 players, mobile-native anything, rejoin after disconnect.

## Risks & unknowns

Four vetoes may be too few to feel agentic or too many to force pain — needs playtest tuning, probably 3. The no-talking rule on the Mapholder is social, not technical, and one groaning host breaks the game. Pawns may collectively fail to track their own positions, which is either the joke or the failure mode.

## Done means

Four phones join by room code; three see only their own pawn and the shared scratch map; one sees the true grid; a veto lands within 300ms on the target phone and appears on the TV; the round resolves identically on all five screens; a full 8-round game reaches a win or loss screen without a manual reset.

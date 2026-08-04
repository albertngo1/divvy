## Overview

A 4-player, 12-minute cooperative game in two acts. Act 1: one player (the Reader) holds a phone showing a maze that is physically consumed by being looked at. Act 2: the maze is gone and the party must cross it using only what three other players wrote down — in private notebooks with a brutal character budget, readable only by their owner.

The pitch is that the map migrates from silicon, through one person's voice, into three partial human records, and the game is the lossy compression.

## Problem

Memory party games test recall of things everyone saw. Nothing tests *what a group chose to record* under scarcity. And blind-maze games have no second act: once the guide reads the map, the tension is over. Making the map destructible turns "read it out" into a live budgeting decision with no undo.

## How it works

**Act 1 (90 seconds).** The Reader's phone shows a 6×6 maze, fully blacked out. Holding a finger on a tile reveals it — and after 400ms that tile is permanently scorched: it goes black on their screen and can never be revealed again. The Reader can see maybe 15 of 36 tiles before the clock ends. They talk the whole time.

Each of the three Scribes has a private notebook: a text field with a hard 60-character budget for the entire game, and a live counter. The budget is spent, not per-note — spend it all on one sentence or ration it. Scribes cannot see the maze, cannot see each other's notebooks, and cannot see how much budget the others have left. The TV shows only three shrinking bars — characters remaining — so the room can see *someone* is nearly out without knowing what they wrote.

**Act 2.** The Reader's phone goes fully black and stays black; they become a piece like everyone else and may not use their memory (enforced socially, and the TV names them mute for the first three moves). The party walks the maze one step at a time: each Scribe may read one of their own notes aloud, then all four commit a direction simultaneously; majority moves. Walls cost a turn. Ten turns to reach the exit.

The fun is watching a Scribe realize at move 6 that "3rd row two walls left" meant something precise 8 minutes ago and nothing now.

## Technical approach

Cloudflare Durable Object per room. State: `maze` (36 tiles, walls as edge bitmask), `scorched: Set<tileId>`, `notes[playerId]: string[]`, `budget[playerId]: number`, `pos`, `turn`, `commits`. The maze is never sent to any client in full — the Reader's socket receives tile payloads one at a time, only in response to a hold event, and the server marks the tile scorched *before* replying, so a disconnect mid-hold still burns it.

The genuinely hard part is that the reveal is a real-time, latency-sensitive, irreversible action: a 120ms RTT on a held finger must not cost the player a tile they didn't mean to open. Solution: client sends `holdStart(tile)` / `holdEnd`, server runs its own 400ms timer per tile and is the sole authority; the client renders an optimistic 400ms fill that snaps to the server verdict. Screenshotting the revealed map is unpreventable and is treated as a house-rules problem, not an engineering one.

## v1 scope

- 4 players, 1 hand-built maze, 1 full game
- 90s reveal timer, 400ms burn, 60-char lifetime notebook budget
- Act 2: 10 turns, simultaneous commit, majority move, walls cost a turn
- TV: burn heatmap during Act 1, budget bars, position dot in Act 2

## Out of scope

Multiple mazes, Reader rotation, drawing instead of typing, scoring, reconnects, spectators, any Act-2 hint system.

## Risks & unknowns

Typing on a phone under a 90s clock may be too slow — abbreviations might dominate and produce unreadable notes, which is either the best or the worst part. The Reader may go silent and just read tiles selfishly. 60 characters may be wildly mistuned; needs playtest calibration.

## Done means

A hold on the Reader's phone reveals and permanently scorches a tile server-side, verified by rejoining mid-game and seeing it still black; three notebooks stay private across sockets; the party completes Act 2 using only read-aloud notes; two of three playtest groups fail at least once and immediately ask to play again.

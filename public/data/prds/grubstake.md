## Overview
A competitive hidden-information race for 4-6 players. One player is the **Assayer**, whose phone is the secret ore grid (the board). Everyone else is a **Prospector** moving blind across that same grid. For groups who like Battleship-style blind movement plus a slow-burn "who's playing me?" read.

## Problem
"One phone is the board" games usually make the board-holder a neutral narrator with no stakes, so the asymmetry is flavor. The itch: give the board-holder a hidden agenda that can only be pursued through private, per-phone whispers — so the pieces have to deduce the map AND the puppeteer at once.

## How it works
The host screen shows a blank grid with just each Prospector's token and banked totals — never the ore. The Assayer's phone shows the true grid: veins of different values scattered across the tiles. Each tick, every Prospector secretly picks a move (N/E/S/W/dig) on their own phone; none see the grid or each other's choices. The server resolves simultaneously: land on a vein and your phone privately banks its value; **two prospectors on the same tile collide and both bank nothing** (a claim dispute). Here's the twist: before the game the Assayer secretly **grubstakes** one Prospector and wins the whole game only if that Prospector finishes richest. The Assayer holds 3 **rumor tokens**; spending one privately sends a chosen Prospector a single TRUE directional hint ("gold two tiles east"). Prospectors see only their own hints and their own bank — so getting good tips could mean you're the favorite... or the mark being lured into a collision. Everyone's reading the tip pattern to reverse-engineer the Assayer's pick.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object per room). Data model: `Room { grid: {value}[][], prospectors: {id, pos, bank, hintsSeen}[], assayerId, backedId, rumorTokens }`. The Durable Object holds `grid`, `backedId`, and every private `bank` — host gets only positions + totals, each Prospector gets only their own bank + hints, Assayer gets the grid but NOT other players' banks. Sync: simultaneous-reveal turns — server collects all moves, resolves collisions and banking atomically, then fans out per-recipient masked deltas. The hard part is the reveal contract: each socket must receive a different filtered view of the same tick with no leakage (a mis-scoped broadcast exposes the grid and kills the game), so all fan-out goes through one per-recipient projector.

## v1 scope
- One fixed 6x6 grid, ~5 veins, values 1-3
- 1 Assayer + 3 Prospectors, one round of 6 ticks
- 3 rumor tokens; collision = both zero
- End screen reveals grid, banks, and whether the grubstaked player won

## Out of scope
- Multiple rounds, variable grid sizes, movement power-ups
- Assayer bluffing via false hints (v1 hints are always true), reconnection

## Risks & unknowns
- Blind simultaneous moves may feel random rather than skillful across only 6 ticks — tuning grid density is everything.
- The favorite-deduction layer might be too subtle to land in a single round; may need a mid-game "who's the mark?" vote to surface it.
- Collision rule could make prospectors too passive.

## Done means
On one host + 4 phones over LAN, prospectors move blind for 6 simultaneous ticks banking private values, the Assayer sends true private hints only to chosen phones, no client ever receives the full grid before the reveal, and the end screen correctly declares whether the secretly-backed prospector won.

## Overview
Order Up turns the most passive group ritual — scrolling a takeout menu — into a hidden-commitment betting game about how well you know your friends' appetites. For 3–5 people who've eaten together enough to think they can predict each other. Play it while actually waiting for food.

## Problem
Deciding what to order is dead time everyone half-watches. Yet a table's menu picks are secretly a rich signal — who always gets the safe thing, who chases novelty, who mirrors whoever ordered first. Order Up mines that. And it can't work with one shared phone: every player must simultaneously and secretly commit both a pick and a set of reads, or the whole information game evaporates.

## How it works
The host screen shows a real 8-dish menu (curated or photographed). Two hidden phases per phone, both private:
1. **Lock-in:** each phone privately selects the ONE dish they're "ordering." Hidden from all.
2. **Reads:** each phone privately bets its chips predicting each OTHER player's locked dish — stake more on reads you're confident in.

**Each phone shows privately:** the menu, your secret pick, your chip pool, and a per-opponent betting grid. **The host shows only:** the menu and a countdown — never picks or bets until reveal. On reveal the host flips every pick at once. Scoring has two engines: you earn chips for each correct read (scaled by stake), AND you earn a "cover" bonus if few or no players guessed YOUR dish. This creates the core tension: order what you actually crave (predictable → opponents cash in on you) versus order a curveball to bank the cover bonus (but reliable curveball-orderers become guessable too). Highest chips wins.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve or PartyKit). Data model: `Room{menu[], phase, players[]}`, `Player{id, pick, bets:{targetId:{dishId:stake}}, chips}`. Sync: server enforces two sealed phases with atomic reveal — no phone receives any pick or bet until every player has committed and the host advances. The hard part is the simultaneous double-blind: picks and reads must be uncorrelated in time (you shouldn't read after seeing hints of others' picks), so the server buffers all commitments and only releases the joint reveal, with a lock-in barrier before the reads phase opens.

## v1 scope
- One hardcoded 8-dish menu
- 3–4 players, one round
- Two sealed phases (lock-in, reads), atomic reveal, two-engine scoring
- Flat 10-chip pool per player

## Out of scope
- Real ordering integration / bill anything
- Multiple menus or rounds, player history/tells across games
- Variable menu sizes, dietary filters

## Risks & unknowns
- Does the cover bonus balance against read-scoring, or does one strategy dominate?
- 8 dishes may be too many (unguessable) or too few (obvious)
- Fun likely scales with how well the group knows each other — cold groups may flop

## Done means
Four phones join, each secretly locks a dish and places staked reads on the other three, and on reveal the host shows every pick simultaneously plus a chip tally where at least one correct read and one 'cover' bonus visibly changed the standings.

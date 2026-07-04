## Overview

Silent turf-claim game. A shared board of 20 hex tiles displays on every phone. Each round, every player privately picks 3 tiles to claim. On reveal, if any two players picked the same tile, that tile is VOIDED for both. Objective: claim all 20 tiles collectively over 4 rounds without wasting picks on doubles. No talking allowed during pick phases (mic-monitored). Coordination fails you every round; silent inference from prior rounds is the only path. Per-phone essential because picks must be private before simultaneous reveal.

## Problem

Every cooperative game (Hanabi, Codenames, Just One) assumes players CAN communicate — the game just restricts *what* they can say. Nobody has built a full-silence coop where the whole challenge is inferring your teammates' next move without any communication channel. The per-phone architecture makes this genuinely playable because the "no talking" rule is enforceable via mic-amplitude monitoring, and picks stay hidden until reveal.

## How it works

Room code join, 3-5 players. Board = 20 numbered hex tiles displayed on every phone. Round 1: each player picks 3 tiles by tapping. 30-second timer. Simultaneous reveal shows who picked what; any tile with 2+ claimants is voided (highlighted red). Round 2: remaining unclaimed tiles are still available; picks again. Continue for 4 rounds. Win = all 20 tiles claimed by someone by end of round 4 (with 3 tiles × 4 rounds × 5 players = 60 total picks max, plenty of room if overlaps are minimized). Mic amplitude check during pick phases: if any phone detects speech above threshold, all phones display "SILENCE BROKEN — round penalty" and the round costs 2 additional voided tiles.

## Technical approach

PartyKit / Durable Objects. Room state = `{board: 20 tiles, picks_this_round: {player_id: [tile_ids]}, claimed: {tile_id: player_id|null}, voided_this_round: [tile_ids]}`. Mic monitoring via `getUserMedia` + Web Audio API `AnalyserNode` computing RMS every 100ms; if any phone crosses ~55dB threshold for 500ms during pick phase, phone emits `silence_broken` event that server broadcasts. Simultaneous reveal via server-side batch resolve at timer end. Board state persists across rounds within a session.

## v1 scope

4 players, 20 tiles, 4 rounds, 3 picks per round, mic silence enforcement, 30s pick phase, simultaneous reveal. Score = binary win/loss (all tiles claimed by end). No difficulty tiers, no board size variants, no tile bonuses (all tiles equal).

## Out of scope

Weighted/valued tiles, whispered-comms allowed mode, per-player role asymmetry (e.g. one player has "extra pick" ability), pattern-based challenges ("claim a hexagon of tiles"), tournament brackets, historical stats, LLM strategy hint mode.

## Risks & unknowns

Silent inference is genuinely hard — playtest may reveal that groups can't figure out any coordination pattern and just double-tap repeatedly. The number of picks per round (3) and rounds (4) need careful math tuning: too generous and it's trivial, too tight and it's impossible. Mic threshold may fire on laughter/coughs, ruining a round — needs a small grace window and clear indicator ("mic is listening"). The mechanic is intellectually satisfying but might feel slow; may need to add a shorter format (10 tiles, 2 rounds) for casual play.

## Done means

4 friends open the room, agree to silence, and play through 4 rounds with an outcome — win or loss. If the group's silent post-reveal expressions include exaggerated shrugs, pointing, and eyebrow raises trying to communicate strategy, v1 shipped.

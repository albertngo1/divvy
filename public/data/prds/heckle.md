## Overview
Heckle is a survival game (think Valheim/Raft/7 Days) with one twist: the disasters aren't spawned by the game's director — they're spawned by the audience. The streamer plays a normal survival run; viewers spend micro-payments to trigger storms, predators, structural failures, and cruel little events. Every viewer sees their name on a global "Hecklers" leaderboard ranked by how much damage their sabotage caused.

## Problem
Stream viewers are passive. Chat spam and channel-point redemptions are toothless — nobody feels like they *changed the run*. Meanwhile survival games ship a fixed difficulty director that never surprises the streamer who has 900 hours in. Heckle turns the audience into the antagonist and gives their attention real, competitive weight.

## How it works
Streamer launches a run; a lobby code links the game to a web overlay. Viewers open the overlay, see a menu of sabotage cards ("Blizzard — $0.25", "Aggro the wolf pack — $0.50", "Rot the food stores — $0.40"), and pay to fire them, subject to a cooldown and an escalating price curve so late-game chaos costs more. The game scores each event's actual consequence (HP lost, structures destroyed, time added) and attributes it to the buyer. Survive the night and the streamer banks the pot; die and the top heckler gets a crown.

## Technical approach
Godot 4 for the game (fast survival loop, good networking). The overlay is a small React web app; the game exposes a local websocket the overlay and a relay talk to. Micro-payments via Cloudflare's x402 / a Stripe-hosted tab so viewers aren't entering a card per heckle — they preload a $5 wallet. An event bus (Redis pub/sub on a cheap relay) fans viewer purchases to the game client; the game validates cooldowns/price and enacts the event, then emits a scored result back to update the leaderboard. Hard part: anti-abuse (rate limiting, refund griefers), and keeping the sabotage economy *fun* rather than pay-to-instantly-kill — tuning the price/impact/cooldown curves is the whole game.

## v1 scope
- Single survival biome, one night/day cycle
- 6 sabotage cards with cooldowns and a price curve
- Web overlay with preloaded wallet (test-mode payments)
- Live heckler leaderboard for one session
- Streamer "survive the night" win/lose state

## Out of scope
- Real payouts to streamers
- Multiple biomes/tech tree
- Native Twitch extension approval
- Persistent cross-session rankings

## Risks & unknowns
- Payment-for-sabotage may trip Twitch/app-store gambling-adjacent policies
- Balancing so money buys *tension*, not instant death
- Latency between purchase and in-game event breaking the moment
- Whether streamers accept viewers actively trying to end their run

## Done means
Two browsers as "viewers" can preload a wallet, spend to trigger three different sabotage events during a live run, see those events happen on the streamer's screen within 2 seconds, and watch their names sort correctly on the damage leaderboard when the streamer dies.

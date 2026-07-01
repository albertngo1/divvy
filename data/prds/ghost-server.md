## Overview
Ghost Server is a web app that hunts for multiplayer games flatlining in real time and organizes their last players into synchronized "revival" sessions. It's for the nostalgic and the stubborn — people who love a game the world has moved on from (War Robots, World of Warships, New World: Aeternum, a dead Half-Life 2: Deathmatch server) and want to feel a lobby fill up one more time.

## Problem
Multiplayer games die quietly. Player counts drop below matchmaking critical mass, so the remaining fans queue into empty lobbies, conclude "it's dead," and leave — which kills it faster. The population is often still there; it's just never online *simultaneously*. No tool coordinates a scattered player base into a single moment.

## How it works
The app shows a leaderboard inverted from Steam's usual charts: not the most-played, but the *barely-alive* — games with small, declining, but nonzero populations. Each has a "pulse" sparkline. You pick a game, propose a Rally ("Saturday 8pm ET, need 24 players"), and others RSVP. When RSVPs cross the game's matchmaking threshold, everyone gets a push/ntfy ping: "Rally is GO — log in now." A live counter shows real concurrent players during the window so people see the lobby actually filling.

## Technical approach
Stack: static front-end (reuse the Divvy d3/canvas setup) + a small scheduled worker. Data sources: SteamSpy `top100in2weeks` for the candidate pool, then Steam Web API `ISteamUserStats/GetNumberOfCurrentPlayers` (free, per-appid) polled every ~10 min to build a concurrent-player timeseries. Data model: `game{appid, name, threshold}`, `sample{appid, ts, players}`, `rally{appid, time, rsvps[], fired}`. "Dying but alive" = 7-day slope negative AND current concurrents inside a band (e.g. 20–2000). Notifications via Web Push + ntfy. The genuinely hard part is per-game matchmaking thresholds — Steam won't tell you how many players a queue needs, so v1 crowdsources it ("how many did it take to get a match?") and refines an estimate per game.

## v1 scope
- Poll and store concurrent counts for the SteamSpy top-100
- Inverted leaderboard with pulse sparklines
- One-click Rally creation with a fixed time and RSVP list
- ntfy ping when RSVP count hits a user-entered threshold
- Live concurrent-count widget during a rally window

## Out of scope
- In-game integration or actual matchmaking (we only coordinate humans)
- Accounts/auth beyond a shareable rally link
- Non-Steam platforms

## Risks & unknowns
- Steam rate limits on GetNumberOfCurrentPlayers across 100 appids
- Chicken-and-egg: needs enough fans of *one* game to hit threshold
- Thresholds are fuzzy; a fired rally that still can't make a lobby is a bad first impression

## Done means
For at least one declining game, two real people RSVP to a rally, both receive the "GO" ping at the scheduled time, and the live counter shows their session's concurrent count rising during the window.

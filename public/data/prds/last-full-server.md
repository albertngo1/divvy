## Overview

A public, always-on dashboard that tracks the surviving multiplayer populations of old Source/GoldSrc-era and other server-browser games — Counter-Strike: Source, Half-Life, Black Squad, Heroes & Generals, World of Tanks Blitz's ilk — and answers a question SteamDB cannot: *where* are the survivors, and *when* are they awake. For lapsed players, server-community admins, and anyone who likes watching a subculture's daylight shrink.

## Problem

Every "is this game dead?" resource reports a single global concurrent-player number. That number is useless to the actual player: a game with 900 concurrents can be perfectly alive if 700 of them are Brazilian and play 20:00–01:00 BRT on one surf server, and perfectly dead if the 900 are smeared across 40 countries. The interesting structure — a game retreating into one time zone, one language, one server admin's basement — is invisible in the aggregate, and nobody is recording it before it vanishes.

## How it works

Every 5 minutes, poll the Steam master server list for a watchlist of ~30 appids and record every server: IP, port, name, map, players/maxplayers, tags. Geolocate the IP, convert the sample to the server's *local* wall-clock time, and store it.

The front page is a world map where each dot is a server sized by peak occupancy and colored by game. Two viz modes carry the idea:

1. **Clock face** — a 24-hour radial histogram in *local* time per country, so you see that Brazil's CS:S plays at night and Russia's plays after work.
2. **Retreat timeline** — a stacked area of occupancy-by-country over months. Watching a game's colors collapse from twelve countries to two is the whole product.

A "still worth joining" leaderboard ranks servers by hours-per-week spent above 60% full, with a direct `steam://connect` link.

## Technical approach

Poller in Go: `IGameServersService/GetServerList` (Steam Web API) for discovery, then raw UDP A2S_INFO/A2S_PLAYER to each server for truth (the master list lies about player counts). Concurrency-capped, 1 req/server/5min, honoring backoff. Geolocation from MaxMind GeoLite2 City plus ASN; hosting-provider ASNs (OVH, Hetzner) get flagged since a German-hosted server may be a Brazilian community — resolve that by matching server *name* language with a fastText language-ID model and preferring the player-language signal.

Storage: TimescaleDB hypertable `(ts, server_id, players, map)` with a continuous aggregate rolling to hourly buckets; raw samples expire at 90 days, hourlies kept forever. Server identity is `(ip, port)` but names churn constantly, so keep a `server_names` history table for renames.

Front end: SvelteKit + deck.gl (ScatterplotLayer over a dark basemap) and D3 for the clock and timeline. Ship a daily Parquet dump to make it citable.

Hard part: A2S has been rate-limited and spoofed for years — fake servers stuffing 64/64 players to farm the browser are endemic. Detect them with a plausibility filter: real servers have player *ping* distributions clustered by geography and player counts that change smoothly; fakes are flat, integer-perfect, and their A2S_PLAYER names are junk or duplicated. Score each server's realness and dim the liars rather than deleting them.

## v1 scope

- 3 games, one poller, SQLite + a cron
- One page: world map + 24h local-time clock per country
- Naive fake-server filter (drop servers whose A2S_PLAYER list disagrees with the count)
- 30 days of history before launch

## Out of scope

- Games without a public server browser (matchmaking-only titles)
- Player identity, tracking individuals, or leaderboards of people
- Discord bots, alerts, historical backfill from third parties

## Risks & unknowns

Steam Web API key rate limits at ~100k calls/day; UDP probes from a single VPS may get null-routed by DDoS-protected hosts. Fake-server pollution could swamp small games. Geolocation of hosting providers is systematically wrong in ways that could make the map's central claim misleading.

## Done means

For CS:Source, the site shows a map with ≥500 verified-real servers, and clicking Brazil renders a local-time histogram whose peak matches a manually spot-checked evening peak within one hour, with 30 days of stored history rendering the retreat timeline.

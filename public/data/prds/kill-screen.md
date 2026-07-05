## Overview
Kill Screen is a browsable, embeddable memorial for online games that have been *server-killed* — titles that became unplayable (or half-playable) the day the publisher pulled the plug. It's for the crowd arguing about digital ownership: preservationists, ex-players Googling "is X still online," and journalists who need a citation. Think Airplane Boneyards, but for dead lobbies instead of dead 747s.

## Problem
When a game's servers die, the knowledge scatters: a Reddit thread, a fan wiki edit, a dead store page. There's no single view that answers *what died, when, why, and can I still play it.* The ownership debate (the HN "it's about ownership" post) is loud but data-poor — everyone has anecdotes, nobody has a map.

## How it works
A curated dataset of ~300 server-dependent games, each with: title, genre, launch date, server-shutdown date, "cause of death" (publisher shutdown / studio closure / license expiry / migration), and a *playable-status* flag (fully dead / private-server revival / offline mode patched in). The site renders two linked views: a horizontal timeline (headstones dropping onto the year they died, height = peak concurrent players) and a genre/publisher treemap. Clicking a headstone opens an obituary card with the shutdown announcement link, private-server project links, and a "reanimation" badge if a community server exists. A tiny search + filter ("show only games killed by license expiry").

## Technical approach
Static site: SvelteKit + D3 for the timeline (time-scale x-axis, force-based headstone declumping), no backend. Data lives in a versioned `deaths.yaml` seeded from Wikipedia's "List of ended online games," the Internet Archive's store snapshots, and MobyGames metadata; each entry carries source URLs so it's auditable. Peak-concurrent numbers pulled from SteamDB / SteamCharts historical CSVs where available. A nightly GitHub Action re-checks each "revival" link with a HEAD request and flips a `revival_dead` flag when a community server 404s — the genuinely fiddly part is keeping revival links from rotting, ironically the same rot the site documents.

## v1 scope
- 50 hand-entered games, YAML data model, source URL per field
- One timeline view with headstones + hover obituary
- Filter by cause-of-death
- Static deploy on GitHub Pages

## Out of scope
- User submissions / moderation queue
- Live player counts for *alive* games
- Any emulation or hosting of the games themselves

## Risks & unknowns
- "Cause of death" is often unconfirmed — needs a "disputed" state
- Peak-player data is spotty pre-2015
- Scope creep toward a full game database; must stay a graveyard, not MobyGames

## Done means
A public URL where a visitor scrubs a timeline, clicks a 2013 headstone, reads a sourced obituary, and sees a live-verified link to the fan server that revived it — with the underlying YAML openly forkable.

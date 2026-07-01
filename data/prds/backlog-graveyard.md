# Backlog Graveyard

## Overview
A darkly funny "shame index" that turns your Steam library into a graveyard of games you bought and never played, each rendered as a tombstone with its purchase date and zero-hour epitaph. For every PC gamer with a guilty conscience and a Steam sale habit.

## Problem
The "pile of shame" is a beloved gamer in-joke: everyone owns dozens of games they bought on impulse and never launched. The itch is to *see* it — to have the sunk cost, the wasted hours-that-never-happened, and the specific never-touched titles laid out as a single mortifying artifact you laugh at and then post.

## How it works
You enter your Steam ID (or vanity URL). The app pulls your owned games and playtime, then builds a graveyard: a grid of tombstones, one per never-played (0-minute) game, each engraved with the title, estimated purchase/acquisition date, and a randomized epitaph ("Bought in the 2019 Summer Sale. Never awoke."). A "shame index" gauge sums estimated dollars spent on <1-hour games. Sort by "most expensive regret," "longest interred," or "biggest lie" (games with 3 minutes of playtime). Share exports the graveyard + shame score as a PNG.

## Technical approach
Static site — **Svelte** front end, CSS/canvas for the tombstone grid. A tiny serverless proxy holds the Steam API key.

- **Data source:** **Steam** Web API — `GetOwnedGames` (with `include_played_free_games` and `include_appinfo`) returns appid, name, `playtime_forever`, and icon; the Steam **store** appdetails endpoint supplies price. There is no reliable "purchase date" in the public API, so acquisition date is estimated from Steam community badge/level data or omitted with a graceful fallback.
- **Data model:** `library = [{appid, name, playtime_forever, price, header_image}]`; derived `graveyard = library.filter(playtime < threshold)` with a computed `shameIndex = sum(price where playtime < 60min)`.
- **Key algorithm:** the "shame index" — classify each game as buried (0 min), barely-touched (<1h), or alive; weight the dollar total by how untouched; generate deterministic epitaphs seeded by appid so they're stable across reloads.
- **Hard part:** it's mostly a wrapper around one API — the real work is (a) hiding the API key behind a proxy without a full backend, (b) handling private Steam profiles gracefully, and (c) making the graveyard *look good enough to post* (typography, tombstone art, layout).

## v1 scope (humiliatingly small)
- Steam ID input → owned games via one API call.
- Grid of tombstones for all 0-minute games, sorted by name.
- A single "shame index" dollar number.
- PNG export.

## Out of scope (for now)
- Purchase-date estimation (omit or fake gracefully at first).
- Login/OAuth; just take a public Steam ID.
- Cross-platform (Epic, GOG) libraries.
- Leaderboards or social comparison.

## Risks & unknowns
Prior-art verdict: **Exists.** `steamshame.netlify.app` and multiple "pile of shame" playtime calculators already ship this exact concept. This is a kill candidate. The only defensible re-angle is *presentation*: lean hard into the graveyard/tombstone aesthetic and the deterministic-epitaph generator so the output is a memeable object, not a stats table — competing on art direction and shareability, not on the underlying calculation. Given the crowded field, treat as low-priority. Secondary risk: many Steam profiles are private, killing the lookup for a chunk of visitors.

## Done means
Enter a public Steam ID and get a graveyard of that account's never-played games with a computed shame-index dollar figure and a PNG export that looks good enough to post unprompted.

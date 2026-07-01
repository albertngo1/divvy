## Overview
Warren is an ambient, self-generating artifact: a top-down dungeon map that grows by exactly one room every night, each room encoding a single day of your life. By December 31st you can load it in a viewer and physically walk your whole year as a crawlable warren of chambers. For quantified-self folks and devs who want a year-in-review that's a *place*, not a bar chart.

## Problem
Every 'year in review' is a static infographic you glance at once. The itch: make your year navigable and felt — a brutal week should read as a cramped, monster-choked wing you have to fight through; a joyful, productive stretch as a bright treasure hall.

## How it works
A nightly cron reads yesterday's signals and maps them to one room: floor area = activity volume (steps + commits), biome/tileset = a dominant mood proxy, monster/trap count = stress, treasure chests = shipped PRs and personal records, and a short corridor stitches it to the prior day's room. The room is appended to a growing Tiled TMX file. A small Phaser viewer lets you walk the warren; 'today' is always the deepest, newest chamber.

## Technical approach
Node cron on the mac-mini. Sources: local `git log` across repos, Open-Meteo for weather, later the Garmin MCP (localhost:8003) for steps/sleep/body-battery and a calendar ICS for density. Durable artifact is a Tiled TMX (XML) — deliberately, so it outlives the generator and opens in real tooling. Room interiors from a seeded generator (BSP split or small WFC); the seed is derived from the date + metrics so re-runs reproduce byte-for-byte. Data model: append-only `roomRecord = { date, metrics, seed, slot }`. Viewer is Phaser 3 loading the TMX. The hard part is placing an ever-growing set of rooms on a plane without overlap while keeping the whole thing walkable — solved by assigning each day a slot along a space-filling curve (Hilbert or spiral) so 365 rooms tile neatly.

## v1 scope
- Cron writes one room/night from git commits + weather only
- Append to a single growing TMX
- Static Phaser viewer that walks the current map
- After 7 nights it visibly reads as a 7-room corridor

## Out of scope
- Garmin/calendar sources
- Real combat, monsters that fight back
- Web hosting / sharing
- Retroactive backfill of past days

## Risks & unknowns
- Room overlap and dead-end navigability as the map scales
- TMX bloat and viewer perf past ~200 rooms
- Data→aesthetics mapping feeling arbitrary rather than legible

## Done means
After 7 consecutive nightly runs, a valid TMX with 7 connected rooms exists and is walkable in the viewer, and each room's size and tile theme visibly track that day's commit count and weather.

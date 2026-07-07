## Overview
Under Construction is a self-hosted daemon that quietly assembles a personal *webring of one* over a year. Every night it generates a single small HTML page summarizing that day, chained to yesterday and tomorrow with old-school `< prev | ring | next >` navigation and a spinning UNDER CONSTRUCTION GIF. It's for people who miss the hand-made web (sparked by sneakerweb + Radicle) and want an ambient artifact that grows on its own.

## Problem
Your daily digital exhaust — commits, steps, songs, weather — evaporates into siloed apps. Year-in-review recaps are slick, corporate, and arrive once. There's no browsable, ownable, human-scale record you can *click through* like a diary that built itself. And nobody hand-makes web pages anymore.

## How it works
At 23:55 a job pulls the day's signals, drops them into a Nunjucks template, and writes `days/2026-07-07.html`. The template is intentionally 1998: table layout, `<marquee>`-adjacent CSS, dithered background, a mood-colored border. It rewrites yesterday's page to point `next →` at today, sets today's `← prev`, and regenerates a `ring.html` index (a spiral or calendar grid of every day so far). Served as static files. Each page is tiny (<8KB) and self-contained. Optional: a `webring.txt` others can join so several friends' rings interlink.

## Technical approach
Stack: Node + Nunjucks + a cron (or systemd timer), output to a static dir served by the existing homelab nginx/Caddy. Data sources: local git log across repos, Garmin MCP (steps/sleep/body-battery), OpenWeather history API, Last.fm/ListenBrainz recent tracks, optional `git`-style journal file. Data model: one JSON per day (`day.json`) frozen as the source of truth; the HTML is a pure render so templates can evolve without losing history. Mood color = HSL mapped from a weighted blend (sleep score → lightness, activity → saturation, a sentiment pass over commit messages → hue). Hard part: making 365 auto-generated pages feel *authored* not templated — solved with per-day layout jitter seeded by the date (varying GIF, border, ASCII divider) so no two look identical.

## v1 scope
- Cron writes one dated HTML page from git log + weather only
- prev/next links + a flat `ring.html` index
- One brutalist template with date-seeded visual jitter
- Served static from homelab

## Out of scope
- Multi-person interlinked webrings
- Garmin/Last.fm sources (add after v1)
- Any database or dynamic backend
- Editing pages by hand

## Risks & unknowns
- Aesthetic risk: could read as gimmicky rather than charming
- Data-source auth churn (Garmin/Last.fm tokens expiring mid-year)
- A missed cron night leaves a gap — need idempotent backfill from `day.json`
- Privacy: don't leak commit contents / locations if ever shared

## Done means
After running for 7 consecutive days, visiting `/ring.html` shows 7 distinct dated pages, each navigable prev→next in a loop back to the index, generated with zero manual edits, and a killed-then-restarted cron backfills any missed day from stored `day.json`.

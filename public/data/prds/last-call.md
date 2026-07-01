## Overview
Last Call is a small social web app that turns 'stuff is leaving Netflix this month' into a competitive game. Sony deleting 551 paid-for movies and PlayStation killing physical discs made the point loudly: your access is on a timer. Last Call is for friend groups who share taste and never actually watch the things they mean to.

## Problem
Streaming catalogs churn constantly and now purchases get revoked outright. People passively add titles to a watchlist, then let them expire unwatched. The itch: your 'someday' list is quietly evaporating and nothing makes you act on it. Passive consumption has no stakes.

## How it works
You pick your services and region; the app pulls a 'leaving soon' feed and shows a countdown timeline. You and friends form a league and draft a shared shortlist of endangered titles. Watching a title before it delists scores points (bonus for last-day heroics); a title that expires unwatched costs the person who drafted it. Weekly standings, a 'graveyard' of everything the league let die, and taunting notifications ('The Northman leaves in 48h and nobody has claimed it'). It's Fantasy Football for your streaming FOMO.

## Technical approach
Next.js + Postgres. Metadata from TMDB API (titles, posters, runtime). The hard data is *expiry dates* — no clean official API — so v1 scrapes a handful of 'leaving soon' listing pages (per-service, per-region) into a nightly job, normalizing to `{title_id, service, region, leaving_date}`. Watch confirmation is manual 'mark watched' in v1, upgradable to Trakt API scrobble sync later. Data model: User, League, Draft(user→title), WatchLog, ExpiryEvent. A cron reconciles: at each `leaving_date`, any drafted-but-unlogged title fires a deduction and moves to the graveyard. The genuinely hard part is keeping leaving-date data fresh and correct across services and regions without an official source.

## v1 scope
- One region, two services
- Scraped 'leaving soon' list, refreshed nightly
- Manual 'mark watched' button
- One league, simple weekly leaderboard + graveyard

## Out of scope
- Automatic detection of what you actually watched
- Multi-region, every service
- Purchase-revocation tracking (the Sony case) — interesting but separate

## Risks & unknowns
- Leaving-date scraping is brittle and possibly against ToS
- Motivation may not survive if the data is wrong even once
- TMDB↔service catalog matching is fiddly

## Done means
Two friends in a league draft titles; one marks a soon-to-expire film watched and gains points; a different drafted title hits its expiry date and the responsible player is deducted and the title appears in the graveyard — all reflected in the live standings.

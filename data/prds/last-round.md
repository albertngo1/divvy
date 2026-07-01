## Overview
Last Round is a location-based collecting game about vanishing craft. The prompt is the news that Tokyo is down to *two* barley-tea makers — an entire city, two. Last Round turns that quiet loss into a competitive scavenger hunt: players roam their own cities to discover the last knife-sharpener, the sole remaining letterpress shop, the final analog watch-repairman, and log them into a shared living atlas. First to document a rare trade in a region claims it; everyone else can only visit.

## Problem
Stories about disappearing trades are the internet's comfort food — we read them, feel wistful, scroll on. Passive consumption, zero action. Meanwhile these places actually vanish for lack of foot traffic and attention. There's no structure that converts "aw, that's sad" into "I went there this weekend." The itch: gamify heritage-hunting so nostalgia produces real visits, and the rarer the trade, the more it's worth chasing.

## How it works
Each trade is a "card" with a rarity tier (Common: hardware store; Rare: cobbler; Legendary: two-left-in-the-country craft). To claim one you must physically be there — GPS check-in within range — and submit a photo plus a one-line note (what they make, how long they've been at it). Photos are community-verified. First verified claimant of a specific business owns its card in the atlas and appears on its plaque; the trade's *category* rarity is global, so a Legendary find rockets you up the leaderboard. Seasonal "Last Call" alerts fire when a documented business reports closing, awarding bonus points to anyone who visited before the doors shut. A map view shows your claimed collection and nearby unclaimed rarities.

## Technical approach
Stack: React Native + Expo, Supabase (Postgres + PostGIS + auth + storage) backend. Data model: `trades(id, category, rarity, name, geo point, hours, story, status)`, `claims(user, trade, photo_url, verified, ts)`, `visits(user, trade, ts)`. Discovery seeds from OpenStreetMap `craft=*` and `shop=*` tags plus Overpass API queries, giving a starting map of candidate old-trade businesses; users add missing ones. The genuinely hard part is **verification and anti-cheat**: combine GPS-radius check-in, EXIF/time freshness on photos, and lightweight community upvote confirmation before a claim counts, so nobody claims from their couch. Rarity is computed from live counts of that category within a geographic ring (PostGIS `ST_DWithin`), so "only two left" is data-driven, not guessed.

## v1 scope
- Map seeded from OSM craft/shop tags in one pilot city
- GPS check-in + photo + one-line story to log a visit
- Static rarity tiers (hand-assigned per category)
- Personal collection list of trades you've documented

## Out of scope
- Claim ownership / first-finder plaques (v2 — v1 is personal logging)
- Photo community-verification pipeline
- Data-driven dynamic rarity via PostGIS ring counts
- Push "Last Call" closing alerts

## Risks & unknowns
- Cold-start: a map with no nearby entries is dead; needs dense seeding or a launch city with rich OSM data.
- Ethics: featured shops must benefit (drive visits) and never be exposed to harassment or forced attention — needs an opt-out.
- GPS spoofing and photo reuse are the obvious cheats; v1 punts real anti-cheat, so leaderboards stay informal until v2.

## Done means
In the pilot city, a player opens the map, walks to a real cobbler seeded from OSM data, checks in within range, snaps a photo with a one-line story, and sees that trade added to their personal collection with its rarity tier displayed.

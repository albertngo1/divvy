## Overview
A monitoring service for small general contractors, architects, and permit expediters who juggle open permits across multiple municipalities. It watches each city's permit portal and pushes a single unified feed of status changes and new plan-review comments, so nobody has to manually log into six different government websites to find out a reviewer asked for a revised truss detail.

## Problem
Municipal permitting runs on a zoo of portals — Accela, Tyler EnerGov, CityView, OpenGov, plus one-off homegrown sites — each with its own login, its own layout, and no notifications. When a plan reviewer posts a correction, the clock starts, but the contractor often doesn't find out for days because *they* have to go check. Missed comments mean blown timelines and idle crews. The pain is the polling.

## How it works
You add a permit by pasting its portal URL/number and city. The service checks it on a schedule (e.g. every few hours), diffs the status, review cycle, and comment/correction list against the last snapshot, and when something changes it fires an email/SMS/ntfy push with the delta and a deep link. A dashboard lists all your permits across all cities in one table sorted by 'last activity', with a badge for 'ball in your court' vs 'waiting on city'.

## Technical approach
Stack: a Python worker (Playwright for portals that need JS/session, plain `httpx` + selectors where a stable endpoint exists) on a cron/queue, Postgres for `permit`, `snapshot`, `change_event`, and per-city `adapter_config`. The heart is a small **adapter registry**: one module per portal vendor mapping their DOM/JSON to a normalized `{status, review_cycle, comments[], next_action_owner}` schema — mirroring the 'reaction daemon scans outputs and acts' pattern but pointed at government HTML. Change detection is a stable content hash per field; notifications route through a user-config channel. Hard part is exactly the LWN 'scraper situation' tension: portals are brittle, sometimes rate-limited or behind logins, and each city is bespoke — so adapters must fail loudly (alert 'couldn't read city X' rather than silently show 'no changes').

## v1 scope
- Support exactly ONE portal vendor (Accela — widest deployment) for 2–3 cities
- Manual permit add by URL, polling every 4h
- Email notification on any status/comment change
- One flat dashboard table with 'whose turn' badge

## Out of scope
- Auto-login with stored gov credentials (start with public-status-visible permits only)
- Submitting responses back to the portal
- Billing, teams, multi-user orgs
- Mobile app

## Risks & unknowns
- Portal ToS / scraping legality varies by jurisdiction — must review and respect robots/rate limits.
- Adapters break when cities update software; maintenance is the real cost.
- Some cities gate all status behind login, shrinking the addressable set for a credential-free v1.

## Done means
For one real Accela city, adding a live public permit and having a reviewer-posted correction produce a correct notification within one polling cycle, with the dashboard badge flipping to 'ball in your court'.

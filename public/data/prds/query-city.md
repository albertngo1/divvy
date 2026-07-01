## Overview
Query City is a background service that turns your local DNS resolver's query log — from blocky or Pi-hole — into a Cities: Skylines-style isometric metropolis that builds itself over a year. Each domain is a building; query volume is height and window-lights; category decides the district. It's an ambient artifact for homelabbers: it just quietly accretes, and by December you have a poster of your household's internet life.

## Problem
Your DNS resolver sees every request every device makes, then buries it in a log that nobody ever feels. Dashboards give you a top-10 bar chart and a blocked-count. Nobody looks at a bar chart and *feels* their year. You want an artifact, not a metric.

## How it works
The service polls the resolver's query log. Every unique domain claims a lot on an isometric grid. Query count drives building height and lit windows. Category sets zoning: social = downtown glass towers, ads/trackers = a smog industrial belt that literally emits particles, news = civic buildings, shopping = malls, CDN/infra = pipes and substations. New domains break ground with a little construction animation; domains that go dormant grow vines and decay. A time slider scrubs the city across the year, and year-end exports a poster-resolution render.

## Technical approach
blocky exposes Prometheus metrics and can write a query log to a database/CSV/Redis. A small Deno poller ingests into SQLite: (domain, first_seen, last_seen, count, category). Categories come from a static mapping — the disconnect.me / Cloudflare Radar category lists, plus a tracker blocklist for the smog zone. Front-end is three.js with an orthographic camera for the iso look and instanced meshes for buildings. Layout is deterministic: hash(domain) → a stable coordinate along a space-filling (Hilbert) curve so the city grows *outward* without reshuffling existing buildings. Smog is a cheap GPU particle layer over the ad district scaled by tracker query share. The hard part is a stable, non-ugly incremental layout as thousands of domains appear over months — the Hilbert seeding plus small collision nudges is the whole game.

## v1 scope
- Static snapshot render from one day's log
- ~200 buildings, 3 zones
- Iso three.js scene, height = query count

## Out of scope
- Real-time streaming
- The year time-scrub slider (v2)
- Poster export, multi-resolver support

## Risks & unknowns
DNS logs are deeply personal — everything stays local, the log never leaves the box. Layout churn could make it ugly. blocky's log format may change under you.

## Done means
Point it at your blocky query log and get an isometric city where the busiest domains are the tallest towers and trackers form a visibly smoggy district — and re-running it a week later grows the city outward without moving a single existing building.

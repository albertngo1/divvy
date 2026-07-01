## Overview
House Tartan is a background daemon that quietly weaves a personal plaid over a year — one thread per day, drawn from an ambient signal about your life. Unlike a Strava-style year-in-review slide, the artifact is *physical-ready*: at year end you export a proper tartan sett you can send to a real mill and wear. For anyone who wants their data exhaust to become an heirloom instead of a slide.

## Problem
Our daily data vanishes. Year-in-review is a one-off animation you watch once and forget. There's no slow, ambient artifact that accumulates while you ignore it and rewards you with something you can hold. And a straight bar-chart-of-the-year is ugly; nobody hangs it up.

## How it works
Each day a scheduled job samples one signal — dominant weather condition, Garmin resting HR bucket, or top-used app — and maps it to a **thread colour + stripe width**. It appends that thread to *both* warp and weft, so the plaid grows as a square that fills in over 365 days. It renders a real tartan (2/2 twill, diagonal wale) as a PNG, and mischievously assigns you a "clan name." You glance at it whenever; by Dec 31 you have a full sett.

## Technical approach
launchd/cron daily job in Node. Data source is pluggable: Open-Meteo's free historical API, the Garmin MCP for resting HR, or `lsappinfo` for foreground app. A curated 12-colour heritage palette keeps output harmonious across 365 unknown inputs. Rendering: draw warp threads, then weft with a 2/2 twill alpha mask on node-canvas to get the woven diagonal (not a flat checkerboard). Append-only `threads.json` (one row per day) makes it fully reproducible and resumable. Export an SVG/thread-count "sett" spec that real tartan mills accept. The hard part is making the twill actually *read as cloth* — the diagonal wale and thread shading — and constraining the palette so a random year doesn't turn to mud.

## v1 scope
- One hardcoded signal (weather)
- Append one thread/day to threads.json
- Render tartan PNG on demand
- Fixed 12-colour palette
- Clan-name generator

## Out of scope
- Actual milling / e-commerce
- Multi-signal blends
- Interactivity or web UI
- Live scarf preview

## Risks & unknowns
- Palette can go muddy over a full year → constrain hard
- Twill rendering is fiddly to make look real
- It literally takes a year to prove out (but that ambience *is* the point)

## Done means
Run the daemon over 30 simulated days from real weather history, get a coherent tartan PNG that reads as woven cloth, and confirm threads.json replays byte-identical output.

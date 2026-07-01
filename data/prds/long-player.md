## Overview
Long Player is a background daemon that composes one short movement of ambient music per day, seeded by the shape of that day. Over 365 nights it silently assembles a single evolving album — a slow, listenable diary you never had to write. For people who want a keepsake of a year without journaling.

## Problem
Years blur together; the artifacts we keep (photos, step counts) are dashboards, not experiences. Nothing captures the *texture* of a year in a form you'd actually sit and enjoy. And the effort cost of any 'year in review' is why people don't make one. It should generate itself.

## How it works
Each night a cron job gathers the day's signals — weather, sleep and body-battery, calendar density, git commits, steps — and maps them onto musical parameters: overall mood/key from recovery, tempo from activity, density from how busy the calendar was, a recurring motif per weekday, timbre from the season. It renders ~30 seconds and appends it to a growing track, crossfading into yesterday. You can scrub the whole album at any point; a bad day is a dissonant passage, a great week swells. On Dec 31 you have a finished long-player.

## Technical approach
Stack: Node cron on the always-on Mac mini + Strudel/TidalCycles (or Sonic Pi via OSC) for pattern synthesis, rendering to stems with SuperCollider or offline Web Audio, stitched with ffmpeg. Data sources: local Garmin MCP (`get_sleep_data`, `get_body_battery`, `get_steps_data`), a weather API, `git log` across repos, and `.ics` calendar counts. Data model: `days(date, mood, tempo, density, motif_seed, wav_path)` in SQLite; a deterministic mapping function `signals → synth params` so a day always renders the same. Rendering pipeline concatenates daily 30s clips with 3s equal-power crossfades. The genuinely hard part is musical: keeping 365 procedurally-generated clips *coherent and pleasant* as one piece — solved with a fixed harmonic scaffold (slowly modulating key center over the year) that all days must sit inside.

## v1 scope
- Nightly render of one 30s clip from 3 signals (sleep, steps, weather)
- Fixed scale/key, mood picks the chord voicing
- Append + crossfade into a single growing `year.wav`
- Static local web page with a play bar

## Out of scope
- Real-time listening, streaming, sharing
- Vocals, lyrics, ML music models
- Multi-instrument arrangement beyond a pad + arp

## Risks & unknowns
- Musical quality — 'data-driven' easily sounds like random noise
- Signal gaps (no Garmin data on a given day) need graceful defaults
- A year is a long feedback loop; must be tuned on synthetic backfilled days first

## Done means
Backfilling 30 days of real signals produces a single continuous ~15-minute track that plays without clicks, where a visibly bad-recovery day is audibly distinguishable from a great one on a blind listen.

## Overview
Test Card is a fullscreen ambient art piece for a spare monitor. It draws a procedural Philips PM5544–style broadcast test card whose every element is bound to live health data from the world's free public IPTV playlists. It is a mortality clock for one rotting corner of the internet, rendered as the most nostalgic object in broadcasting.

## Problem
The free-stream ecosystem (iptv-org and friends: thousands of community-listed channels) dies constantly — links rot daily, whole countries go dark for a week and come back. That churn is a real, beautiful, ongoing signal that only exists as red rows in a CI job. Meanwhile every ambient monitoring artifact looks like Grafana. This makes the decay into a thing worth staring at.

## How it works
A background worker walks a sample of the public playlist and cheaply probes each channel: DNS + TCP handshake time, a HEAD/short GET on the `.m3u8`, then `ffprobe` on the first segment with a 3s timeout to read resolution and bitrate. Nothing is decoded to pixels; nothing is stored beyond metadata. The screensaver binds that table to the card: **color-bar widths** = share of alive streams per continent; **circle-grid warp** = median handshake latency; **the resolution wedge** = distribution of stream heights (the wedge literally gets coarser as the world's free TV gets worse); **corner ident text** = the name and timestamp of the last channel to die. The reference tone starts at 1kHz and **detunes by cents proportional to today's death rate**, with a low hum layer per dark region. During a long session the card degrades in real time — rolling bars, chroma bleed, and eventually a slow fade to snow if enough channels drop.

## Technical approach
Go or Rust worker + `ffprobe`; source is the public iptv-org m3u index plus its per-country lists. Store: SQLite `channel(id, url, country, last_ok_at, consecutive_fails, res_h, bitrate_kbps, rtt_ms)` with an hourly rollup table the renderer reads. Politeness is a design constraint, not an afterthought: global cap ~2 req/s, jittered, per-host cooldown, cached DNS, never more than the first segment, exponential backoff on a failing host, and a hard rule that no media content is retained or displayed. Rendering is a single WebGL fragment shader — the card is entirely SDFs (circles, wedges, bars, castellations), so the whole visual state is a ~40-float uniform block, cheap enough for 60fps or a 5fps idle mode. Audio via Web Audio: one oscillator + filtered noise, `detune` driven by one float. Ships as a fullscreen Electron page plus a `launchd`/systemd worker (a real macOS `.saver` bundle is a v2 problem). The hard part is probing thousands of URLs without looking like abuse, and amplifying the statistics enough that tonight's card is *visibly* not last night's.

## v1 scope
- 200 sampled channels, hourly probe pass
- SQLite log with a death timeline
- One procedural card, 4 data-bound elements
- Detuning reference tone
- Browser fullscreen only

## Out of scope
Decoding or playing video, a channel browser, alerting, mobile, any redistribution of stream URLs.

## Risks & unknowns
Many hosts geo-fence or block probes, producing false deaths that need a "blocked vs dead" distinction. `ffprobe` timeouts can eat a scheduling window. Aesthetic risk: the aggregate stats may be too stable to look alive, forcing exaggerated mappings.

## Done means
Leave it running overnight; the next morning the card is visibly different from yesterday's screenshot, the tone is measurably detuned, and the SQLite log can name exactly which channels went dark while you slept.

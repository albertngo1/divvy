## Overview
Generation Loss is a background daemon + wallpaper that turns a single chosen image into a year-long Portrait of Dorian Gray. Each day, the image is recompressed one more JPEG generation; how *badly* it degrades is driven by a personal metric you want to keep in check (screen time, unread inbox, cigarettes, minutes doomscrolling). For anyone who wants a visceral, ambient consequence for a habit — not a graph, a rotting picture.

## Problem
Habit trackers are line charts you stop looking at. Generation loss — the ugly compounding decay of recompressing a JPEG over and over (see the Regressive JPEGs post) — is visceral and irreversible-feeling in a way a number never is. Nobody has weaponized it as a slow, personal mirror.

## How it works
On setup you pick a seed image and a metric source. A daily cron reads yesterday's metric, maps it to a 'damage' amount, and re-encodes the *current* generation at a correspondingly nasty JPEG quality using deliberately coarse quantization tables (so decay is blocky and legible, not just soft). The result becomes today's desktop wallpaper. A good day spends little/no damage — and a *great* day can restore from a recent, cleaner checkpoint, so recovery is visible too. A scrubbable filmstrip shows all ~365 generations; the year-end artifact is the full decay timeline plus wherever the image ended up.

## Technical approach
Python + Pillow (or libjpeg directly for custom quantization tables). State: a checkpoint chain of prior generations on disk (`gen_000.jpg` … `gen_365.jpg`) so recovery = re-seed from an earlier file. Metric adapters: Garmin/Apple Screen Time export, IMAP unread count, a manual `logged` CLI, or macOS Screen Time SQLite. Damage curve: a per-day quality decrement budgeted so a *median* year lands the image at heavy-but-not-total mush (~quality 5), preventing it from bottoming out in February. Wallpaper set via `osascript`/`feh`/`swaybg`. The hard part is the decay budget: tuning the metric→quality mapping and a floor so the artifact stays interpretable and emotionally paced across a full year rather than saturating early.

## v1 scope
- One seed image, one manual metric (`genloss log 45`)
- Daily recompress with fixed coarse quant tables
- Set wallpaper on macOS
- Filmstrip HTML page of all generations to date

## Out of scope
- Auto metric integrations (Garmin/Screen Time) — v2
- Recovery/checkpoint restore — v2
- Mobile / lock-screen versions
- Multi-image montages

## Risks & unknowns
- Decay pacing: too fast = mush by spring, too slow = boring
- Compounding recompression may plateau; may need forced quant escalation
- Emotional read: could feel punishing rather than motivating

## Done means
Running the daily job 30 times with logged metrics produces a visibly monotonic decay from generation 0 to 30, the current wallpaper updates each run, and the filmstrip page renders all generations in order with their metric + quality labels.

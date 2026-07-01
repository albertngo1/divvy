## Overview
Cambium is an ambient generative-art wallpaper (browser tab or macOS live desktop) that draws exactly one concentric growth ring per day. Over 365 days it accretes into a cross-section of a tree trunk — a quiet, private annual report you never asked for but can't stop reading. For people who want their year to *leave a mark* without journaling.

## Problem
The most meaningful ambient artifacts are the ones that build themselves while you ignore them. Habit trackers demand daily input and shame you when you lapse; year-in-review dashboards arrive all at once, disconnected from the lived days. Nobody has an artifact that is *simultaneously* passive, beautiful, and legible as a whole year at a glance. A tree doesn't journal — it just grows a ring — and you can read a drought from twenty feet away.

## How it works
Each midnight, Cambium samples that day's ambient telemetry, condenses it to a few scalars, and lays down a new outermost ring. Ring **width** = how full the day was (steps, active minutes, commits). **Color/hue** = dominant mood proxy (weather, sleep score). **Darkness of the latewood band** = stress/late-night activity. Anomalies punch through as visible events: a sleepless-uptime week leaves a dark scar; a vacation with zero commits leaves a pale, wide, fast-growth band; a sick day leaves a pinched false ring. You can hover any ring to see the date and the numbers behind it. The image only ever *grows* — it is append-only, like real wood.

## Technical approach
Static web app: Canvas2D (or WebGL for the fancy grain shader). Append-only day log in IndexedDB: `{date, width, hue, latewood, events[]}`. A tiny Node/cron collector writes one JSON line per day by pulling from local sources: Garmin MCP (steps, sleep, stress), `git log --since` across a watched folder, wttr.in for weather, `uptime`/`last reboot` for machine wakefulness. Rendering: rings are offset concentric closed curves; add believable grain with radial Perlin noise perturbing each ring's radius, and simulate earlywood→latewood by ramping stroke darkness across each ring's width. The genuinely hard part is making a *year* of rings stay legible and organic — spacing them non-linearly (inner rings compressed) and avoiding moiré — plus deterministic, resumable rendering so a mid-year reinstall reconstructs the exact same trunk from the log.

## v1 scope
- One telemetry source (git commits) → ring width only
- One ring appended per real day via cron; manual `--backfill` from git history to seed
- Canvas render to PNG wallpaper + hover tooltip in a debug HTML view
- Deterministic replay from the JSON log

## Out of scope
- Garmin/weather/stress inputs (v2)
- Live desktop shader, screensaver packaging
- Multi-year meta-trunks, sharing/export gallery

## Risks & unknowns
- Rings may look muddy or fake; grain tuning is most of the art budget
- Telemetry gaps (travel, dead cron) must render as honest missing/false rings, not crashes
- Privacy: the artifact is legible — a dark year is visible to anyone glancing at your screen

## Done means
Running the collector daily for two weeks produces a 14-ring trunk PNG where a manually-verified high-commit day is visibly a wider ring than a zero-commit day, and deleting/reimporting the log reproduces a byte-identical image.

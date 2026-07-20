## Overview
Ostinato is a self-hosted CLI/TUI for homelabbers who hate crontab syntax and love a beat. You compose scheduled jobs as a looping percussion pattern in a tiny live-coding language; each note is a real job at a real time, and the loop compiles to actual systemd timers (or crontab). Bonus: it can play your whole day's schedule back as audio so you literally hear when your server is busy.

## Problem
Cagire (Forth-based live-coding sequencer) is delightful; cron is opaque and easy to fat-finger. The overlap nobody built: scheduling *is* rhythm — a 24-hour loop with hits at offsets. Treating a crontab as a step sequencer makes density, collisions, and dead hours visible and audible instead of buried in five-field lines.

## How it works
A 'track' is a named job (backup, prune, tls-renew) with a sound. A 'pattern' maps positions on a timeline (day = one bar, steps = hours or minutes) to hits. You live-edit in a small stack language: `backup: 02:00 14:00 every 6h` places hits; the TUI shows a grid with tracks as rows and time as columns. Hitting compile writes/refreshes systemd `.timer` units (or a crontab block) idempotently, tagged so Ostinato owns only its own. A 'play' command sonifies the next 24h — each track's sound fires at its scheduled offset over a compressed few-second loop, so overlapping jobs audibly clash (a cue to stagger them).

## Technical approach
Rust or Go TUI (ratatui/bubbletea). A minimal RPN/Forth-ish parser turns pattern lines into a set of concrete fire-times; a scheduler backend renders those to systemd `OnCalendar=` expressions (preferred, timezone-safe) or crontab lines, writing to `~/.config/systemd/user/` and running `systemctl --user daemon-reload`. State lives in a single `ostinato.toml` (tracks, sounds, patterns) that is the source of truth; generated units carry a `# ostinato-managed` header and hash so re-compile diffs cleanly and never clobbers hand-written units. Audio playback maps each track to a short WAV and schedules them on a compressed timeline via a simple mixer (rodio/oto). Hard part: faithfully round-tripping arbitrary `OnCalendar`/cron expressions back into grid positions for editing, and idempotent, non-destructive unit management.

## v1 scope
- `ostinato.toml` model: tracks, sounds, patterns
- Pattern mini-language → concrete fire-times → systemd `.timer` units, idempotent
- TUI grid view (tracks × time) with edit + compile
- `ostinato play` sonifying the next 24h with per-track sounds

## Out of scope
- Distributed/multi-host scheduling, job execution monitoring (that's systemd's job)
- Full arbitrary cron round-trip editing (v1 owns only Ostinato-authored units)
- GUI, cloud sync

## Risks & unknowns
- Writing systemd units is powerful and dangerous; must never touch non-managed units
- The 'hear your schedule' bit may be a gimmick users try once
- Round-tripping complex calendar expressions to a grid is genuinely fiddly

## Done means
Composing a pattern with two overlapping jobs writes valid `.timer` units that `systemctl --user list-timers` shows firing at the intended times, re-compiling is a no-op diff, and `ostinato play` audibly overlaps the two clashing hits.

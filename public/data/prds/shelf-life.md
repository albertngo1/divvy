## Overview
A CLI skill tracker for people with 40 unfinished courses and no shipped projects. It borrows Project Zomboid's skill-book economy exactly: books never award XP. They award a *multiplier* that only converts to XP when you practice inside its window — and expires unused otherwise.

## Problem
Every learning tracker rewards consumption, because consumption is what's easy to log. Finish a video, get a streak. This trains the exact pathology it should treat: tutorial hell, where reading feels like progress and the practice never happens. The itch isn't "I don't read enough," it's "I have no idea how much of what I read I ever used," and nothing tells you.

## How it works
`shelf read "DDIA" ch5 --skill postgres --minutes 45` creates a **grant**: multiplier 3.0, 6 practice-hours of capacity, expires in 14 days. Your level bar does not move. `shelf practice postgres --minutes 90` consumes grant capacity and awards `minutes × multiplier` XP; practice with no live grant still counts, at 1×.

When a grant expires unburned, it is logged as **wasted pages** with its real cost — the minutes you spent reading. `shelf shelf` prints the pile: what's live, what's rotting, and your read:practice ratio.

The gate is the mischief. `shelf read` *refuses* while you hold more than a configurable number of unburned grant-hours: "You have 11.5 unburned hours across 3 books. Practice 4 hours or let something expire." You can `--force`, and the forced count appears in the weekly digest.

XP decays PZ-style, 60-day half-life, so levels visibly slide backward on abandoned skills.

## Technical approach
Python + Typer + SQLite (`~/.shelf/shelf.db`), tables: `skills(id, name, xp, path_globs, lang_tags)`, `grants(id, skill_id, source, multiplier, hours_cap, hours_burned, expires_at, minutes_read, forced)`, `sessions(id, skill_id, minutes, multiplier_applied, xp, source)`. Decay is computed lazily at read time from `last_touched` — no cron.

Auto-burn is what makes it survive week two, since manual logging always dies. Two importers: (1) a `post-commit` git hook that maps changed paths against each skill's `path_globs` and credits authored minutes estimated from commit spacing within a session window; (2) a poller against self-hosted **wakapi**'s Wakatime-compatible `/api/v1/users/current/summaries?range=today` endpoint, mapping its per-language durations onto `lang_tags`. Reading time can import from Readwise's `/api/v2/highlights/` (highlight timestamps bracket a session) — a decent proxy for "was actually reading."

Hard part is not code, it's economy design: multiplier size, capacity, and expiry window jointly decide whether the tool feels like a coach or a nag. Needs a config profile plus a `shelf simulate` command that replays your last 90 days of git history under different parameters before you commit to them.

## v1 scope
- `read`, `practice`, `shelf`, `level` commands
- One hardcoded grant recipe: 3× / 6h / 14 days
- The refusal gate with `--force`
- Manual practice logging only
- Wasted-pages report

## Out of scope
Git hook, wakapi, Readwise, decay, `simulate`, web UI, any sync.

## Risks & unknowns
Self-reported reading minutes are the weakest input and the one the gate depends on. The refusal may just get `--force`d into meaninglessness. Auto-detected practice from commits may over-credit trivial edits. And it may simply feel bad to watch a book rot — which is arguably working as designed, but users quit tools that feel bad.

## Done means
One real fortnight where the gate blocks a `read` at least once, a grant expires into the wasted-pages report with its minutes attached, and the read:practice ratio it prints is one the user recognizes as true about themselves.

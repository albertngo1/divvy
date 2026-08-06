## Overview
A menubar app that logs the exceptions you grant yourself — "skipping the gym this week," "eating out until payday," "leaving this hack in until Friday" — each with a mandatory expiry. When the timer runs out it asks one question, and over time it builds a survival curve of your own willpower.

## Problem
Nobody breaks a habit in one decision. They grant a temporary exemption, and the exemption silently becomes the new baseline because nothing ever reminds them it was supposed to end. Habit trackers count streaks and are useless the moment you break one; they have no concept of a deliberate, bounded exception. The interesting data — how long your temporary things actually last — is never recorded because the moment of granting is never captured.

## How it works
Global hotkey opens a one-line capture: type `no running until sunday` or `takeout — 2 weeks`. A natural-language date parser splits the text from the duration; the exception goes into a short "currently suspended rules" list visible in the menubar dropdown, so it stays on screen instead of in your head. At expiry, a notification with three buttons: **Reverted** / **Renewed (+how long)** / **This is permanent now**. Renewals chain to the parent rather than creating a new record, so the true duration is the whole chain. Ignoring the notification for 48h auto-labels it *forgotten* — itself a signal.

## Technical approach
- **Stack:** Tauri v2 menubar app (Rust core, tiny web UI), SQLite via `sqlx`, local-only, no account.
- **Data model:** `exception(id, text, category, granted_at, expires_at, parent_id, verdict ENUM{reverted,renewed,permanent,forgotten}, closed_at)`. Renewal chains resolve to a root id.
- **Duration parsing:** a `chrono`-style NL date parser for "til friday," "two weeks," "end of month," with a visible parsed-preview so it's never wrong silently.
- **Key algorithm:** Kaplan–Meier survival estimation per category with **right-censoring** for still-open exceptions — without censoring, open-ended exceptions (the worst ones) are invisible and the stats lie optimistically. Report median chain duration + a survival curve, and a per-category comparison ("food exceptions: median 4 days. Exercise exceptions: median 26.").
- **Recidivism:** TF-IDF cosine (later: a small local embedding model) between a new exception's text and closed ones; if similarity > threshold, the capture box says "granted 6 times before; median actual length 41 days" *before* you commit.
- **Hard part:** capture friction. If logging takes more than four seconds you won't do it at the exact moment you're rationalizing — which is the only moment the data exists.

## v1 scope
- Hotkey capture with duration parse + preview
- Menubar list of active exceptions
- Expiry notification with 3 verdict buttons
- One stat: median actual duration across all closed chains

## Out of scope
Sync, mobile, calendar/health integrations, categories beyond a free-text tag, sharing.

## Risks & unknowns
The stats need ~30 closed exceptions before they say anything — a long cold start. The app may also read as a guilt machine; the tone of the expiry prompt is load-bearing.

## Done means
After 60 days of real use it can print a Kaplan–Meier median for at least two categories, and correctly warn on a repeat exception at capture time before you confirm it.

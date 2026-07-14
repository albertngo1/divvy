## Overview
Recurring is a browser roguelike whose dungeon *is* your upcoming work week, pulled live from your calendar. It's for knowledge workers who dread their week and want to look at it slightly sideways — turning the passive doom-scroll of a packed calendar into something you actually try to *beat*.

## Problem
Your calendar is a wall of colored blocks you consume with rising dread. It rewards nothing, teaches nothing, and hides the shape of the week (where the real crunch is, which recurring meeting is quietly eating your life). A game frame makes the structure legible and, crucially, a little funny.

## How it works
Each event becomes an encounter. Duration → monster HP; attendee count → damage; "recurring" flag → a named recurring enemy that levels up every week you survive it; overlapping/adjacent events → elite packs with no rest between. Open blocks are corridors; a genuinely free ≥90-min gap is a save room that restores focus (your HP). You spend a small daily budget of **Focus tokens** to "win" encounters; run out and you take damage (stress). At week's end you get a run summary: floors cleared, biggest hit taken, your nemesis recurring meeting. It's read-only theater over your real schedule — playing doesn't move meetings.

## Technical approach
- **Stack:** static SPA (Svelte + TypeScript), no backend; auth via Google Calendar OAuth or a pasted `.ics` URL parsed client-side (`ical.js`).
- **Generation:** deterministic seed = ISO week + calendar id, so the run is stable Monday→Friday and shareable. Map layout from a simple grammar mapping the day's event graph to rooms; conflict detection via interval overlap.
- **Balance:** monster stats are pure functions of event metadata (duration, attendees, recurrence, title keywords → enemy "type": `sync`, `review`, `all-hands` = boss). An offline lookup table keeps it snappy.
- **Data model:** normalized events → encounters[] with {hp, dmg, tags, room}; run state in localStorage.
- **Hard part:** making it *fun* rather than a reskinned agenda — the token economy has to create real choices (do I spend Focus surviving the 10am, or bank it for the 3pm boss?).

## v1 scope
- Paste one `.ics` URL; render the current week as a linear 5-room-per-day gauntlet.
- Duration→HP, recurring→named enemy, gaps→save rooms.
- End-of-week text summary + emoji share card.

## Out of scope
- Two-way calendar edits, Google OAuth (start with `.ics`), multiplayer, mobile app.
- Actual inventory/loot/leveling meta beyond the recurring-enemy gag.

## Risks & unknowns
- Could read as a gimmick agenda; the token decisions must carry it.
- Calendars are messy (all-day events, declined invites, tentative) — needs sane filtering.
- Privacy nerves about titles; keep everything client-side and offer title redaction.

## Done means
Pasting my real `.ics` produces a stable week-long run where my daily standup shows up as the same named recurring enemy across weeks, back-to-back meetings render as an unbroken elite pack, and my one free afternoon is a save room — and the seed reproduces the identical run on reload.

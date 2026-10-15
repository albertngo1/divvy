## Overview
Over Hours is a personal data visualization for knowledge workers who suspect they are overworked but can't see it. It redraws your week in the U.S. FMCSA Record of Duty Status format: the 24-hour, four-row step graph every long-haul trucker fills in. Then it audits you against the federal Hours-of-Service rules as if you were a truck.

## Problem
Time trackers produce pie charts that feel abstract. The trucker log grid is a 90-year-old visual language built specifically to make fatigue legible to an inspector at a glance, and it applies those limits without sympathy. Seeing "14-HOUR VIOLATION — OUT OF SERVICE" stamped across your Tuesday lands harder than any chart.

## How it works
1. Connect sources: Google Calendar (meetings = On Duty), macOS Screen Time / RescueTime (focused app use = Driving), Apple Health or Garmin sleep (= Sleeper Berth), everything else = Off Duty.
2. A classifier assigns every minute to one of the four duty statuses, and you can drag the boundaries.
3. The log renders as an authentic paper-style grid, one sheet per day, with a remarks line auto-filled from calendar titles ("Wed 14:00 — Q3 planning, Conference Rm B").
4. A rules engine checks 49 CFR 395: 11h driving, 14h window, the 30-min break after 8h driving, 10h off-duty reset, 60/70h over 7/8 days, and the 34h restart. Violations get a red stamp and a citation.
5. An "Inspector" view shows a 30-day roll-up and how many hours you'd need to stop to be legal again.

## Technical approach
- **Stack:** SvelteKit with D3. The grid is drawn as SVG on a background that mimics the paper log.
- **Ingest:** Google Calendar API; the `knowledgeC.db` / Screen Time SQLite on macOS via a small local Python helper; Health export XML.
- **Data model:** `segment(start, end, status, source, note)`. The rules engine is a pure function over a sorted segment list, with a sliding window for the 8-day cap.
- **Hard part:** the 14-hour window and the split-sleeper provisions (7/3 and 8/2 pairings) are tricky interval logic. Port the rules from an open-source ELD compliance library, or write property-based tests from FMCSA's published examples.

## v1 scope
- Calendar plus sleep import only
- Daily grid render
- 11h, 14h and 70h/8-day checks
- Export one day as PNG

## Out of scope (for now)
- Real ELD integration
- Team or employer dashboards (deliberately — this is a personal tool, not surveillance)
- Split-sleeper rules

## Risks & unknowns
- Duty-status classification is subjective, since email at 11pm could count as On Duty or Off Duty.
- macOS Screen Time DB access needs Full Disk Access.
- The novelty could wear off once you've seen your week once. Weekly emailed "inspection reports" may keep it alive.

## Done means
Importing one real week renders 7 correct-looking log sheets. A day with 15h between first meeting and last focused session shows a 14-hour violation stamp, and the rules engine passes 20 unit tests built from FMCSA guidance examples.

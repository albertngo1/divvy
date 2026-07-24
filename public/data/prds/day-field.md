## Overview
Day Field is a macOS menubar app for one person that repaints your desktop wallpaper each morning as a generative abstract painting of *today's calendar* — deliberately non-legible ambient art, not a dashboard. It's for anyone tired of glancing at a grid of meeting boxes and wanting to *feel* the shape of their day instead of reading it.

## Problem
Calendars are anxiety machines: a wall of colored rectangles you decode all day. Meanwhile 'writing by hand is good for your brain' and 'it's getting harder to focus' are both trending — the itch is the same, a wish for something calmer and more human than another optimized productivity surface. Your schedule is a rich personal-data source that's only ever rendered as a spreadsheet. What if it were rendered as a painting you happen to live behind?

## How it works
At wake/login and on calendar change, Day Field reads today's events and composes a vertical stack of horizontal color bands, Rothko-style: each band is a time block, its **height** = duration, its **hue** = event category (work/personal/health/free), its **saturation & edge-softness** = focus vs fragmentation (three back-to-back 30-min calls render as one agitated, hard-edged, higher-frequency band; a two-hour open gap becomes a soft, luminous, feathered field). Empty morning = a wide breathing band of light. It sets this as your wallpaper. You never see event titles — only the day's weather.

## Technical approach
Swift menubar app. Calendar via EventKit (local Calendar.app / iCloud / Google through the system account) — no network, fully offline. Rendering: Core Graphics / Metal into an offscreen canvas at display resolution, then `NSWorkspace.setDesktopImageURL`. The painting engine maps the day to bands, then applies layered noise (simplex fields for the soft glow, higher-frequency perlin ridges for agitation) and a bloom pass so edges bleed like pigment. The genuinely hard part is the *color grammar*: keeping the result beautiful and legible-by-feel across wildly different days — an empty day, a nightmare 12-meeting day, an all-personal weekend — without it looking like a bar chart. Seed the RNG from the date so a given day is stable but every day differs.

## v1 scope
- Read today's events from EventKit
- Map to bands (duration→height, one fixed category→hue palette)
- Rothko soft-field render + set wallpaper on login and every 30 min
- One 'repaint now' menubar button

## Out of scope
- Multi-day / week views
- Custom palettes, artist-style presets
- Windows/Linux, phone lock screens
- Any text or clickable events

## Risks & unknowns
Could read as noise rather than art; needs taste iteration on the palette and noise mix. Multi-monitor and dark-mode contrast handling. People may want *some* legibility — resist it in v1. Wallpaper-setting APIs are finicky across Spaces.

## Done means
On three visibly different days (empty, moderate, brutal), Day Field produces three distinct paintings the user finds genuinely nice to look at, and a stranger shown the images can correctly rank which day was busiest without being told how.

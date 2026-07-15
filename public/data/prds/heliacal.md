## Overview
Heliacal is an ambient desktop artifact for sky nerds and anyone charmed by the Nature story on the Maya astronomer. It computes the real position and phase of Venus every night for your location and renders a single glyph in a Dresden-Codex-inspired visual language. Left alone for a year, it draws itself into a complete Venus almanac page — the same astronomical record the Maya kept by hand, generated automatically.

## Problem
Astronomy wallpapers are either static prettiness or live star maps you forget to look at. Nothing captures the thing that made ancient sky-watching profound: *accumulation over a long cycle*. Venus's 584-day synodic period and its dramatic disappearances/reappearances (heliacal rising) are invisible to modern eyes glued to screens. There's no quiet keepsake that rewards a year of patience with a single, meaningful object.

## How it works
Each night after sunset Heliacal computes Venus's elongation from the Sun, its illuminated phase, magnitude, and whether it's a morning or evening star — and detects the four key events the Maya obsessed over (heliacal rising, superior conjunction, etc.). It paints one column-glyph: a stylized crescent whose fill = phase, whose height on the strip = elongation, colored for morning vs evening star, marked when Venus vanishes into or emerges from the Sun's glare. Glyphs accrete left-to-right into a scrolling codex page you can set as wallpaper or print as a poster at year's end. A tiny footer renders the date in Maya Long Count for flavor.

## Technical approach
Stack: Python + Skyfield with the JPL DE421 ephemeris (no network needed after install), scheduled nightly via cron/launchd. Given observer lat/long, compute Sun and Venus apparent positions, angular separation (elongation), phase angle → illuminated fraction, and altitude at civil dusk. Heliacal rising approximated via an arcus-visionis threshold (Sun ~5–8° below horizon, Venus above extinction-adjusted visibility). Rendering is SVG (one `<g>` glyph appended per night) rasterized to PNG for wallpaper. Long Count date via a fixed GMT-correlation offset from the Julian Day Skyfield already provides. **Hard part:** a defensible heliacal-visibility model — atmospheric extinction and arcus visionis are genuinely fiddly; v1 uses a documented approximation and flags events as 'predicted.'

## v1 scope
- One hardcoded observer location
- Nightly glyph: phase + elongation + morning/evening color
- Append to a single growing SVG/PNG strip
- Superior/inferior conjunction detection only

## Out of scope
- Other planets, Moon, eclipses
- Rigorous extinction/refraction modeling
- Interactive UI (it's a set-and-forget wallpaper)

## Risks & unknowns
- Heliacal-rising accuracy will be approximate and may annoy purists
- Long Count correlation constant is debated (pick GMT 584283, document it)
- A year is a long feedback loop to validate the payoff

## Done means
Run once, it emits tonight's Venus glyph with correct phase/elongation and a Long Count date; run across a simulated 30-day span (fast-forwarded), the strip shows 30 legible glyphs whose phase and morning/evening coloring match a reference ephemeris.

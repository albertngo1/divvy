## Overview
Resonance is an ambient menubar audio toy — a generative radio station whose source material is the real cosmos. It streams a slow, ever-shifting piece built from actual multi-planet exoplanet systems in the NASA Exoplanet Archive, drifting from one system to the next like a station losing signal. Orbital mean-motion resonances become musical intervals; the timing wobble that betrays unseen moons becomes rhythmic swing. For anyone who wants background music that's genuinely *from somewhere* and never repeats.

## Problem
Most generative-ambient toys are pretty noise with no referent. TRAPPIST-1 was famously sonified once as a stunt and then forgotten — yet there are ~1000 known multi-planet systems no one has ever heard. Meanwhile the week's headline (astronomers spotting the first exomoon via transit-timing variations) hands us a fresh, evocative musical hook: a hidden moon literally makes a planet's clock breathe.

## How it works
Each session, Resonance 'tunes in' to a real system. Every planet becomes a voice whose orbital period sets its beat interval, mapped into a chosen scale so resonant pairs (2:1, 3:2) land as consonant intervals and near-resonances shimmer as beating. Transit-timing-variation residuals modulate each voice's swing and detune — a suspected moon makes a voice waver. The station slowly crossfades between systems. The menubar shows the current system name and a tiny live orrery. Over a year it logs every system it has played into a personal 'almanac' plate — an accreting keepsake of your listening.

## Technical approach
Swift menubar app with AudioKit (Electron + Web Audio as a fallback). Data: the NASA Exoplanet Archive TAP API (`pscomppars` table) pulled once and cached as SQLite; periods, multiplicities, and resonance ratios computed offline. Synthesis: simple FM/plucked voices; a global tempo derived from period ratios (log-compressed so a 12-year Jupiter and a 3-day hot-Jupiter coexist listenably). A per-day deterministic seed makes today's mix reproducible and shareable. Hard part: mapping raw multi-decade periods to a single listenable tempo and scale without collapsing into mud, and crossfading smoothly between systems with different voice counts.

## v1 scope
- Cached local copy of confirmed multi-planet systems
- Period→tempo + resonance→interval mapping, one scale
- 4–6 FM voices, continuous playback with system crossfade
- Menubar item showing current system name

## Out of scope
- User-composable synthesis / effect racks
- Real-time archive updates on new discoveries
- The year-long almanac keepsake export (post-v1)

## Risks & unknowns
- Period-to-tempo mapping may sound arbitrary rather than beautiful
- Risk of reading as a TRAPPIST-1 sonification rerun without the drift/TTV angle landing
- Sparse or noisy TTV data for most systems

## Done means
Launching the app plays continuous audio derived from a real archived system, the menubar names it, and it audibly crossfades to a different real system within a few minutes — with the same daily seed producing the same opening mix on relaunch.
